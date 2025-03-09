import axios from "axios";
import { dreamGenOutS3Client } from "./s3";
import { AuthenticatedUser } from "../models/AuthenticatedUser";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import * as https from "https";
import { IncomingMessage } from "http";


export async function getRunpodStatus(imgGenRequest, client: "web" | undefined, user: AuthenticatedUser) {
    let url = null;

    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        let response2 = await axios.get(`https://api.runpod.ai/v2/${imgGenRequest.model || 'sdxl'}/status/${imgGenRequest.taskId}`, {
            headers: {
                Authorization: `Bearer ${process.env.runpod_api_key}`
            }
        });
        console.log("runpod response is", response2.data)
        if (response2?.data?.status != "IN_PROGRESS" && response2?.data?.status != "QUEUED" && response2?.data?.status != "COMPLETED") {
            console.log("status response is", response2.data);
        }
        if (response2.data.status == "COMPLETED") {
            url = response2.data.output.image_url || response2.data.output[0]?.image;
            imgGenRequest.status = "COMPLETED";
        } else {
            imgGenRequest.status = response2.data.status;
            await imgGenRequest.save();
            return;
        }

        if (client == "web") {
            let key = user.id + "_" + imgGenRequest.taskId;

            // upload to s3.  pipe url.  use dreamGenOutS3Client. pipe using https
            let response = await new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    resolve(res);
                }).on('error', (e) => {
                    reject(e);
                });
            }) as IncomingMessage;

            let command = new PutObjectCommand({
                Bucket: "dreamgenout",
                Key: key,
                Body: response,
                ContentType: "image/png",
                ContentLength: parseInt(response.headers["content-length"])
            })
                
            try {
                let uploadResponse = await dreamGenOutS3Client.send(command);
                imgGenRequest.outputUrl = "https://out.dreamgenerator.ai/" + key;
            } catch (err) {
                console.error("error saving output", err);
                imgGenRequest.status = "FAILED";
                imgGenRequest.error = "Error saving output.  Contact support at support@dreamgenerator.ai for help. " + err.message;
            }
        } else {
            imgGenRequest.outputUrl = url;
        }
        await imgGenRequest.save()
    } catch (err) {
        console.error("error with runpod", err.stack || err);
    }
}