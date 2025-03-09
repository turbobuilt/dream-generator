

import { generateImage } from './generateImage';
import bodyParser from "body-parser";
import formidable, { errors as formidableErrors } from 'formidable';
import { getFormData } from './submitImageModifyWithPrompt';
import * as OctoAI from '@octoai/sdk';
import { octoApiToken } from "./postAiChat";
import fetch from "node-fetch";
import { writeFile } from 'fs/promises';
import sharp from 'sharp';
import { ImageUpscaleRequest } from '../models/ImageUpscaleRequest';
const busboy = require('busboy');
import * as fal from "@fal-ai/serverless-client";
import { inspect } from 'util';



const creditCost = .4 * 2;

export async function postSubmitImageUpscale(req, res) {
    console.log("getting form");
    let { scaleFactor } = req.query;
    let data = await getFormData(req);
    console.log("data is", data);

    try {
        // check if image isn't jpeg or png
        let img = await sharp(data["image"].data).metadata();
        let imgJpg = data["image"].data;
        if (!["jpeg", "png"].includes(img.format)) {
            imgJpg = await sharp(data["image"].data).jpeg().toBuffer();
        }

        let imageUpscaleRequest = new ImageUpscaleRequest();
        imageUpscaleRequest.authenticatedUser = req.authenticatedUser.id;
        await imageUpscaleRequest.save();

        let imageBase64Url = `data:image/jpeg;base64,${imgJpg.toString('base64')}`;
        const result = await fal.subscribe("fal-ai/aura-sr", {
            input: {
                image_url: imageBase64Url,
                scale: 4
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        }) as any;
        // try {
        //     // var result = await fal.subscribe("fal-ai/ccsr", { image_url: imageBase64Url }) as any;
        //     const file = new File([imgJpg], "image.jpg");
        //     const url = await fal.storage.upload(file);
        //     var result = await fal.subscribe("fal-ai/ccsr", {
        //         input: {
        //             image_url: url,
        //         },
        //         logs: true,
        //         onQueueUpdate: (update) => {
        //             if (update.status === "IN_PROGRESS") {
        //                 update.logs.map((log) => log.message).forEach(console.log);
        //             }
        //         },
        //     });
        // } catch (err) {
        //     try {
        //         fal.storage
        //     } catch (err) { 

        //     }
        //     if (err.body) {
        //         console.log("error body", inspect(err.body, false, null, true));
        //         return res.status(500).send({ error: err.body });
        //     } else {
        //         console.log("error", err);
        //         return res.status(500).send({ error: err });
        //     }
        // }
        let outputImageUrl = result.image.url;
        // download image to buffer
        let outputImageRes = await fetch(outputImageUrl);
        let buffer = await outputImageRes.buffer();
        let contentType = "image/png";


        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, req.authenticatedUser.id]);
        imageUpscaleRequest.authenticatedUser = req.authenticatedUser.id;
        await imageUpscaleRequest.save();

        let [[authenticatedUser]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]);

        res.setHeader('Content-Type', contentType);
        res.setHeader('x-credits-remaining', authenticatedUser.creditsRemaining);
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Error generating image " + err.message });
    }
    return;








    try {
        // write to testjpg.jpg
        // await writeFile("./testjpg.jpg", imgPng);
        // console.log("imgPng", imgPng.toString('base64'));
        scaleFactor = parseInt(scaleFactor);
        console.log("scaleFactor", scaleFactor);
        let octoRes = await fetch("https://image.octoai.run/upscaling", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${octoApiToken}`
            },
            body: JSON.stringify({
                model: "real-esrgan-x4-v3",
                scale: scaleFactor,
                init_image: imgPng.toString('base64'), // data["image"].data.toString('base64'),
                output_image_encoding: "png" // png
            })
        });
        if (!octoRes.ok) {
            let text = "";
            try {
                text = await octoRes.text();
            } catch (err) { }
            console.log("error upscaling image", octoRes.statusText, text);
            return res.status(500).send({ error: octoRes.statusText + " " + text });
        }

        let octoResJson = await octoRes.json();
        if (octoResJson.removed_for_safety) {
            return res.status(400).send({ error: "Image was removed for \"safety\" reasons, aka had content the system thought was innapropriate. Hopefully we will fix this soon, but I wouldn't count on it lol.  email support@dreamgenerator.ai if you want this fixed faster." });
        }
        let outputImage = octoResJson.image_b64;
        let buffer = Buffer.from(outputImage, 'base64');
        let contentType = "image/jpeg";

        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, req.authenticatedUser.id]);

        let imageUpscaleRequest = new ImageUpscaleRequest();
        imageUpscaleRequest.authenticatedUser = req.authenticatedUser.id;
        await imageUpscaleRequest.save();

        let [[authenticatedUser]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]);

        res.setHeader('Content-Type', contentType);
        res.setHeader('x-credits-remaining', authenticatedUser.creditsRemaining);
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Error generating image " + err.message });
    }






    // let octoAi = new OctoAI.OctoAIClient({ apiKey: octoApiToken });
    // let result = await octoAi.({
    //     prompt: prompt,
    //     negativePrompt: "ornament, Blurry, low-res, poor quality",
    //     checkpoint: "octoai:lightning_sdxl",
    //     width: 1024,
    //     height: 1024,
    //     numImages: 1,
    //     sampler: "DDIM",
    //     steps: 8,
    //     cfgScale: 3,
    //     // seed: 3327823665,
    //     useRefiner: false,
    //     // stylePreset: "base",
    // });
    // console.log("octoai result is", result);
    // let image = result.images[0].imageB64;
    // imgGenRequest.status = "COMPLETED";
    // console.log("image", image);
    // // imgGenRequest.results = { image };

    // let key = imgGenRequest.authenticatedUser + "_" + imgGenRequest.taskId;
    // let response = Buffer.from(image, 'base64');
    // //convert to jpeg
    // response = await sharp(response).jpeg().toBuffer();
    // let command = new PutObjectCommand({
    //     Bucket: "dreamgenout",
    //     Key: key,
    //     Body: response,
    //     ContentType: "image/jpeg",
    //     ContentLength: response.length
    // })
    // let uploadResponse = await dreamGenOutS3Client.send(command);
    // console.log("upload response", uploadResponse);
    // imgGenRequest.outputUrl = "https://out.dreamgenerator.ai/" + key;
    // await imgGenRequest.save()
}

export const route = { url: '/api/submit-image-upscale', method: 'POST', authenticated: true };


// export function getFormData(req) {
//     let data = {};
//     return new Promise(resolve => {
//         const bb = busboy({ headers: req.headers });
//         bb.on('file', (name, file, info) => {
//             let fileData = [];
//             const { filename, encoding, mimeType } = info;
//             console.log(
//                 `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
//                 filename,
//                 encoding,
//                 mimeType
//             );
//             file.on('data', (data) => {
//                 fileData.push(data);
//             }).on('close', () => {
//                 console.log(`File [${name}] Finished`);
//                 data[name] = { mimeType, data: Buffer.concat(fileData) };
//             });
//         });
//         bb.on('field', (name, val, info) => {
//             data[name] = val;
//         });
//         bb.on('close', () => {
//             console.log('Closed');
//             resolve(data);
//         });
//         req.pipe(bb);
//     });
// }