import torch
from diffusers import StableDiffusionXLPipeline, UNet2DConditionModel, EulerDiscreteScheduler
from huggingface_hub import hf_hub_download
from safetensors.torch import load_file
# from nncf import compress_weights, CompressWeightsMode
# model = compress_weights(pipe, mode=CompressWeightsMode.INT8_SYM, group_size=128, ratio=0.8) # model is openvino.Model object

# get command line arguments
import sys
import os
import pathlib
out_file_dir = os.path.dirname(os.path.realpath(__file__))
out_file_path = out_file_dir + "/output.png"

device_name="mps"

# /usr/bin/python3 -m pip install accelerate

base = "stabilityai/stable-diffusion-xl-base-1.0"
repo = "ByteDance/SDXL-Lightning"
ckpt = "sdxl_lightning_4step_unet.safetensors" # Use the correct ckpt for your step setting!

print("loading_percent 5% 'model'")
sys.stdout.flush()
unet = UNet2DConditionModel.from_config(base, subfolder="unet").to(device_name, torch.float32)
print("loading_percent 40% 'weights'")
sys.stdout.flush()
unet.load_state_dict(load_file(hf_hub_download(repo, ckpt), device=device_name))
print("loading_percent 80% 'pipeline'")
sys.stdout.flush()
pipe = StableDiffusionXLPipeline.from_pretrained(base, unet=unet, torch_dtype=torch.float32).to(device_name)
print("loading_percent 90% 'scheduler'")
sys.stdout.flush()
# Ensure sampler uses "trailing" timesteps.
pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config, timestep_spacing="trailing")

print("loading_percent 100% 'done'")
sys.stdout.flush()


# if __name__ == "__main__":
while True:
    print("looping")
    for line in sys.stdin:
        text_prompt = line.strip()
        sys.stdout.write(f">>>>NOTICE: prompt is: {text_prompt}\n")
        sys.stdout.flush()
        print('saving to ', out_file_path)
        pipe(text_prompt, num_inference_steps=4, guidance_scale=0).images[0].save(out_file_path)
        print(f">>>>DONE!: {out_file_path}")
        sys.stdout.flush()
