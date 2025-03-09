import { Request, Response } from "express";
import * as OctoAI from '@octoai/sdk';
import { octoApiToken } from "./postAiChat";
import { ImageGenerationRequest } from "../models/ImageGenerationRequest";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { dreamGenOutS3Client } from "./s3";

export async function generateSdxlLightningOctoAi(prompt, imgGenRequest: ImageGenerationRequest) {
    let octoAi = new OctoAI.OctoAIClient({ apiKey: octoApiToken });

    // console.log(response.data);
    // imgGenRequest.taskId = response.data.id;
    imgGenRequest.provider = "octoai";
    imgGenRequest.model = "flux-schnell";
    imgGenRequest.status = "IN PROGRESS";
    await imgGenRequest.save();

    (async () => {
        try {
            let result = await octoAi.imageGen.generateSdxl({
                prompt: prompt,
                negativePrompt: "ornament, Blurry, low-res, poor quality",
                checkpoint: "octoai:lightning_sdxl",
                width: 1024,
                height: 1024,
                numImages: 1,
                sampler: "DDIM",
                steps: 8,
                cfgScale: 3,
                // seed: 3327823665,
                useRefiner: false,
                // stylePreset: "base",
            });
            let image = result.images[0].imageB64;
            imgGenRequest.status = "COMPLETED";
            // imgGenRequest.results = { image };

            let key = imgGenRequest.authenticatedUser + "_" + imgGenRequest.taskId;
            let response = Buffer.from(image, 'base64');
            //convert to jpeg
            response = await sharp(response).jpeg().toBuffer();
            let command = new PutObjectCommand({
                Bucket: "dreamgenout",
                Key: key,
                Body: response,
                ContentType: "image/jpeg",
                ContentLength: response.length
            })
            // charge user .2 credits
            let creditCost = .2;
            await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, imgGenRequest.authenticatedUser]);

            let uploadResponse = await dreamGenOutS3Client.send(command);
            imgGenRequest.outputUrl = "https://out.dreamgenerator.ai/" + key;
            await imgGenRequest.save()
        } catch (err) {
            console.error("error saving output", err);
            imgGenRequest.status = "FAILED";
            imgGenRequest.error = "Error saving output.  Contact support at support@dreamgenerator.ai for help. " + err.message;
            imgGenRequest.save();
        }
    })().catch(err => {
        console.error("error with octoai", err);
    });

    return imgGenRequest;

    // engine=Engine.SDXL,
    // prompt="((glass orb)) with snowy christmas scene in it ",
    // negative_prompt="ornament, Blurry, low-res, poor quality",
    // checkpoint="octoai:lightning_sdxl",
    // width=1024,
    // height=1024,
    // num_images=1,
    // sampler="DDIM",
    // steps=8,
    // cfg_scale=3,
    // seed=3327823665,
    // use_refiner=False,
    // style_preset="base",

    // octoAi.imageGen
}