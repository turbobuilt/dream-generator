import fs from "node:fs";
import axios from "axios";
import FormData from "form-data";
import { Glob } from "bun";
import { readdir } from "node:fs/promises";

const formData = new FormData();
// formData.append("prompt", "A logo for a dog breeding business.  The dogs ('Hope' and 'Honey') are two happy females on the sides, and the male dog is in between.  The dogs are golden doodles.  The two females are on the sides, the male in the middle is white with brown splotches.  They are cute and small dogs (15 lbs).  The logo below states 'Hope & Honey Puppies'");
// formData.append("prompt", "Three beautiful puppies weighing 5 lbs.  They are golden doodles and so cute.  There are two white ones on the outside, and the middle one is white and brown spots.  So cute and cuddly.  It's a logo for a dog breeding business. The dogs art style is digital art, not realistic.  It is drawn and pretty, high color, but homey. Digital art");
// formData.append("prompt", "A colorful drawing of three cute golden doodle puppies!  Pencil and watercolor.");
formData.append("prompt", "A picture of a cute dog named hope.")
formData.append("output_format", "webp");
formData.append("style_preset", "digital-art")
formData.append("aspect_ratio", "21:9")

const response = await axios.post(`https://api.stability.ai/v2beta/stable-image/generate/core`, formData, {
    headers: {
        Authorization: process.env.stability_api_key,
        Accept: "image/*",
        "Accept-Encoding": "identity",
        ...formData.getHeaders()
    },
    responseType: "arraybuffer",
    validateStatus: undefined
});

if (response.status === 200) {
    const count = (await readdir("puppy_logos")).length;
    fs.writeFileSync(`./puppy_logos/logo_${count+1}.webp`, Buffer.from(response.data));
} else {
    throw new Error(`${response.status}: ${response.data.toString()}`);
}