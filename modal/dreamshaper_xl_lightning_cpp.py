from pathlib import Path
from modal import Image, Mount, App, asgi_app, gpu, method, Volume, web_endpoint
import modal
from typing import Dict

# model_id = 'Lykon/dreamshaper-xl-lightning'
# model_dir = Path("dreamshaper-xl-lightning")

# import pkg_resources
# print(pkg_resources.get_distribution("modal").version)

model_url = "https://huggingface.co/Lykon/dreamshaper-xl-lightning/resolve/main/DreamShaperXL_Lightning-SFW.safetensors?download=true"
local_model_path = "~/dreamshaper_xl_lightning_sfw_safetensors.safetensors"
vae_url = "https://huggingface.co/madebyollin/sdxl-vae-fp16-fix/resolve/main/sdxl_vae.safetensors?download=true"
local_vae_path = "~/sdxl_vae.safetensors"

model_url = "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0_0.9vae.safetensors?download=true"
local_model_path = "~/sd_xl_base_1.0_0.9vae.safetensors"

# # @stub.function(checkpointing_enabled=True, gpu=gpu.A10G(), container_idle_timeout=2, image=sdxl_diffusers_dreamshaper_lightning_cpp)
# def download_models():
#     from diffusers import AutoPipelineForText2Image, DPMSolverMultistepScheduler
#     import torch
#     from io import BytesIO
#     import requests
#     import torch
#     pipe = AutoPipelineForText2Image.from_pretrained(model_id, torch_dtype=torch.float16, device_map="auto", variant="fp16")
#     pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)

# def download_models():
#     from huggingface_hub import hf_hub_download, snapshot_download
#     my_local_checkpoint_path = hf_hub_download(
#         repo_id="Lykon/dreamshaper-xl-lightning",
#         filename="DreamShaperXL_Lightning-SFW.safetensors",
#     )
#     my_local_config_path = snapshot_download(
#         repo_id="Lykon/dreamshaper-xl-lightning",
#         allow_patterns=["*.json", "**/*.json", "*.txt", "**/*.txt"]
#     )
#     pipe = StableDiffusionPipeline.from_single_file(my_local_checkpoint_path, my_local_config_path, local_files_only=True)
#     # write the paths to ~/modal_config.json
#     with open("/root/modal_config.json", "w") as f:
#         f.write(f'{{"checkpoint_path": "{my_local_checkpoint_path}", "config_path": "{my_local_config_path}"}}')
sd_cpp_url = "https://github.com/leejet/stable-diffusion.cpp/releases/download/master-e1384de/sd-master--bin-Linux-Ubuntu-22.04-x86_64.zip"
sdxl_diffusers_dreamshaper_lightning_cpp = (
    Image.from_registry("ubuntu:22.04", add_python="3.10")
    .apt_install("curl",'libgl1-mesa-glx', 'libglib2.0-0')
    .pip_install("transformers", "accelerate", "safetensors", "boto3", "diffusers", "requests~=2.26", "numpy")
    .run_commands(f"ls ~/")
    # .run_function(download_models)
    .run_commands(f"curl --location --progress-bar -o {local_model_path} '{model_url}'")
    .run_commands(f"curl --location --progress-bar -o {local_vae_path} '{vae_url}'")
    .run_commands(f"curl --location --progress-bar -o ~/sd.zip '{sd_cpp_url}'")
    # extract
    .apt_install("unzip")
    .run_commands(f"unzip ~/sd.zip -d ~/sd/")
    .run_commands(f"chmod +x ~/sd/sd")
    .run_commands(f"rm ~/sd.zip")
    .apt_install("libc6", "libstdc++6")
    .run_commands("ls /lib/x86_64-linux-gnu/")
    .run_commands("curl --location --progress-bar -o {}")
    .run_commands(f"curl --location --progress-bar -o {local_model_path} '{model_url}'")
)

    # download this file:
    # https://civitai.com/api/download/models/354657

    # text2image_pipe = StableDiffusionXLPipeline.from_pretrained(model_id, torch_dtype=torch.float16, variant="fp16", use_safetensors=True)
    # text2image_pipe.save_pretrained(model_dir, variant="fp16")


app = App("sdxl_diffusers_dreamshaper_lightning_cpp", image=sdxl_diffusers_dreamshaper_lightning_cpp)

with sdxl_diffusers_dreamshaper_lightning_cpp.imports():
    # from diffusers import AutoPipelineForText2Image, DEISMultistepScheduler
    # from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
    # from diffusers import AutoPipelineForText2Image, DPMSolverMultistepScheduler, StableDiffusionPipeline
    import torch
    from io import BytesIO
    import requests
    import torch
    import boto3
    from botocore.client import Config


@app.cls(gpu=modal.gpu.A10G(), enable_memory_snapshot=False)
class ImageGenerator:
    
    # @modal.build()
    # def build(self):
    #     # self.model = StableDiffusionXLPipeline.from_pretrained(model_dir, torch_dtype=torch.float16, variant="fp16", use_safetensors=True)
    #     self.model =

    # @modal.enter(snap=True)
    # def load(self):
    #     from diffusers import StableDiffusionPipeline
    #     import json
    #     pipe = AutoPipelineForText2Image.from_pretrained(model_id, torch_dtype=torch.float16, variant="fp16")
    #     # pipe = StableDiffusionPipeline.from_single_file("~/dreamshaper_xl_lightning_sfw_safetensors.safetensors")
    #     # with open("/root/modal_config.json", "r") as f:
    #     #     config = json.load(f)
    #     # print("Config is", config, "checkpoint path is", config["checkpoint_path"], "config path is", config["config_path"])
    #     # pipe = StableDiffusionPipeline.from_single_file(my_local_checkpoint_path, config=my_local_config_path, local_files_only=True)
    #     # pipe = AutoPipelineForText2Image.from_single_file(config["checkpoint_path"], config=config["config_path"], local_files_only=True)
    #     print("config is", pipe.scheduler.config)
    #     pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    #     self.model = pipe


    # @modal.enter(snap=False)
    # def setup(self):
    #     self.model.to("cuda")

    @modal.method()
    def run(self, prompt, num_inference_steps, guid, update_status_url):
        from shlex import quote
        try:
            requests.post(update_status_url, json={
                "auth_token": "OIJhgfmghhfw76erijgufytihufiugutfwefiuhouhfiugweigfihgwjefoij", 
                "status": "IN_PROGRESS",
                "guid": guid,
                "output_url": f""
            })
        except Exception as httpE:
            print(httpE)
        try:
            print("prompt is", prompt)
            # image = self.model(prompt, num_inference_steps=25).images[0]
            # images = self.model(prompt, num_inference_steps=num_inference_steps, guidance_scale=2)
            cmd = f'./sd -m "{local_model_path}" --vae "{local_vae_path}" -H 1024 -W 1024 -p {quote(prompt)} -v -o {guid}.jpg'
            import subprocess
            print("running", cmd)
            print("runnign command")
            subprocess.run(cmd, shell=True, cwd="/root/sd")
            print("ran command")
            images = [Image.open(f"{guid}.jpg")]

            
            in_mem_file = BytesIO()
            images[0].save(in_mem_file, format='JPEG')
            in_mem_file.seek(0) 

            s3_client = boto3.client('s3', endpoint_url='https://6d1fd8715ac1dc4960355505312f9f79.r2.cloudflarestorage.com',
                    aws_access_key_id=s3_access_key_id,
                    aws_secret_access_key=s3_secret_access_key,
                    config=Config(signature_version='s3v4'))
            out_file_key = f"{guid}.jpg"
            s3_client.upload_fileobj(in_mem_file, "dreamgenout", out_file_key)
            try:
                requests.post(update_status_url, json={
                    "auth_token": "OIJhgfmghhfw76erijgufytihufiugutfwefiuhouhfiugweigfihgwjefoij", 
                    "status": "COMPLETED",
                    "guid": guid,
                    "output_url": f"https://out.dreamgenerator.ai/{out_file_key}"
                })
            except Exception as httpE:
                print(httpE)
        except Exception as e:
            import traceback
            print(e, traceback.format_exc())
            requests.post(update_status_url, json={
                "auth_token": "OIJhgfmghhfw76erijgufytihufiugutfwefiuhouhfiugweigfihgwjefoij", 
                "status": "FAILED",
                "guid": guid,
                "output_url": ""
            })



# @app.local_entrypoint()
# def main(prompt: str):
#     from diffusers import StableDiffusionXLPipeline
#     import torch
#     from io import BytesIO
#     import requests
#     model = StableDiffusionXLPipeline.from_pretrained(model_dir, torch_dtype=torch.float16, variant="fp16", use_safetensors=True)
#     image = model(prompt, 25, height=1024, width=1024).images[0]
    
#     in_mem_file = BytesIO()
#     image.save("test.jpg", format='JPEG')

@app.function()
@web_endpoint(method="POST", wait_for_response=False)
def f(data: Dict):
    # prompt: str, guid: str, auth_key: str, update_status_url: str
    prompt = data["prompt"]
    guid = data["guid"]
    auth_key = data["auth_key"]
    update_status_url = data["update_status_url"]
    num_inference_steps = data.get("num_inference_steps", 4)

    if auth_key != "MFNIeht74ifh9iehfjwejfhlskhwfor983tdjkfgftdj":
        return "Unauthorized", 401
    ImageGenerator().run.spawn(prompt, num_inference_steps, guid, update_status_url)
    return "Started", 200