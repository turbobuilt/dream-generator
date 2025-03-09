// Copyright (C) 2023-2024 Intel Corporation
// SPDX-License-Identifier: Apache-2.0

#include <algorithm>
#include <ctime>
#include <iostream>
#include <fstream>
#include <random>
#include <string>
#include <vector>
#include <cmath>
#include <filesystem>
#include <cassert>

#include "openvino/runtime/core.hpp"
#include "openvino/pass/manager.hpp"
#include "openvino/core/preprocess/pre_post_process.hpp"

#include "cxxopts.hpp"
#include "scheduler_lcm.hpp"
#include "lora.hpp"
#include "imwrite.hpp"

ov::Tensor randn_tensor(uint32_t height, uint32_t width, bool use_np_latents, uint32_t seed = 42) {
    ov::Tensor noise(ov::element::f32, {1, 4, height / 8, width / 8});
    if (use_np_latents) {
        // read np generated latents with defaut seed 42
        const char * latent_file_name = "../scripts/np_latents_512x512.txt";
        std::ifstream latent_copy_file(latent_file_name, std::ios::ate);
        OPENVINO_ASSERT(latent_copy_file.is_open(), "Cannot open ", latent_file_name);

        size_t file_size = latent_copy_file.tellg() / sizeof(float);
        OPENVINO_ASSERT(file_size >= noise.get_size(), "Cannot generate ", noise.get_shape(), " with ", latent_file_name, ". File size is small");

        latent_copy_file.seekg(0, std::ios::beg);
        for (size_t i = 0; i < noise.get_size(); ++i)
            latent_copy_file >> noise.data<float>()[i];
    } else {
        std::mt19937 gen{static_cast<std::mt19937::result_type>(seed)};
        std::normal_distribution<float> normal{0.0f, 1.0f};
        std::generate_n(noise.data<float>(), noise.get_size(), [&]() {
            return normal(gen);
        });
    }
    return noise;
}

struct StableDiffusionModels {
    ov::CompiledModel text_encoder;
    ov::CompiledModel unet;
    ov::CompiledModel vae_decoder;
    ov::CompiledModel tokenizer;
};

void apply_lora(std::shared_ptr<ov::Model> model, InsertLoRA::LoRAMap& lora_map) {
    if (!lora_map.empty()) {
        ov::pass::Manager manager;
        manager.register_pass<InsertLoRA>(lora_map);
        manager.run_passes(model);
    }
}

StableDiffusionModels compile_models(const std::string& model_path, const std::string& device,
                                     const std::string& lora_path, const float alpha, const bool use_cache) {
    StableDiffusionModels models;

    ov::Core core;
    if (use_cache)
        core.set_property(ov::cache_dir("./cache_dir"));
    core.add_extension(TOKENIZERS_LIBRARY_PATH);

    // read LoRA weights
    std::map<std::string, InsertLoRA::LoRAMap> lora_weights;
    if (!lora_path.empty()) {
        lora_weights = read_lora_adapters(lora_path, alpha);
    }
    // print status: lora_loaded
    std::cout << "status: lora_loaded" << std::endl;
    // Text encoder
    {
        auto text_encoder_model = core.read_model(model_path + "/text_encoder/openvino_model.xml");
        apply_lora(text_encoder_model, lora_weights["text_encoder"]);
        models.text_encoder = core.compile_model(text_encoder_model, device);
    }
    std::cout << "status: text_encoder_loaded" << std::endl;
    // UNet
    {
        auto unet_model = core.read_model(model_path + "/unet/openvino_model.xml");
        apply_lora(unet_model, lora_weights["unet"]);
        models.unet = core.compile_model(unet_model, device);
    }
    std::cout << "status: unet_loaded" << std::endl;
    // VAE decoder
    {
        auto vae_decoder_model = core.read_model(model_path + "/vae_decoder/openvino_model.xml");
        ov::preprocess::PrePostProcessor ppp(vae_decoder_model);
        ppp.output().model().set_layout("NCHW");
        ppp.output().tensor().set_layout("NHWC");
        models.vae_decoder = core.compile_model(vae_decoder_model = ppp.build(), device);
    }
    std::cout << "status: vae_decoder_loaded" << std::endl;
    // Tokenizer
    {
        // Tokenizer model wil be loaded to CPU: OpenVINO Tokenizers can be inferred on a CPU device only.
        models.tokenizer = core.compile_model(model_path + "/tokenizer/openvino_tokenizer.xml", "CPU");
    }
    std::cout << "status: tokenizer_loaded" << std::endl;
    return models;
}

ov::Tensor text_encoder(StableDiffusionModels models, std::string& pos_prompt) {
    const size_t MAX_LENGTH = 77; // 'model_max_length' from 'tokenizer_config.json'
    const size_t HIDDEN_SIZE = static_cast<size_t>(models.text_encoder.output(0).get_partial_shape()[2].get_length());
    const int32_t EOS_TOKEN_ID = 49407, PAD_TOKEN_ID = EOS_TOKEN_ID;
    const ov::Shape input_ids_shape({1, MAX_LENGTH});

    ov::InferRequest tokenizer_req = models.tokenizer.create_infer_request();
    ov::InferRequest text_encoder_req = models.text_encoder.create_infer_request();

    ov::Tensor text_embeddings(ov::element::f32, {1, MAX_LENGTH, HIDDEN_SIZE});
    ov::Tensor input_ids(ov::element::i32, input_ids_shape);
    std::fill_n(input_ids.data<int32_t>(), input_ids.get_size(), PAD_TOKEN_ID);

    // tokenization
    tokenizer_req.set_input_tensor(ov::Tensor{ov::element::string, {1}, &pos_prompt});
    tokenizer_req.infer();
    ov::Tensor input_ids_token = tokenizer_req.get_tensor("input_ids");
    std::copy_n(input_ids_token.data<std::int32_t>(), input_ids_token.get_size(), input_ids.data<int32_t>());

    // text embeddings
    text_encoder_req.set_tensor("input_ids", input_ids);
    text_encoder_req.set_output_tensor(0, text_embeddings);
    text_encoder_req.infer();

    return text_embeddings;
}

ov::Tensor get_w_embedding(float guidance_scale = 7.5, uint32_t embedding_dim = 512) {
    float w = guidance_scale * 1000;
    uint32_t half_dim = embedding_dim / 2;
    float emb = log(10000) / (half_dim - 1);

    ov::Shape embedding_shape = {1, embedding_dim};
    ov::Tensor w_embedding(ov::element::f32, embedding_shape);
    float* w_embedding_data = w_embedding.data<float>();

    for (size_t i = 0; i < half_dim; ++i) {
        float temp = std::exp((i * (-emb))) * w;
        w_embedding_data[i] = std::sin(temp);
        w_embedding_data[i + half_dim] = std::cos(temp);
    }

    if (embedding_dim % 2 == 1)
        w_embedding_data[embedding_dim - 1] = 0;

    return w_embedding;
}

ov::Tensor unet(ov::InferRequest req, ov::Tensor sample, ov::Tensor timestep, ov::Tensor text_embedding_1d, ov::Tensor guidance_scale_embedding) {
    req.set_tensor("sample", sample);
    req.set_tensor("timestep", timestep);
    req.set_tensor("encoder_hidden_states", text_embedding_1d);
    req.set_tensor("timestep_cond", guidance_scale_embedding);

    req.infer();

    return req.get_output_tensor();
}

ov::Tensor vae_decoder(ov::CompiledModel& decoder_compiled_model, ov::Tensor sample) {
    const float coeffs_const{1 / 0.18215};
    for (size_t i = 0; i < sample.get_size(); ++i)
        sample.data<float>()[i] *= coeffs_const;

    ov::InferRequest req = decoder_compiled_model.create_infer_request();
    req.set_input_tensor(sample);
    req.infer();

    return req.get_output_tensor();
}

ov::Tensor postprocess_image(ov::Tensor decoded_image) {
    ov::Tensor generated_image(ov::element::u8, decoded_image.get_shape());

    // convert to u8 image
    const float* decoded_data = decoded_image.data<const float>();
    std::uint8_t* generated_data = generated_image.data<std::uint8_t>();
    for (size_t i = 0; i < decoded_image.get_size(); ++i) {
        generated_data[i] = static_cast<std::uint8_t>(std::clamp(decoded_data[i] * 0.5f + 0.5f, 0.0f, 1.0f) * 255);
    }

    return generated_image;
}

int32_t main(int32_t argc, char* argv[]) try {
    cxxopts::Options options("stable_diffusion", "Stable Diffusion implementation in C++ using OpenVINO\n");

    options.add_options()
    ("p,posPrompt", "Initial positive prompt for LCM ", cxxopts::value<std::string>()->default_value("a beautiful pink unicorn"))
    ("d,device", "AUTO, CPU, or GPU.\nDoesn't apply to Tokenizer model, OpenVINO Tokenizers can be inferred on a CPU device only", cxxopts::value<std::string>()->default_value("CPU"))
    ("step", "Number of diffusion steps", cxxopts::value<size_t>()->default_value("4"))
    ("s,seed", "Number of random seed to generate latent for one image output", cxxopts::value<size_t>()->default_value("42"))
    ("num", "Number of image output", cxxopts::value<size_t>()->default_value("1"))
    ("c,useCache", "Use model caching", cxxopts::value<bool>()->default_value("false"))
    ("r,readNPLatent", "Read numpy generated latents from file, only supported for one output image", cxxopts::value<bool>()->default_value("false"))
    ("m,modelPath", "Specify path of LCM model IRs", cxxopts::value<std::string>()->default_value("../scripts/SimianLuo/LCM_Dreamshaper_v7"))
    ("t,type", "Specify the type of LCM model IRs (e.g., FP16_static or FP16_dyn)", cxxopts::value<std::string>()->default_value("FP16_static"))
    ("l,loraPath", "Specify path of LoRA file. (*.safetensors).", cxxopts::value<std::string>()->default_value(""))
    ("a,alpha", "alpha for LoRA", cxxopts::value<float>()->default_value("0.75"))
    ("o,output", "Output directory", cxxopts::value<std::string>()->default_value("images"))
    ("h,help", "Print usage");
    cxxopts::ParseResult result;

    try {
        result = options.parse(argc, argv);
    } catch (const cxxopts::exceptions::exception& e) {
        std::cout << e.what() << "\n\n";
        std::cout << options.help() << std::endl;
        return EXIT_FAILURE;
    }

    if (result.count("help")) {
        std::cout << options.help() << std::endl;
        return EXIT_SUCCESS;
    }

    std::string positive_prompt = result["posPrompt"].as<std::string>();
    const std::string device = result["device"].as<std::string>();
    uint32_t num_inference_steps = result["step"].as<size_t>();
    uint32_t user_seed = result["seed"].as<size_t>();
    const uint32_t num_images = result["num"].as<size_t>();
    const bool use_cache = result["useCache"].as<bool>();
    const bool read_np_latent = result["readNPLatent"].as<bool>();
    const std::string model_base_path = result["modelPath"].as<std::string>();
    const std::string model_type = result["type"].as<std::string>();
    const std::string lora_path = result["loraPath"].as<std::string>();
    const float alpha = result["alpha"].as<float>();
    const uint32_t height = 512, width = 512;

    OPENVINO_ASSERT(!read_np_latent || (read_np_latent && (num_images == 1)),
        "\"readNPLatent\" option is only supported for one output image. Number of image output was set to: " + std::to_string(num_images));

    const std::string folder_name = "images";
    try {
        std::filesystem::create_directory(folder_name);
    } catch (const std::exception& e) {
        std::cerr << "Failed to create dir" << e.what() << std::endl;
    }

    std::cout << "OpenVINO version: " << ov::get_openvino_version() << std::endl;
    std::cout << "Running (may take some time 2) ..." << std::endl;

    // Stable Diffusion pipeline

    StableDiffusionModels models = compile_models(model_base_path + "/" + model_type, device, lora_path, alpha, use_cache);
    ov::InferRequest unet_infer_request = models.unet.create_infer_request();

    ov::PartialShape sample_shape = models.unet.input("sample").get_partial_shape();
    OPENVINO_ASSERT(sample_shape.is_dynamic() || (sample_shape[2] * 8 == width && sample_shape[3] * 8 == height),
        "UNet model has static shapes [1, 4, H/8, W/8] or dynamic shapes [?, 4, ?, ?]");

    // no negative prompt for LCM model: 
    // https://huggingface.co/docs/diffusers/api/pipelines/latent_consistency_models#diffusers.LatentConsistencyModelPipeline

    std::string input_data;
    while(true) {
        std::cout << "status: waiting_for_prompt" << std::endl;
        std::getline(std::cin, input_data);
        // each line will be formatted like this steps={num_steps},seed={seed},prompt={prompt}
        // first reasd up to prompt=
        size_t prompt_pos = input_data.find("prompt=");
        std::string input_prompt = input_data.substr(prompt_pos + 7);
        std::string meta_data = input_data.substr(0, prompt_pos - 1);
        // map holding key/value
        std::map<std::string, std::string> key_value;
        // split the meta_data by ','
        std::istringstream ss(meta_data);
        std::string token;
        while(std::getline(ss, token, ',')) {
            // split the token by '='
            size_t pos = token.find("=");
            std::string key = token.substr(0, pos);
            std::string value = token.substr(pos + 1);
            key_value[key] = value;
        }
        // get the num_steps and seed
        num_inference_steps = std::stoi(key_value["steps"]);
        user_seed = std::stoi(key_value["seed"]);

        // print the user seed and num steps
        std::cout << "info: user_seed: " << user_seed << std::endl;
        std::cout << "info: num_inference_steps: " << num_inference_steps << std::endl;


        ov::Tensor text_embeddings = text_encoder(models, input_prompt);
        std::cout << "status: text_embeddings_computed" << std::endl;
        std::shared_ptr<Scheduler> scheduler = std::make_shared<LCMScheduler>(LCMScheduler(
            1000, 0.00085f, 0.012f, BetaSchedule::SCALED_LINEAR,
            PredictionType::EPSILON, {}, 50, true, 10.0f, false,
            false, 1.0f, 0.995f, 1.0f, read_np_latent, user_seed));
        scheduler->set_timesteps(num_inference_steps);
        std::vector<std::int64_t> timesteps = scheduler->get_timesteps();
        std::cout << "status: timesteps_computed" << std::endl;

        float guidance_scale = 8.0;
        ov::Tensor guidance_scale_embedding = get_w_embedding(guidance_scale, 256);

        ov::Tensor denoised(ov::element::f32, {1, 4, height / 8, width / 8});
        for (uint32_t n = 0; n < num_images; n++) {
            std::uint32_t seed = num_images == 1 ? user_seed: user_seed + n;
            ov::Tensor latent_model_input = randn_tensor(height, width, read_np_latent, seed);

            // start timer
            auto start = std::chrono::high_resolution_clock::now();
            std::cout << "status: start_inference" << std::endl;
            for (size_t inference_step = 0; inference_step < num_inference_steps; inference_step++) {
                ov::Tensor timestep(ov::element::i64, {1}, &timesteps[inference_step]);
                ov::Tensor noisy_residual = unet(unet_infer_request, latent_model_input, timestep, text_embeddings, guidance_scale_embedding);

                auto step_res = scheduler->step(noisy_residual, latent_model_input, inference_step);
                latent_model_input = step_res["latent"], denoised = step_res["denoised"];
                // get time 
                auto end = std::chrono::high_resolution_clock::now();
                std::chrono::duration<double> elapsed = end - start;
                start = end;
                std::cout << "status: step_" << inference_step << "_time: " << elapsed.count() << std::endl;
            }

            ov::Tensor decoded_image = vae_decoder(models.vae_decoder, denoised);
            imwrite(std::string("./images/seed_") + std::to_string(seed) + ".bmp", postprocess_image(decoded_image), true);
            std::cout << "status: complete " << std::string("./images/out.bmp") << std::endl;
        }
    }

    return EXIT_SUCCESS;
} catch (const std::exception& error) {
    std::cerr << error.what() << '\n';
    return EXIT_FAILURE;
} catch (...) {
    std::cerr << "Non-exception object thrown\n";
    return EXIT_FAILURE;
}
