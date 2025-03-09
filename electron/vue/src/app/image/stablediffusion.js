import { addon } from "openvino-node";
// let { addon } = require("openvino-node");


async function main() {

    // load the model

    let core = new addon.Core();
    console.log("reading")
    let modelRead = await core.readModel("C:/Users/hdtru/prg/openvino.genai/image_generation/lcm_dreamshaper_v7/cpp/scripts/FP16_static/unet/openvino_model.xml");
    console.log("compiling")
    let model = await core.compileModel(modelRead, "CPU");
    console.log("exporting")

    

}

main();




// const ov = require('openvino-node');
// const fs = require('fs');

// async function runStableDiffusionInference(modelPath, device, inputPrompt) {
//     const core = new ov.Core();
//     // Simplified model loading and compilation
//     const textEncoderModelPath = `${modelPath}/text_encoder/openvino_model.xml`;
//     const unetModelPath = `${modelPath}/unet/openvino_model.xml`;
//     const vaeDecoderModelPath = `${modelPath}/vae_decoder/openvino_model.xml`;
//     const tokenizerModelPath = `${modelPath}/tokenizer/openvino_tokenizer.xml`;


//     const textEncoderModel = await core.readModel(textEncoderModelPath);
//     const unetModel = await core.readModel(unetModelPath);
//     const vaeDecoderModel = await core.readModel(vaeDecoderModelPath);
//     const tokenizerModel = await core.readModel(tokenizerModelPath);


//     const compiledTextEncoder = await core.compileModel(textEncoderModel, device);
//     const compiledUnet = await core.compileModel(unetModel, device);
//     const compiledVaeDecoder = await core.compileModel(vaeDecoderModel, device);
//     const compiledTokenizer = await core.compileModel(tokenizerModel, "CPU"); // Tokenizer runs on CPU


//     // Example inference flow
//     // Tokenization (assuming inputPrompt is the text to encode)
//     const inferRequestTokenizer = compiledTokenizer.createInferRequest();
//     // Assuming the tokenizer model has an input named "input_text" and output "output_tokens"
//     inferRequestTokenizer.set_input_tensor(new ov.Tensor("FP32", [1], [inputPrompt]));
//     inferRequestTokenizer.infer();
//     const tokenizedOutput = inferRequestTokenizer.get_output_tensor(0);


//     // Text encoding
//     const inferRequestTextEncoder = compiledTextEncoder.createInferRequest();
//     // Assuming the text encoder model has an input named "input_tokens" and output "text_embeddings"
//     inferRequestTextEncoder.set_input_tensor(tokenizedOutput);
//     inferRequestTextEncoder.infer();
//     const textEmbeddings = inferRequestTextEncoder.get_output_tensor(0);


//     // UNet and VAE Decoder inference would follow a similar pattern
//     // For simplicity, placeholders for these steps are omitted


//     // Example: Saving an output tensor to a file (e.g., the final image)
//     const outputTensor = textEmbeddings; // Placeholder, replace with the actual final output tensor
//     const outputData = outputTensor.data; // Get the tensor data
//     fs.writeFileSync('output.bin', Buffer.from(outputData)); // Save tensor data to file


//     console.log('Inference complete, output saved to output.bin');

// }



// // Example usage

// const modelPath = '/path/to/your/model/directory';

// const device = 'CPU'; // or GPU, MYRIAD, etc.

// const inputPrompt = 'A prompt for the model';



// runStableDiffusionInference(modelPath, device, inputPrompt)
// .then(() => console.log('Done'))
// .catch(err => console.error('Error:', err));