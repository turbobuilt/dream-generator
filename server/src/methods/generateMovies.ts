import { ImageGenerationRequest } from "../models/ImageGenerationRequest";
import { generateImageReplicate } from "./generateImageReplicate";
import { generateImageRunpod } from "./runpodGenerateImage";
import axios from "axios";
import * as HME from "h264-mp4-encoder";
import sharp from "sharp";
import * as fs from "fs";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

let client = new S3Client({
    region: "auto",
    endpoint: "https://6d1fd8715ac1dc4960355505312f9f79.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: process.env.s3_access_key_id,
        secretAccessKey: process.env.s3_secret_access_key,
    }
});



export async function generateMovies() {
    let [categories] = await global.db.query(`SELECT * FROM PromptCategory`) as any[];
    for (let category of categories) {
        console.log("Generating movie for category", category);
        let [prompts] = await global.db.query(`SELECT Prompt.*, COUNT(*) as numLikes 
        FROM Prompt 
        LEFT JOIN PromptLike ON PromptLike.prompt = Prompt.id
        WHERE promptCategory = ? AND Prompt.text IS NOT NULL AND Prompt.text != ""
        GROUP BY Prompt.id
        ORDER BY numLikes DESC
        LIMIT 1`, [category.id]) as any[];
        if (prompts.length == 0)
            continue;

        let results = [];
        for (let prompt of prompts) {
            let imRequest = new ImageGenerationRequest();
            let result = await generateImageRunpod(prompt.text, imRequest);
            console.log("RESULT IS", result)
            if(!result?.outputUrl)
                continue;
            results.push(result?.outputUrl);
        }
        // results = [
        //     "https://fastly.picsum.photos/id/721/200/300.jpg?blur=5&hmac=VDQKPGKxP3kBIg1icAcXYuQ1vk7P5Q-4D-5lv9RhM80",
        //     'https://fastly.picsum.photos/id/368/200/300.jpg?hmac=qqvgzPEXwcvVBrpVDtVeofz3jGWFgOVpRiiQU_ddP8Y',
        //     'https://14068d66ba387efac9ce5e4b1741bcf2.r2.cloudflarestorage.com/sls/09-23/7ddd3800-37d4-4a3d-ba16-1dafd9a69429/da954a0d.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=0f059df39ab45a0cdab74b629b7951a5%2F20230919%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20230919T083941Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=9535c65bf0cea4f4aea4b181e90cf71ee13e5536de8dd0147176b5f3d365227e',
        // ];
        console.log(results);
        if (!results.length) {
            console.log("No valid results for category", category);
            continue;
        }
        // download images to ram
        let promises = [];
        for (let url of results) {
            promises.push(new Promise((resolve, reject) => {
                axios.get(url, { responseType: 'arraybuffer' }).then(res => {
                    resolve(res.data);
                }).catch(err => {
                    reject(err);
                })
            }));
        }
        let images = await Promise.all(promises);
        console.log(images)
        const encoder = await HME.createH264MP4Encoder();

        // Must be a multiple of 2.
        encoder.width = 512;
        encoder.height = 512;
        encoder.frameRate = 1;
        encoder.quantizationParameter = 10;
        encoder.groupOfPictures = 2;
        encoder.initialize();
        // set frame rate to .5
        for (let image of images) {
            console.log("doing image")
            let sharped = await sharp(image).resize(encoder.width, encoder.height, {
                fit: 'cover',
                position: "entropy"
            }).ensureAlpha().raw().toBuffer();
            encoder.addFrameRgba(sharped);
            encoder.addFrameRgba(sharped);
        }
        encoder.finalize();
        const uint8Array = encoder.FS.readFile(encoder.outputFilename);
        encoder.delete();
        try {
            // upload to cloudflare r2 to /share/prompt-category/id/preview.mp4
            // first delete
            let deleteCommand = new DeleteObjectCommand({
                Bucket: "dreamgenerator",
                Key: `share/prompt-category/${category.id}/preview.mp4`,
            });
            try {
                await client.send(deleteCommand);
            } catch (e) {
                console.error("error deleting", e);
            }
            let command = new PutObjectCommand({
                Bucket: "dreamgenerator",
                Key: `share/prompt-category/${category.id}/preview.mp4`,
                Body: uint8Array,
                ContentType: "video/mp4",
            });
            await client.send(command);
        } catch (e) {
            console.error("error uploading to cloudflare", e);
        }
        console.log("done with category")

        // process.exit();
    }
}

