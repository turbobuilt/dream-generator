import * as fal from "@fal-ai/serverless-client";



import { Request, Response } from "express";
import * as OctoAI from '@octoai/sdk';
import { octoApiToken } from "./postAiChat";
import { ImageGenerationRequest } from "../models/ImageGenerationRequest";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { dreamGenOutS3Client } from "./s3";

fal.config({
    credentials: "384ee725-a786-45e4-b6ab-84a335bad2f3:17e9937f6305bf96059ef9fcb55af623"
});

export async function generateImageFluxSchnell(prompt, imgGenRequest: ImageGenerationRequest) {
    let octoAi = new OctoAI.OctoAIClient({ apiKey: octoApiToken });

    // console.log(response.data);
    // imgGenRequest.taskId = response.data.id;
    imgGenRequest.provider = "fal-ai";
    imgGenRequest.model = "flux-schnell";
    imgGenRequest.status = "IN PROGRESS";
    await imgGenRequest.save();
    console.log("imgGenRequest flux ", imgGenRequest);

    (async () => {
        try {
            // let result = await octoAi.imageGen.generateSdxl({
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
            const result = await fal.subscribe("fal-ai/flux/schnell", {
                input: {
                    prompt: prompt,
                    enable_safety_checkerboolean: false,
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        // update.logs.map((log) => log.message).forEach(console.log);
                        imgGenRequest.status = "IN PROGRESS";
                        imgGenRequest.save().catch(console.error);
                    }
                },
            }) as any;
            let imageUrl = result.images[0].url;
            imgGenRequest.status = "COMPLETED";
            imgGenRequest.outputUrl = imageUrl;
            let creditCost = .5;
            await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, imgGenRequest.authenticatedUser]);
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