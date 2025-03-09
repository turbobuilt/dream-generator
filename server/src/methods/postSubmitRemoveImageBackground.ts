

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
import { RemoveImageBackgroundRequest } from '../models/RemoveImageBackgroundRequest';
const busboy = require('busboy');
import * as fal from "@fal-ai/serverless-client";

const creditCost = .5 // .05 * 2;

export async function postSubmitRemoveImageBackground(req, res) {
    let data = await getFormData(req);
    // let result = await generateImage({ ...data as any, authenticatedUser: req.authenticatedUser }, req);
    // return res.json(result);
    // curl -X POST "https://image.octoai.run/upscaling" \
    // -H "Content-Type: application/json" \
    // -H "Authorization: Bearer $OCTOAI_TOKEN" \
    // --data-raw '{
    //     "model": "real-esrgan-x4-plus",
    //     "scale": 2,
    //     "init_image": "<BASE64_IMAGE>",
    //     "output_image_encoding": "png"
    // }'


    try {
        let removeImageBackgroundRequest = new RemoveImageBackgroundRequest();
        removeImageBackgroundRequest.authenticatedUser = req.authenticatedUser.id;
        await removeImageBackgroundRequest.save();
        
        let img = await sharp(data["image"].data).metadata();
        let imgFormatted = data["image"].data;
        if (!["jpg"].includes(img.format)) {
            imgFormatted = await sharp(data["image"].data).jpeg().toBuffer();
        }

        let base64ImageUrl = imgFormatted.toString('base64');
        const result = await fal.subscribe("fal-ai/birefnet", {
            input: {
                image_url: `data:image/png;base64,${base64ImageUrl}`,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    // update.logs.map((log) => log.message).forEach(console.log);
                    removeImageBackgroundRequest.status = "IN PROGRESS";
                    removeImageBackgroundRequest.save().catch(console.error);
                }
            },
        }) as any;

        let outputImageUrl = result.image.url;
        // download image to buffer
        let outputImageRes = await fetch(outputImageUrl);
        let buffer = await outputImageRes.buffer();
        let contentType = "image/png";


        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, req.authenticatedUser.id]);
        removeImageBackgroundRequest.authenticatedUser = req.authenticatedUser.id;
        await removeImageBackgroundRequest.save();

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
        // check if image isn't jpeg or png
        let img = await sharp(data["image"].data).metadata();
        let imgPng = data["image"].data;
        if (!["jpeg", "png"].includes(img.format)) {
            imgPng = await sharp(data["image"].data).png().toBuffer();
        }

        // resize to max 2048 per side
        imgPng = await sharp(imgPng).resize({ width: 2048, height: 2048, fit: "inside" }).toBuffer();

        // resize to fit in 
        // write to testjpg.jpg
        // await writeFile("./testjpg.jpg", imgPng);
        // console.log("imgPng", imgPng.toString('base64'));
        let octoRes = await fetch("https://image.octoai.run/background-removal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${octoApiToken}`
            },
            body: JSON.stringify({
                // model: "real-esrgan-x4-plus",
                // scale: scaleFactor,
                init_image: imgPng.toString('base64'), // data["image"].data.toString('base64'),
                // output_image_encoding: "png" // png
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
        let contentType = "image/png";


        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, req.authenticatedUser.id]);
        // insert ImageUpscaleRequest
        let removeImageBackgroundRequest = new RemoveImageBackgroundRequest();
        removeImageBackgroundRequest.authenticatedUser = req.authenticatedUser.id;
        await removeImageBackgroundRequest.save();

        let [[authenticatedUser]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]);

        res.setHeader('Content-Type', contentType);
        res.setHeader('x-credits-remaining', authenticatedUser.creditsRemaining);
        res.setHeader('Content-Length', buffer.length);
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

export const route = { url: '/api/submit-remove-image-background', method: 'POST', authenticated: true };


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