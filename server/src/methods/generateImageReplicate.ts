// typescript

// The function will go as follows:
// Step 1: Import the Replicate library
// Step 2: Create a new instance of Replicate using the api token stored in the process.env.REPLICATE_API_TOKEN
// Step 3: The function will call the run function on the replicate instance, passing in the "stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82" and an options object that includes the input as given from the function parameters 
// Step 4: The function will return the output of the run function

import Replicate from 'replicate';
import { ImageGenerationRequest } from '../models/ImageGenerationRequest';

export async function generateImageReplicate(prompt: string, imgGenRequest: ImageGenerationRequest): Promise<any> {
    const replicate = new Replicate({
        auth: process.env.replicate_api_token
    });

    try {
        const output = await replicate.run('stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82', {
            input: {
                prompt: prompt,
                width: 1024,
                height: 1024,
                num_outputs: 1,
                num_inference_steps: 50,
                refine: 'expert_ensemble_refiner',
                seed: Math.ceil(Math.random()*1_000_000),
                negative_prompt: "child porn, underage nudity, child without clothes",
            },
            wait: {
                interval: 1000,
            }
        });
        console.log(output);
        imgGenRequest.outputUrl = output[0];
        imgGenRequest.status = "COMPLETED";
        imgGenRequest.save().catch(err => {
            console.error("Erro saving img gen request", output, imgGenRequest);
            console.error(err);
        })
        return output;
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