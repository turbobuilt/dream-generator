import { encode } from '@jsquash/avif';


async function imageToAvif(imageData) {
    // alert("Having some issues with this. Check back soon!");
    // return;
    // let encode = await loadAvif();
    console.log("encoding avif")
    let avif = await encode(imageData);
    console.log("encoded avif")
    return avif;
}

let isConverting = false;
addEventListener('message', async function (event) {
    const { imageData } = event.data;
    // const result = await convert(sourceType, outputType, fileBuffer);
    const result = await imageToAvif(imageData);

    // Send the converted image back to the main thread
    postMessage(result);
    isConverting = false;
});