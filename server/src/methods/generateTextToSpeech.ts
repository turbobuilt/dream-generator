import { fal } from "@fal-ai/client";
import { TextToSpeech } from "../models/TextToSpeech";
import { textToSpeechModels } from "./getTextToSpeechModels";

fal.config({
    credentials: process.env.fal_key
});
// creat class     "create class TextToSpeech": `CREATE TABLE TextToSpeech (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id) ON DELETE CASCADE ON UPDATE CASCADE, text TEXT, model VARCHAR(255), status VARCHAR(255), duration INT, error TEXT, outputUrl TEXT)`,

// Charlotte (Advertising) (English (CA)/Canadian)

export async function generateTextToSpeech(req, res, prompt, modelId) {
    console.log("generateTextToSpeech", prompt);    
    try {
        // query to make sure no more than 150 in 24 hours
        let [textToSpeechCount] = await global.db.query(`SELECT COUNT(*) as count FROM TextToSpeech WHERE created > ? AND createdBy = ?`, [Date.now() - 86400000, 1]);
        if (textToSpeechCount.count >= 150) {
            throw new Error("You have reached the limit of 150 text to speech requests in 24 hours. If this is an issue contact support@dreamgenerator.ai");
        }
        // limit to 5000 chars
        if (prompt.length > 25000) {
            throw new Error("Text to speech request is limited to 25000 characters. email support@dreamgenerator.ai to increase limit.");
        }

        // estimate if can afford
        // avg 100 wpm, each word is 4 chars
        let words = prompt.length / 4;
        let estimatedCost = words / 100 * textToSpeechModels[0].dollarsPerMinute;
        let [creditsRemaining] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`, [1]);
        // creditsRemaining is in cents
        if (creditsRemaining.creditsRemaining < estimatedCost * 100) {
            throw new Error("Insufficient credits to generate text to speech. Please add credits to your account.");
        }
        let model = modelId ? textToSpeechModels.find(m => m.id === modelId) : textToSpeechModels[0];

        const textToSpeech = new TextToSpeech();
        textToSpeech.text = prompt;
        textToSpeech.status = "started";
        textToSpeech.model = model.model;
        textToSpeech.provider = model.provider;
        textToSpeech.authenticatedUser = req.authenticatedUser.id;
        console.log("text to speech is ", textToSpeech);
        await textToSpeech.save();

        const { request_id } = await fal.queue.submit("fal-ai/playai/tts/v3", {
            input: {
              input: prompt,
              voice: model.voice,
            },
            webhookUrl: "https://optional.webhook.url/for/results",
          });
        textToSpeech.falId = request_id;
        await textToSpeech.save();
        return textToSpeech;
        let creditCost = .5;
        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, imgGenRequest.authenticatedUser]);
    } catch (error) {
        console.error(error);
        throw error;
    }
}