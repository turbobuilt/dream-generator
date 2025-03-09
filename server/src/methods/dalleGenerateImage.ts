// GXZH1OPI8UWU1EXPVG30KP90MVEV41DIGGAZSXNL


// typescript

// The function will go as follows:
// Step 1: Import the Replicate library
// Step 2: Create a new instance of Replicate using the api token stored in the process.env.REPLICATE_API_TOKEN
// Step 3: The function will call the run function on the replicate instance, passing in the "stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82" and an options object that includes the input as given from the function parameters 
// Step 4: The function will return the output of the run function

import Replicate from 'replicate';
import { ImageGenerationRequest } from '../models/ImageGenerationRequest';
import axios from 'axios';
import { imageModels } from './generateImage';
import * as https from "https";
import { IncomingMessage } from 'http';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { dreamGenOutS3Client } from "./s3";

export async function dalleGenerateImage(prompt: string, imgGenRequest: ImageGenerationRequest): Promise<any> {
    try {
        imgGenRequest.provider = "openai";
        imgGenRequest.model = "dalle3";
        await imgGenRequest.save();

        axios.post("https://api.openai.com/v1/images/generations", {
            model: "dall-e-3",
            prompt: prompt,
            "n": 1,
            "size": "1024x1024",
            response_format: "url"
        }, {
            headers: { Authorization: `Bearer ${process.env.openai_api_key}` }
        }).then(async response => {
            console.log(response.data);
            let imageModel = imageModels["dalle3"];
            global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = creditsRemaining - ? WHERE id=?`, [imageModel.creditCost, imgGenRequest.authenticatedUser]).catch(err => {
                console.error("Error reducing credits")
                console.error(err)
            });

            // if (client == "web") {
            let key = imgGenRequest.authenticatedUser + "_" + imgGenRequest.taskId;
            // upload to s3.  pipe url.  use dreamGenOutS3Client. pipe using https
            let imgDownloadResponse = await new Promise((resolve, reject) => {
                https.get(response.data.data[0].url, (res) => {
                    resolve(res);
                }).on('error', (e) => {
                    reject(e);
                });
            }) as IncomingMessage;
            let command = new PutObjectCommand({
                Bucket: "dreamgenout",
                Key: key,
                Body: imgDownloadResponse,
                ContentType: "image/png",
                ContentLength: parseInt(imgDownloadResponse.headers["content-length"])
            })
            try {
                let uploadResponse = await dreamGenOutS3Client.send(command);
                imgGenRequest.outputUrl = "https://out.dreamgenerator.ai/" + key;
            } catch (err) {
                console.error("error saving output", err);
                imgGenRequest.status = "FAILED";
                imgGenRequest.error = "Error saving output.  Contact support at support@dreamgenerator.ai for help. " + err.message;
                return;
            }
            // } else {
            //     imgGenRequest.outputUrl = url;
            // }

            imgGenRequest.status = "COMPLETED";
            imgGenRequest.save().catch(err => {
                console.error("Erro saving img gen request", response.data, imgGenRequest);
                console.error(err);
            })
        }).catch(err => {
            console.error(err);
            imgGenRequest.status = "FAILED";
            imgGenRequest.error = err.message;
            imgGenRequest.save().catch(err => {
                console.error("Erro saving img gen request", err, imgGenRequest);
                console.error(err);
            })
        });
        return imgGenRequest;
    } catch (error) {
        try {
            imgGenRequest.status = "FAILED";
            imgGenRequest.error = error.message;
            if (error.message?.indexOf("NSFW") > -1)
                imgGenRequest.nsfw = true;
            await imgGenRequest.save();
        } catch (err) {
            console.error("Error saving error");
            console.error(err);
        }
        console.error(error);
        console.error(`Failed to generate replicate: ${error.message}`);
    }
}
