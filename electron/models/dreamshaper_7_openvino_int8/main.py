from optimum.intel import OVLatentConsistencyModelPipeline



pipe = OVLatentConsistencyModelPipeline.from_pretrained("rupeshs/LCM-dreamshaper-v7-openvino-int8", ov_config={"CACHE_DIR": ""},
    #torch_dtype=torch.int8,
    low_cpu_mem_usage=True,
    device_map='auto',
    load_in_8bit=True)

# export
pipe.save_pretrained("./FP16_static")

# prompt = "sailing ship in storm by Leonardo da Vinci"
# images = pipe(prompt=prompt,width=512,height=512,num_inference_steps=4,guidance_scale=8.0).images
# images[0].save("out_image.png")