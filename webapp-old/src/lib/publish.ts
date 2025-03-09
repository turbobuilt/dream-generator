import type { ImageInfo } from '@/models/ImageInfo';
import { encode } from '@jsquash/avif';
// import encode, { init as initAvifDecode } from '@jsquash/avif/encode';
// import { encode } from "https://unpkg.com/@jsquash/avif@1.2.0?module";

import axios from 'axios';
// @ts-ignore
import { loadAvif } from '../views/Image.vue';


export async function imageToAvif(imageArrayBuffer) {
    let img = new Image();
    img.src = URL.createObjectURL(new Blob([imageArrayBuffer]));
    await img.decode();
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    let imageData = ctx.getImageData(0, 0, img.width, img.height);
    // let encode = await loadAvif();
    console.log("encoding avif")
    let avif = await encode(imageData);
    console.log("encoded avif")
    return avif;
}

export async function publishImage(image: ImageInfo) {
    try {
        let [response, imageData] = await Promise.all([
            axios.post("/api/publish-prompt", {
                prompt: image.prompt,
                style: image.style,
                model: image.model,
                imageSize: 1,
            }), imageToAvif(image.arrayBuffer)]);
        if (response.data.error) {
            return { error: response.data.error }
        }
        console.log("done")
        let { share } = response.data;
        image.shareId = share.id;
        let uploadUrl = response.data.uploadUrl;
        console.log("uploading")
        await axios.put(uploadUrl, imageData, {
            headers: {
                "Content-Type": "image/avif",
            },
        });
        let confirmResult = await axios.put(`/api/shared-image/${response.data.sharedImage.id}`, {
            uploaded: true,
        });
        return share;
    } catch (err) {
        if (err) {
            console.error(err);
            return { error: err.message }
        }
    }
}