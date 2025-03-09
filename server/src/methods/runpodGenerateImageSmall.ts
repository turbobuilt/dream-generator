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

export async function generateImageRunpodSmall(prompt: string, imgGenRequest: ImageGenerationRequest): Promise<any> {
    try {
        const response = await axios.post("https://api.runpod.ai/v2/sd-openjourney/run", {
            input: {
                prompt: prompt,
                width: 512,
                height: 512,
                // num_outputs: 1,
                num_inference_steps: 35,
                // refiner_inference_steps: 10,
                "guidance_scale": 7.5,
                // "strength": 0.3
            }
        }, {
            headers: {
                Authorization: `Bearer ${process.env.runpod_api_key}`
            }
        });
        console.log(response.data);
        imgGenRequest.taskId = response.data.id;
        imgGenRequest.provider = "runpod";
        imgGenRequest.model = "sd-openjourney"
        await imgGenRequest.save();
        return imgGenRequest;
    } catch (error) {
        try {

            imgGenRequest.status = "FAILED";
            imgGenRequest.error = error.message;
            if(error.message?.indexOf("NSFW") > -1)
                imgGenRequest.nsfw = true;
            await imgGenRequest.save();
        } catch(err) {
            console.error("Error saving error");
            console.error(err);
        }
        console.error(error);
        console.error(`Failed to generate replicate: ${error.message}`);
    }
}