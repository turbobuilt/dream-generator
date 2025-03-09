import { fal } from "@fal-ai/client";
import { TextToSpeech } from "../models/TextToSpeech";
import { textToSpeechModels } from "./getTextToSpeechModels";

fal.config({
    credentials: process.env.fal_key
});


export async function pollTextToSpeechStatus(request, response, falId) {
    console.log("User is ", request.authenticatedUser);
    try {
        let [textToSpeechData] = await global.db.query(`SELECT * FROM TextToSpeech WHERE falId = ?`, [falId]);
        let textToSpeech = new TextToSpeech();
        Object.assign(textToSpeech, textToSpeechData[0]);

        if (textToSpeech.status === "COMPLETED") {
            let [[creditsRemainingData]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`, [textToSpeech.authenticatedUser]);
            return {
                textToSpeech,
                creditsRemaining: creditsRemainingData.creditsRemaining
            }
        }

        // check result
        const status = await fal.queue.status("fal-ai/playai/tts/v3", {
            requestId: textToSpeech.falId,
            logs: true,
        });
        console.log("Status", status);
        if (status.status === "COMPLETED") {
            // check result
            const result = await fal.queue.result("fal-ai/playai/tts/v3", {
                requestId: textToSpeech.falId
            });
            console.log(result.data);
            console.log(result.requestId);
            textToSpeech.duration = result.data.audio.duration; // seconds
            textToSpeech.outputUrl = result.data.audio.url;
            textToSpeech.status = status.status;
            await textToSpeech.save();
            let model = textToSpeechModels.find(m => m.model === textToSpeech.model && m.provider === textToSpeech.provider);
            let creditCost = textToSpeech.duration / 60 * model.dollarsPerMinute;
            console.log("credit cost is", creditCost);
            let [_, [[creditsRemainingData]]] = await Promise.all([
                global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, textToSpeech.authenticatedUser]),
                global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`, [textToSpeech.authenticatedUser])
            ]);
            console.log("Credits remaining", creditsRemainingData);
            return {
                textToSpeech,
                creditsRemaining: creditsRemainingData.creditsRemaining
            }
        } else {
            if (textToSpeech.status !== status.status) {
                textToSpeech.status = status.status;
                await textToSpeech.save();
            }
        }
        return {textToSpeech};
    } catch (error) {
        console.error(error);
        throw error;
    }
}