from optimum.intel.openvino.modeling_diffusion import OVStableDiffusionXLPipeline
import sys
import os
import pathlib
out_file_dir = os.path.dirname(os.path.realpath(__file__))
out_file_path = out_file_dir + "/output.png"

print("loading_percent 5% 'model'")
sys.stdout.flush()
pipe = OVStableDiffusionXLPipeline.from_pretrained(
    "rupeshs/SDXL-Lightning-2steps-openvino-int8",
    ov_config={"CACHE_DIR": ""},
    load_in_8bit=True
)
print("loading_percent 40% 'weights'")
sys.stdout.flush()


while True:
    print("looping")
    for line in sys.stdin:
        text_prompt = line.strip()
        sys.stdout.write(f">>>>NOTICE: prompt is: {text_prompt}\n")
        sys.stdout.flush()
        print('saving to ', out_file_path)
        pipe(text_prompt, width=768, height=768, num_inference_steps=2, guidance_scale=1).images[0].save(out_file_path)
        print(f">>>>DONE!: {out_file_path}")
        sys.stdout.flush()