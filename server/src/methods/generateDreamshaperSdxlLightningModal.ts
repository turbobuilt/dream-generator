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
import { modalUpdateStatusKey } from './modalUpdateStatus';

let updateStatusEndpoint = process.env.NODE_ENV === "development" ? 
    "https://b071-2001-d08-2802-4101-f42a-4806-c884-bb6a.ngrok-free.app" : 
    "https://dreamgenerator.ai";

const modalEndpoint = "https://noise-destroyer--stable-diffusion-xl-f.modal.run";

// let modalEndpoint = process.env.NODE_ENV === "development" ? 
//     // "https://noise-destroyer--stable-diffusion-xl-diffusers-dream-09bac7-dev.modal.run" : 
//     "https://noise-destroyer--stable-diffusion-xl-f.modal.run" :
//     "https://noise-destroyer--stable-diffusion-xl-diffusers-f.modal.run";


// modalEndpoint = process.env.NODE_ENV === "production" ? modalEndpoint : "https://noise-destroyer--stable-diffusion-xl-f-dev.modal.run";

// modalEndpoint = process.env.NODE_ENV === "production" ? modalEndpoint : "https://noise-destroyer--dreamshaper-v8-f-dev.modal.run";

export async function generateDreamshaperSdxlLightningModal(prompt: string, imgGenRequest: ImageGenerationRequest): Promise<any> {
    try {
        console.log("Generating modal sdxl");
        const response = await axios.post(modalEndpoint, {
            prompt: prompt,
            auth_key: "MFNIeht74ifh9iehfjwejfhlskhwfor983tdjkfgftdj",
            guid: imgGenRequest.taskId,
            // num_inference_steps: 4,
            update_status_url: `${updateStatusEndpoint}/api/modal-update-status?auth_token=${modalUpdateStatusKey}`,
        });
        console.log("got response");
        console.log(response.data);
        // imgGenRequest.taskId = response.data.id;
        imgGenRequest.provider = "modal";
        imgGenRequest.model = "sdxl";
        imgGenRequest.status = "QUEUED";
        await imgGenRequest.save();
        return imgGenRequest;
    } catch (error) {
        try {
            imgGenRequest.status = "FAILED";
            imgGenRequest.error = error.message;
            if (error.message?.indexOf("NSFW") > -1)
                imgGenRequest.nsfw = true;
            await imgGenRequest.save();
        } catch(err) {
            console.error("Error saving error");
            console.error(err);
        }
        console.error(error);
        console.error(`Failed to generate modal: ${error.message}`);
    }
}