// typescript

// The function will go as follows:
// Step 1: Import the Replicate library
// Step 2: Create a new instance of Replicate using the api token stored in the process.env.REPLICATE_API_TOKEN
// Step 3: The function will call the run function on the replicate instance, passing in the "stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82" and an options object that includes the input as given from the function parameters 
// Step 4: The function will return the output of the run function

import axios from 'axios';
import { ImageGenerationRequest } from '../models/ImageGenerationRequest';
import { getPresignedGet, getPresignedPut } from './publishPrompt';
import { inspect } from 'util';

export async function generateImageModal(prompt: string, imgGenRequest: ImageGenerationRequest): Promise<any> {

    try {
        imgGenRequest.provider = "modal";
        imgGenRequest.status = "IN_PROGRESS";
        imgGenRequest.save().catch(err => {
            console.error("Erro saving img gen request", imgGenRequest);
            console.error(err);
        });
        let baseUrl = process.env.environment == "development" ? "https://414e-2001-d08-2831-245-7053-cb5b-9135-dd92.ngrok-free.app" : "https://dreamgenerator.ai";
        let uploadUrl = await getPresignedPut(imgGenRequest.taskId + ".png", "dreamgenout");
        let endpoint = "https://noise-destroyer--sdxl2-app.modal.run";
        // endpoint = "https://noise-destroyer--stable-diffusion-xl-app-turbobuilt-dev.modal.run";
        //  "https://noise-destroyer--stable-diffusion-xl-app-turbobuilt-dev.modal.run"
        console.log("starting inference url", uploadUrl);
        let response = await axios.post(`${endpoint}/infer`, {
            prompt: prompt,
            task_id: imgGenRequest.taskId,
            upload_url: uploadUrl,
            progress_url: `${baseUrl}/api/update-generation-progress?key=${process.env.modal_progress_key}`
        }, {
            headers: {
                authorization: process.env.dream_generator_modal_token
            }
        });
        imgGenRequest.outputUrl = await getPresignedGet(imgGenRequest.taskId + ".png", "dreamgenout");
        imgGenRequest.status = "COMPLETED";
        imgGenRequest.save().catch(err => {
            console.error("Erro saving img gen request", imgGenRequest);
            console.error(err);
        })
        return [imgGenRequest.outputUrl];
    } catch (error) {
        try {
            imgGenRequest.status = "FAILED";
            imgGenRequest.error = error.message;
            if (error.message?.indexOf("NSFW") > -1)
                imgGenRequest.nsfw = true;
            await imgGenRequest.save();
        } catch (err) {
            console.error("Error saving error");
            console.error(err?.response?.data || err);
        }
        if (error?.response?.data) {
            console.error(inspect(error?.response?.data, false, 10, true));
        } else {
            console.error(error?.response?.data || error);
        }
        console.error(`Failed to generate modal: ${error.message}`);
    }


    // try {
    //     const output = await replicate.run('stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82', {
    //         input: {
    //             prompt: prompt,
    //             width: 1024,
    //             height: 1024,
    //             num_outputs: 1,
    //             num_inference_steps: 50,
    //             refine: 'expert_ensemble_refiner',
    //             seed: Math.ceil(Math.random()*1_000_000),
    //             negative_prompt: "child porn, underage nudity, child without clothes",
    //         },
    //         wait: {
    //             interval: 1000,
    //         }
    //     });
    //     console.log(output);
    //     imgGenRequest.outputUrl = output[0];
    //     imgGenRequest.status = "COMPLETED";
    //     imgGenRequest.save().catch(err => {
    //         console.error("Erro saving img gen request", output, imgGenRequest);
    //         console.error(err);
    //     })
    //     return output;
    // } catch (error) {
    //     try {

    //         imgGenRequest.status = "FAILED";
    //         imgGenRequest.error = error.message;
    //         if(error.message?.indexOf("NSFW") > -1)
    //             imgGenRequest.nsfw = true;
    //         await imgGenRequest.save();
    //     } catch(err) {
    //         console.error("Error saving error");
    //         console.error(err);
    //     }
    //     console.error(error);
    //     console.error(`Failed to generate replicate: ${error.message}`);
    // }
}