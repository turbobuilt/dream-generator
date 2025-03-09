# import Path
from pathlib import Path

# pipeline = DiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", use_safetensors=True)
from optimum.intel import OVStableDiffusionPipeline, OVWeightQuantizationConfig


# quantization_config = OVWeightQuantizationConfig(bits=8)
pipeline = OVStableDiffusionPipeline.from_pretrained(model_id=Path("/Users/dev/prg/dreamgenerator.ai/electron/models/dreamshaper/model/"), local_files_only=True, export=True, cache_dir="cache_ov")
batch_size, num_images, height, width = 1, 1, 512, 512
pipeline.reshape(batch_size, height, width, num_images)
pipeline.compile()
pipeline.save_pretrained(Path("/Users/dev/prg/dreamgenerator.ai/electron/models/dreamshaper/dreamshaper_openvino_regular/"))

# pipeline = OVStableDiffusionPipeline.from_pretrained(model_id=Path("/Users/dev/prg/dreamgenerator.ai/electron/models/dreamshaper/dreamshaper_openvino/", local_files_only=True, cache_dir="cache_ov"))


# from diffusers import DiffusionPipeline, StableDiffusionPipeline
# pipeline = StableDiffusionPipeline.from_single_file("dreamshaper_8.safetensors")
# pipeline.save_pretrained("./model/")

# print("making it")
# images = pipeline("a dog eating candy", width=512, height=512, num_inference_steps=25, guidance_scale=1)
# print(images[0])
# images[0][0].save("image.png")
