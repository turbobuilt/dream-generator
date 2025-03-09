import axios from "axios";
import sharp from "sharp";

export async function createImage(prompt, steps, imageId, refiner_steps=10) {
    let response = await axios.post("https://api.runpod.ai/v2/sdxl/runsync", {
        input: {
            prompt: prompt,
            num_inference_steps: steps,
            refiner_inference_steps: refiner_steps,
            width: 1024,
            height: 1024,
            guidance_scale: 7.5,
            strength: 0.3,
            seed: Math.floor(Math.random() * 100),
            num_images: 1
        }
    }, {
        headers: {
            Authorization: "GXZH1OPI8UWU1EXPVG30KP90MVEV41DIGGAZSXNL",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    });
    
    try {
        var imageResponse = await axios.get(response.data.output.images[0], {
            responseType: "arraybuffer"
        });
    } catch (err) {
        console.error("Error getting image back", err);
    }
    await sharp(imageResponse.data).avif().toFile(`../assets/article-featured-images/${imageId}.avif`);
}