from pathlib import Path
from modal import Image, Mount, Stub, asgi_app, gpu, method, Volume, web_endpoint
import modal
from typing import Dict

model_id = "stabilityai/stable-diffusion-xl-base-1.0"
model_dir = Path("sdxl-base-1.0")

# import pkg_resources
# print(pkg_resources.get_distribution("modal").version)

# @stub.function(checkpointing_enabled=True, gpu=gpu.A10G(), container_idle_timeout=2, image=sdxl_openvino)
def download_models():
    from diffusers import StableDiffusionXLPipeline
    import torch
    text2image_pipe = StableDiffusionXLPipeline.from_pretrained(model_id, torch_dtype=torch.float16, variant="fp16", use_safetensors=True)
    text2image_pipe.save_pretrained(model_dir, variant="fp16")


sdxl_diffusers = (
    Image.debian_slim()
    .pip_install("transformers", "accelerate", "safetensors", "boto3")
    .apt_install('libgl1-mesa-glx', 'libglib2.0-0')
    .pip_install("diffusers", "requests~=2.26", "numpy")
    .run_function(download_models)
)
stub = Stub("stable-diffusion-xl-diffusers", image=sdxl_diffusers)

with sdxl_diffusers.imports():
    from diffusers import StableDiffusionXLPipeline
    import torch
    import boto3
    from botocore.client import Config
    from io import BytesIO
    import requests


@stub.cls(gpu=modal.gpu.A10G(), enable_memory_snapshot=True)
class ImageGenerator:
    
    @modal.build()
    def build(self):
        model = StableDiffusionXLPipeline.from_pretrained(model_dir, torch_dtype=torch.float16, variant="fp16", use_safetensors=True)

    @modal.enter(snap=True)
    def load(self):
        self.model = StableDiffusionXLPipeline.from_pretrained(model_dir, torch_dtype=torch.float16, variant="fp16", use_safetensors=True)

    @modal.enter(snap=False)
    def setup(self):
        self.model.to("cuda")

    @modal.method()
    def run(self, prompt, num_inference_steps, guid, update_status_url):
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
            image = self.model(prompt, num_inference_steps, height=1024, width=1024).images[0]
            
            in_mem_file = BytesIO()
            image.save(in_mem_file, format='JPEG')
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
            print(e)
            requests.post(update_status_url, json={
                "auth_token": "OIJhgfmghhfw76erijgufytihufiugutfwefiuhouhfiugweigfihgwjefoij", 
                "status": "FAILED",
                "guid": guid,
                "output_url": ""
            })



@stub.local_entrypoint()
def main(prompt: str):
    ImageGenerator().run.remote(prompt)

@stub.function()
@web_endpoint(method="POST", wait_for_response=False)
def f(data: Dict):
    # prompt: str, guid: str, auth_key: str, update_status_url: str
    prompt = data["prompt"]
    guid = data["guid"]
    auth_key = data["auth_key"]
    update_status_url = data["update_status_url"]
    num_inference_steps = data.get("num_inference_steps", 25)

    if auth_key != os.environ.get('dream_generator_modal_token'):
        return "Unauthorized", 401
    ImageGenerator().run.spawn(prompt, num_inference_steps, guid, update_status_url)
    return "Started", 200