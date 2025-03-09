import { Request, Response } from 'express';
import OpenAI from 'openai';
import { inspect } from 'util';
import assert from "node:assert";
import { getEncoding, encodingForModel } from "js-tiktoken";
import { AiChatRequest } from '../models/AiChatRequest';
const enc = getEncoding("cl100k_base");
import moment from "moment";
import { Client } from "@octoai/client";
import llama3Tokenizer from 'llama3-tokenizer-js'
import { generateGoogleChat } from './generateGoogleChat';

export const octoApiToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNkMjMzOTQ5In0.eyJzdWIiOiJhNjFiYWFlZS04YjVjLTQ5MjUtOTMzNy1kNmY4NDAwZGM1MzMiLCJ0eXBlIjoidXNlckFjY2Vzc1Rva2VuIiwidGVuYW50SWQiOiI4MDBiYWViMS05ODEwLTQ4ZmMtYmFhZC1hZDU4NDgwZTQwYmEiLCJ1c2VySWQiOiJjMWQ2MDY3My0wOGFiLTRlZTAtYWJlNi0xZDY3NjdlMzNmYjkiLCJhcHBsaWNhdGlvbklkIjoiYTkyNmZlYmQtMjFlYS00ODdiLTg1ZjUtMzQ5NDA5N2VjODMzIiwicm9sZXMiOlsiRkVUQ0gtUk9MRVMtQlktQVBJIl0sInBlcm1pc3Npb25zIjpbIkZFVENILVBFUk1JU1NJT05TLUJZLUFQSSJdLCJhdWQiOiIzZDIzMzk0OS1hMmZiLTRhYjAtYjdlYy00NmY2MjU1YzUxMGUiLCJpc3MiOiJodHRwczovL2lkZW50aXR5Lm9jdG8uYWkiLCJpYXQiOjE3MTg2MDgxOTF9.pgMJhW4431vzP5BPpPYnjubfnntZ9ERhpCnt8nkN5WLThvigAJm9TL76WdXEuGNaqDWNLeKYjXZ-IWtu61uH4tlMN346v1I44Qy4nq9Ph01ccK4xh7-8mOGtVVMvpNkyoSXRpLIz1dMLxJc5i6UkeJQcz8Poy3g8w806Ayv7nCL1wY7dk4dIfdyOPaTpO2PV8yl6Osm75tZFwhCQUit_TpS60SU6LTsfw9VUnFBqSai9NiOrpNFjaQ0E8kSDuFLwUim4lkOBF0YSNxl1UA6lzj4UUsCcKmRmEIT2lJ0xXd3uIiT1zegYcPk8TZSHvLIeakSI_GBg12zaMObmIms_sQ";

// let markup = 1.4;
export const chatModelInfo = {
    "gpt-4o-mini": {
        "label": "GPT 4 mini",
        "inputTokenLimit": 4096,
        "outputTokenLimit": 4096,
        "inputTokenCost": .15 * 100 / 1_000_000 * 2.5,
        "outputTokenCost": .6 * 100 / 1_000_000 * 2.5,
        tokenizerFunction: (text) => enc.encode(text || '')
    },
    "gpt-4o": {
        "label": "GPT 4",
        // "inputTokenLimit": 4096,
        // "outputTokenLimit": 4096,
        "inputTokenCost": 10 * 100 / 1_000_000 * 1.2,
        "outputTokenCost": 30 * 100 / 1_000_000 * 1.2,
        tokenizerFunction: (text) => enc.encode(text || '')
    },
    // "gemini-1.5-flash": {
    //     "inputTokenCost": 10 * 100 / 1_000_000 * 1.2,
    //     "outputTokenCost": 30 * 100 / 1_000_000 * 1.2,
    //     tokenizerFunction: (text) => enc.encode(text || ''),
    //     type: "google"
    // }
    // "gpt-3.5-turbo": {
    //     "label": "GPT 3.5",
    //     "inputTokenLimit": 4096,
    //     "outputTokenLimit": 4096,
    //     "inputTokenCost": .5 * 100 / 1_000_000 * 2.5,
    //     "outputTokenCost": 1.5 * 100 / 1_000_000 * 2.5,
    //     tokenizerFunction: (text) => enc.encode(text || '')
    // },
    // "meta-llama-3-8b-instruct": {
    //     label: "LLAMA 3 8B",
    //     "inputTokenLimit": 8192,
    //     "outputTokenLimit": 8192,
    //     inputTokenCost: .15 * 100 / 1_000_000 * 2.5,
    //     outputTokenCost: .15 * 100 / 1_000_000 * 2.5,
    //     generateFunction: octoAiGen,
    //     tokenizerFunction: (text) => llama3Tokenizer.encode(text)
    // }
}

async function octoAiGen(model, messages) {
    const octoAi = new Client(octoApiToken);
    let result = await octoAi.chat.completions.create({
        stream: true,
        model: model,
        messages: messages
    });
    return result;
}

export function appendMessage(data, res) { 
    res.write(`d${data.length} ${data}`);
}

export default async function postAiChat(req: Request, res: Response) {
    // console.log("body is", req.body)
    var { messages, model } = req.body;
    if (!messages) {
        return res.status(400).send('Invalid request');
    }
    try {
        // select in last 24 hours
        let [[usageInfo]] = await global.db.query(`SELECT SUM(inputTokenCount) as inputTokenCount, SUM(outputTokenCount) as outputTokenCount FROM AiChatRequest WHERE authenticatedUser=? AND created > ${moment().subtract(1, 'day').toDate().getTime()}`, [req.authenticatedUser.id]);
        let maxDailyInputTokens = 150_000;
        let maxDailyOutputTokens = 150_000;


        // if ((req.authenticatedUser.plan && req.authenticatedUser.plan != "free") || req.authenticatedUser.creditsRemaining > 100) {
        //     maxDailyInputTokens = 1500;
        //     maxDailyOutputTokens = 1500;
        // }

        // if (usageInfo.inputTokenCount > maxDailyInputTokens) {
        //     return res.status(400).send(`This is in beta and you can only do small tests.  Current limit is ${maxDailyInputTokens} tokens per day.  To subscribe, please contact support@dreamgenerator.ai to join the beta!`);
        // } else if (usageInfo.outputTokenCount > maxDailyOutputTokens) {
        //     return res.status(400).send(`This is in beta and you can only do small tests.  Current output limit is ${maxDailyOutputTokens} tokens per day.  To subscribe, please contact support@dreamgenerator.ai to join the beta!`);
        // }

        model = model || "gpt-4o-mini";
        if (model === 'gpt-3.5-turbo')
            model = 'gpt-4o-mini';
        let modelInfo = chatModelInfo[model];

        let aiChatRequest = new AiChatRequest();
        aiChatRequest.authenticatedUser = req.authenticatedUser.id;
        var inputCost = 0;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        aiChatRequest.save();

        if (modelInfo.type === "google") {
            generateGoogleChat(messages, res);
            return;
        } else {

            let tokensCount = 0;
            for (let message of messages) {
                delete message.id;
                delete message.source;
                for (let content of message.content) {
                    if (content.type === "text")
                        tokensCount += modelInfo.tokenizerFunction(content.text || '').length;
                    else if (content.type === "image_url") {
                        // make sure not url to web
                        if (content.image_url.url.startsWith("http")) {
                            return res.status(400).json({ error: `Image URL not allowed` });
                        }
                        content.image_url.detail = "high";
                        let imageTokensCount = await computeImageTokens(content.image_url.url, content.image_url.detail);
                        tokensCount += imageTokensCount;
                        console.log("Tokens count", tokensCount)
                        // tokensCount += 85
                    }
                }
                console.log('message', message);
            }
            if (!modelInfo) {
                return res.status(400).json({ error: `Model ${model} not found` });
            }

            inputCost = tokensCount * modelInfo.inputTokenCost;
            if (inputCost * 2 > req.authenticatedUser.creditsRemaining) {
                return res.status(400).json({ error: `You don't have enough credits to run this request.  You need ${inputCost} credits, but you only have ${req.authenticatedUser.creditsRemaining} credits.`, code: "insufficient_credits" });
            }
            aiChatRequest.inputTokenCount = tokensCount;
            aiChatRequest.save();
        }

        const response = await getChatMessage(messages, model);

        let outputTokenCount = 0;
        for await (const chunk of response) {
            let data = chunk.choices[0]?.delta?.content || "";
            if (data) {
                outputTokenCount += modelInfo.tokenizerFunction(data).length;
            }
            try {
                appendMessage(data, res);
            } catch (err) {
                console.error("error writing stream", err);
            }
        }
        let outputCost = outputTokenCount * modelInfo.outputTokenCost;
        aiChatRequest.outputTokenCount = outputTokenCount;
        aiChatRequest.creditCost = inputCost + outputCost;
        aiChatRequest.save();
        console.log("aiChatRequest", aiChatRequest);
        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining=creditsRemaining-? WHERE id=?`, [aiChatRequest.creditCost, req.authenticatedUser.id]);
        let [[authenticatedUser]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]);
        res.write("e " + JSON.stringify(authenticatedUser));
        res.end();
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal server error');
    }
}


async function getChatMessage(messages, model) {
    const openai = new OpenAI({
        apiKey: process.env['openai_api_key'], // This is the default and can be omitted
    });
    for (let message of messages) {
        delete message.source;
    }
    const chatCompletion = await openai.chat.completions.create({
        messages: messages,
        model,
        stream: true
    });
    return chatCompletion;
}

async function computeImageTokens(imageData: string, detail: 'low' | 'high' = 'low'): Promise<number> {
    if (detail === 'low') {
        return 85;
    }

    const sharp = require('sharp');

    // Extract the base64 data from the data URI
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const metadata = await sharp(imageBuffer).metadata();
    let width = metadata.width || 0;
    let height = metadata.height || 0;

    // Scale to fit within a 2048 x 2048 square
    if (width > 2048 || height > 2048) {
        const scaleFactor = Math.min(2048 / width, 2048 / height);
        width *= scaleFactor;
        height *= scaleFactor;
    }

    // Scale so that the shortest side is 768px long
    const shortestSide = Math.min(width, height);
    if (shortestSide !== 768) {
        const scaleFactor = 768 / shortestSide;
        width *= scaleFactor;
        height *= scaleFactor;
    }

    // Calculate the number of 512px squares
    const tilesX = Math.ceil(width / 512);
    const tilesY = Math.ceil(height / 512);
    const totalTiles = tilesX * tilesY;

    // Compute the total token cost
    const tokenCount = 170 * totalTiles + 85;

    return Math.round(tokenCount);
}