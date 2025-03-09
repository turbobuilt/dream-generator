from optimum.intel import OVStableDiffusionPipeline
from pathlib import Path

cur_dir = Path(__file__).resolve().parent
print(f"{cur_dir}/FP16_static")
# model_id=Path(f"{cur_dir}/FP16_static")
model_id="C:/Users/hdtru/prg/dreamgenerator-monorepo/electron/models/dreamshaper/FP16_static"
print("model id is", model_id)
pipeline = OVStableDiffusionPipeline.from_pretrained(model_id=model_id, local_files_only=True)
images = pipeline("a dog eating candy", width=512, height=512, num_inference_steps=25, guidance_scale=1)
images[0][0].save("image.png")