import * as fal from "@fal-ai/serverless-client";
import { Request, Response } from "express";
import * as OctoAI from '@octoai/sdk';
import { octoApiToken } from "./postAiChat";
import { ImageGenerationRequest } from "../models/ImageGenerationRequest";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { dreamGenOutS3Client } from "./s3";
import { GenerateAudioRequest } from "../models/GenerateAudioRequest";

fal.config({
    credentials: "384ee725-a786-45e4-b6ab-84a335bad2f3:17e9937f6305bf96059ef9fcb55af623"
});

export const audioGenModels = Object.fromEntries([
    {
        id: "fal-ai/stable-audio",
        pricePerMinute: 0.01506 * 3,
        maxDuration: 47
    }
].map((model) => [model.id, model]));

export async function postGenerateAudio(req, res, promptData: GenerateAudioRequest) {
    let generateAudioRequest = new GenerateAudioRequest();
    Object.assign(generateAudioRequest, promptData);
    generateAudioRequest.status = "created";

    if (!generateAudioRequest.model) {
        generateAudioRequest.model = "fal-ai/stable-audio";
    }
    let model = audioGenModels[generateAudioRequest.model];
    if (!model) {
        return res.status(400).send({ error: "Invalid model. please contact support!" });
    }
    promptData.duration < model.maxDuration ? promptData.duration : model.maxDuration
    await generateAudioRequest.save();
    let creditCost = model.pricePerMinute * (promptData.duration / 60);

    // enusre user can afford
    let [[authenticatedUser]] = await db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]);
    if (authenticatedUser.creditsRemaining < creditCost) {
        return res.status(400).send({ error: "Insufficient credits. Please purchase more credits." });
    }

    try {
        const result: any = await fal.subscribe("fal-ai/stable-audio", {
            input: {
                prompt: generateAudioRequest.prompt,
                seconds_total: generateAudioRequest.duration,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        }) as any;
        console.log("result is", result);
        generateAudioRequest.outputUrl = result.audio_file.url;
        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, req.authenticatedUser.id]);
        await generateAudioRequest.save()
        console.log("result is", result);
    } catch (err) {
        console.error("error saving output", err);
        generateAudioRequest.status = "FAILED";
        generateAudioRequest.error = "Error saving output.  Contact support at support@dreamgenerator.ai for help. " + err.message;
        generateAudioRequest.save();
        return res.status(500).send({ error: "Error generating audio " + err.toString() });
    }

    return generateAudioRequest;
}