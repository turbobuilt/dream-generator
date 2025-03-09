from pathlib import Path
from modal import App, build, enter, method, Image
import modal
from typing import Dict
from diffusers import StableDiffusionPipeline

model_url = "https://huggingface.co/Lykon/dreamshaper-xl-lightning/resolve/main/DreamShaperXL_Lightning-SFW.safetensors?download=true"

dreamshaper_xl_lightning_sfw_safetensors_image = (
    Image.debian_slim()
    .apt_install("curl",'libgl1-mesa-glx', 'libglib2.0-0')
    .pip_install("transformers", "accelerate", "safetensors", "boto3", "diffusers", "requests~=2.26", "numpy")
    # download the file with progress
    .run_commands(f"curl --progress-bar -o ~/dreamshaper_xl_lightning_sfw_safetensors.safetensors '{model_url}'")
    # .run_function(download_models)
)

app = App("dreamshaper_xl_lightning_sfw_safetensors", image=dreamshaper_xl_lightning_sfw_safetensors_image)

@app.cls()
class Model:
    @build()
    def download_model(self):
        download_model_to_disk()

    @enter()
    def load_model(self):
        load_model_from_disk()

    @method()
    def predict(self, x):

image = (
    modal.Image.debian_slim()
        .pip_install("sentence-transformers")
)
app = modal.App("sentence-transformers", image=image)  # Note: prior to April 2024, "app" was called "stub"


with image.imports():
    from sentence_transformers import SentenceTransformer


@app.cls(
    gpu=modal.gpu.A10G(),
    enable_memory_snapshot=True,
)
class DreamshaperXlLightningSfwSafetensors:
    # @modal.build()
    # def build(self):
    #     # model = SentenceTransformer(self.model_id)
    #     # model.save("/model.bge")

    @modal.enter(snap=True)
    def load(self):
        # Create a memory snapshot with the model loaded in CPU memory.
        self.model = pipeline = StableDiffusionPipeline.from_single_file("~/dreamshaper_xl_lightning_sfw_safetensors.safetensors")

    @modal.enter(snap=False)
    def setup(self):
        # Move the model to a GPU before doing any work.
        self.model.to("cuda")

    @modal.method()
    def run(self, prompt, num_inference_steps, guid, update_status_url):
        images = self.model(prompt, num_inference_steps=num_inference_steps, guidance_scale=2)
        # save images[0][0] to test.jpg
        images[0][0].save("test.jpg")
        # in_mem_file = BytesIO()
        # images[0][0].save(in_mem_file, format='JPEG')
        # in_mem_file.seek(0) 


@app.local_entrypoint()
def main():
    prompt = "A dog walking down the street"
    num_inference_steps = 8
    guid = "test"
    update_status_url = "http://localhost:8000"
    DreamshaperXlLightningSfwSafetensors().run.remote(prompt, num_inference_steps, guid, update_status_url)


if __name__ == "__main__":
    cls = modal.Cls.lookup("sentence-transformers", "Embedder")

    sentences = ["what is the meaning of life?"]
    cls().run.remote(sentences)