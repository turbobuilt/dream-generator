from pathlib import Path
from modal import Image, Mount, Stub, asgi_app, gpu, method, Volume

model_id = "stabilityai/stable-diffusion-xl-base-1.0"
model_dir = Path("openvino-sd-xl-base-1.0")





# @stub.function(checkpointing_enabled=True, gpu=gpu.A10G(), container_idle_timeout=2, image=sdxl_openvino)
def download_models():
    from optimum.intel.openvino import OVStableDiffusionXLPipeline
    import ipywidgets as widgets
    import openvino as ov
    print("starting openvino")
    core = ov.Core()
    # print("gettin gdevice")
    # device = widgets.Dropdown(
    #     options=core.available_devices + ["AUTO"],
    #     value='AUTO',
    #     description='Device:',
    #     disabled=False,
    # )
    # print("loading")
    text2image_pipe = OVStableDiffusionXLPipeline.from_pretrained(model_id, compile=False, device="cuda")
    text2image_pipe.half()
    batch_size, num_images, height, width = 1, 1, 1024, 1024
    text2image_pipe.reshape(batch_size, height, width, num_images)
    text2image_pipe.compile()

    text2image_pipe.save_pretrained(model_dir)
    text2image_pipe.compile()


sdxl_openvino = (
    Image.debian_slim()
    .pip_install(
        "diffusers", "invisible-watermark", "transformers", "accelerate", "onnx", "optimum-intel", "openvino", "gradio", "requests~=2.26", "ipywidgets"
    )
    .apt_install('libgl1-mesa-glx', 'libglib2.0-0')
    .run_function(download_models)
)
stub = Stub("stable-diffusion-xl-openvino", image=sdxl_openvino)

@stub.function(checkpointing_enabled=True, gpu=gpu.A10G(), container_idle_timeout=2, image=sdxl_openvino)
def generate_image(prompt):
    from optimum.intel.openvino import OVStableDiffusionXLPipeline
    import ipywidgets as widgets
    import openvino as ov
    import numpy as np
    core = ov.Core()
    # device = widgets.Dropdown(
    #     options=core.available_devices + ["AUTO"],
    #     value='AUTO',
    #     description='Device:',
    #     disabled=False,
    # )
    text2image_pipe = OVStableDiffusionXLPipeline.from_pretrained(model_dir, device="cuda")
    image = text2image_pipe(prompt, num_inference_steps=15, height=1024, width=1024, generator=np.random.RandomState()).images[0]
    image.save("cat.png")


@stub.local_entrypoint()
def main(prompt: str):
    generate_image(prompt)
    return "cat.png"
