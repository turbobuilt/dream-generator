// typescript

// Plan
// 1. Import necessary libraries and modules. For this function we need express for handling requests and responses.
// 2. Define interface IRequest and IResponse for clarity between function parameters.
// 3. Create async function pollImageStatus which takes 'req' and 'res', both of type any for now.
// 4. For now, the function won't perform any operations, it will just send a simple response back indicating the function was called.

import { Request, Response, response } from "express";
import axios from "axios";
import { ImageGenerationRequest } from "../models/ImageGenerationRequest";
import { getRunpodStatus } from "./getRunpodStatus";
import { getReplicateStatus } from "./getReplicateStatus";

export async function pollImageStatusMany(req: Request, res: Response) {
    console.log("Polling Status");
    let { taskIds, client } = req.body as { taskIds: string[], client: string };
    if (!taskIds) {
        return res.status(400).json({ error: "Task ID array not included in request.  Please try again later. If it persists, contact support! support@dreamgenerator.ai" });
    }
    if(taskIds.length == 0) {
        return res.status(400).json({ error: "Task ID array is empty.  Please try again later. If it persists, contact support!" });
    }

    // get from db
    let placeholders = [];
    for(let id of taskIds) {
        placeholders.push("?")
    }
    let [imgGenRequests] = await global.db.query(`SELECT * FROM ImageGenerationRequest WHERE taskId IN (${placeholders.join(",")}) and authenticatedUser=? `, [...taskIds, req.authenticatedUser.id]);
    console.log('task ids', taskIds)


    if (!imgGenRequests || !imgGenRequests.length) {
        return res.status(400).send({ error: "Error finding tasks. " + taskIds.join(",") + "  This is an internal bug unless you are hacking.  Please contact me at support@dreamgenerator.ai for help" });
    }

    let responses = [] as { outputUrl?: string, error?: string, creditsRemaining?: number, taskId?: string, model?: string, status?: string, nsfw?: any }[];
    let promises = [];
    for (let imgGenRequest of imgGenRequests) {
        promises.push(getStatus(new ImageGenerationRequest(imgGenRequest), req, client));
    }
    responses = await Promise.all(promises);
    console.log("responses", responses);
    return res.json({ statuses: responses });
}


async function getStatus(imgGenRequest: ImageGenerationRequest, req, client) {
    if (imgGenRequest.status == "COMPLETED") {
        return { outputUrl: imgGenRequest.outputUrl, error: null, creditsRemaining: req.authenticatedUser.creditsRemaining, taskId: imgGenRequest.taskId, model: imgGenRequest.model, status: "COMPLETED" };
    }
    console.log("Getting status", imgGenRequest.taskId, imgGenRequest.provider);
    if (imgGenRequest.provider == "runpod") {
        await getRunpodStatus(imgGenRequest, client as any, req.authenticatedUser);
    } else if (imgGenRequest.provider == "replicate") {
        await getReplicateStatus(imgGenRequest);
    } else if (imgGenRequest.provider == "openai") {

    }

    let formattedStatus = imgGenRequest.status.toLowerCase().replace("_", " ").replace(/\b./g, str => str.toUpperCase());
    
    if (imgGenRequest.status == "FAILED") {
        return { error: imgGenRequest.error || "Error Processing, this happens sometimes, you just have to try again a couple times. Working on a fix! If it continues, please contact support@dreamgenerator.ai.", status: formattedStatus, nsfw: imgGenRequest.nsfw };
        
    }
    if (imgGenRequest.status != "COMPLETED") {
        return { status: formattedStatus };
    }

    if (!imgGenRequest.charged) {
        let creditCost = 1;
        if (imgGenRequest.model == "sd-openjourney") {
            creditCost = .2;
        } else if (imgGenRequest.model == "dalle3") {
            creditCost = 10;
        }
        imgGenRequest.charged = true;
        await imgGenRequest.save();
        if (!imgGenRequest.isFree) {
            await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = creditsRemaining - ? WHERE id=?`, [creditCost, req.authenticatedUser.id])
        }
    }
    let [[userData]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id])

    let responseData = { outputUrl: imgGenRequest.outputUrl, error: null, creditsRemaining: userData.creditsRemaining, taskId: imgGenRequest.taskId, model: imgGenRequest.model };
    console.log("Sending response", responseData)
    return responseData;
}

export const route = { url: '/api/poll-image-status-many', method: 'POST', authenticated: true };