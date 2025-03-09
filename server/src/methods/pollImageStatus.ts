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
import { imageModels } from "./generateImage";

export async function pollImageStatus(req: Request, res: Response) {
    let { taskId, client } = req.query;
    if (!taskId) {
        return res.status(400).json({ error: "Task ID not included in request.  Please try again later. If it persists, contact support! support@dreamgenerator.ai" });
    }
    // get from db
    let [[imgGenRequest]] = await global.db.query(`SELECT * FROM ImageGenerationRequest WHERE taskId=? and authenticatedUser=? `, [taskId, req.authenticatedUser.id]);
    if (!imgGenRequest) {
        return res.status(400).send({ error: "Error finding task. " + taskId + "  This is an internal bug unless you are hacking.  Please contact me at support@dreamgenerator.ai for help" });
    }
    imgGenRequest = Object.assign(new ImageGenerationRequest(), imgGenRequest);

    if (imgGenRequest.status == "COMPLETED") {
        // console.log("Image already completed", imgGenRequest);
        // if (imgGenRequest.provider === "modal" && !imgGenRequest.isFree) {
        //     // charge for image
        //     let creditCost = imageModels[imgGenRequest.model].creditCost;
        //     console.log("Charging user for image generation", creditCost);
        //     await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = GREATEST(creditsRemaining - ?,0) WHERE id=?`, [creditCost, req.authenticatedUser.id])
        //     let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id]);
        //     req.authenticatedUser = authenticatedUser;
        // }
        return res.json({ outputUrl: imgGenRequest.outputUrl, error: null, creditsRemaining: req.authenticatedUser.creditsRemaining, taskId: imgGenRequest.taskId, model: imgGenRequest.model, status: "COMPLETED" });
    }

    if (imgGenRequest.provider == "modal") {
        // console.log("Checking modal status", imgGenRequest, Date.now() - imgGenRequest.created > 5 * 1000, imgGenRequest.created)
        // check if it's been longer than 1.5 minutes
        if (Date.now() - imgGenRequest.created > 90 * 1000) {
            imgGenRequest.status = "FAILED";
            imgGenRequest.error = "It shouldn't take this long.  If it happens again, email support@dreamgenerator.ai. Working on a fix!"
            await imgGenRequest.save();
            return res.json({ error: imgGenRequest.error, status: "FAILED" });
        }
    }

    if (imgGenRequest.provider == "runpod") {
        await getRunpodStatus(imgGenRequest, client as any, req.authenticatedUser);
    } else if (imgGenRequest.provider == "replicate") {
        await getReplicateStatus(imgGenRequest);
    } else if (imgGenRequest.provider == "openai") {

    } else if (imgGenRequest.provider == "modal") {
        imgGenRequest.status = imgGenRequest.status || "STARTED";
    }
    let formattedStatus = imgGenRequest.status.toLowerCase().replace("_", " ").replace(/\b./g, str => str.toUpperCase());
    imgGenRequest = new ImageGenerationRequest(imgGenRequest);
    if (imgGenRequest.status == "FAILED") {
        return res.json({ error: imgGenRequest.error || "Error Processing, this happens sometimes, you just have to try again a couple times. Working on a fix! If it continues, please contact support@dreamgenerator.ai.", status: formattedStatus, nsfw: imgGenRequest.nsfw });
    }
    if (imgGenRequest.status != "COMPLETED") {
        return res.json({ status: formattedStatus });
    }

    console.log("Charging user for image generation", imgGenRequest);
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
    return res.json(responseData);


    try {
        let statusCheckResult
        try {
            statusCheckResult = await axios.get(`https://api.monsterapi.ai/v1/status/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.new_monster_token}`,
                }
            })
        } catch (err) {
            console.error(err);
            let errorId = Math.random() * 1_000_000
            return res.status(500).send({ error: "Error checking status.  Error id: " + errorId })
        }
        console.log("status", statusCheckResult.data)
        let status = statusCheckResult.data.status
        if (status !== "IN_PROGRESS" && status !== "COMPLETED" && status !== "IN_QUEUE") {
            return res.status(500).send({ error: "Unknown status" + status + ". Please contact support support@dreamgenerator.ai" });
        }
        if (status === "COMPLETED") {
            let [[imgGenRequest]] = await db.query(`SELECT * FROM ImageGenerationRequest WHERE taskId=? and authenticatedUser=? `, [taskId, req.authenticatedUser.id]);
            imgGenRequest = new ImageGenerationRequest(imgGenRequest)
            if (!imgGenRequest) {
                return res.status(500).send({ error: "Error finding task.  This is an internal bug unless you are hacking.  Please contact me at support@dreamgenerator.ai for support.  Thank you." })
            }
            let creditCost = statusCheckResult.data.credit_used;

            if (imgGenRequest.status != "completed") {
                imgGenRequest.outputUrl = statusCheckResult.data.result.output[0];
                imgGenRequest.status = "completed";

                await imgGenRequest.save();
                try {
                    await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = creditsRemaining - ? WHERE id=?`, [creditCost, req.authenticatedUser.id])
                } catch (err) {
                    console.error("Error reducing credits")
                    console.error(err)
                }
            }
            let [[userData]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id])

            let responseData = { outputUrl: imgGenRequest.outputUrl, error: null, creditsRemaining: userData.creditsRemaining, id: imgGenRequest.id, model: imgGenRequest.model };
            console.log("Sending response", responseData)

            res.json(responseData);
        } else {
            status = status.toLowerCase().replace("_", " ").replace(/\b./g, str => str.toUpperCase());
            res.json({ status })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: "Error getting status" })
    }
}

export const route = { url: '/api/poll-image-status', method: 'GET', authenticated: true };