// typescript

// The function will go as follows:
// Step 1: Import the Replicate library
// Step 2: Create a new instance of Replicate using the api token stored in the process.env.REPLICATE_API_TOKEN
// Step 3: The function will call the run function on the replicate instance, passing in the "stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82" and an options object that includes the input as given from the function parameters 
// Step 4: The function will return the output of the run function

import Replicate from 'replicate';
import { ImageGenerationRequest } from '../models/ImageGenerationRequest';
import axios from 'axios';
import * as fs from "fs/promises";
import { cwd } from 'process';

export async function modifyImageReplicate(prompt: string, imgGenRequest: ImageGenerationRequest, image, similarity): Promise<any> {
    const replicate = new Replicate({
        auth: process.env.replicate_api_token
    });
    console.log("will modify", image);

    // write imagedata to test.png
    // await fs.writeFile("test.png", image.data);
    // console.log(`${cwd()}/test.png`);
    // return { url: "test.png"};   

    const base64 = image.data.toString("base64");
    const mimeType = "image/png";
    const dataURI = `data:${mimeType};base64,${base64}`;

    // 
    var input = {
        prompt: prompt,
        // width: 1024,
        // height: 1024,
        num_outputs: 1,
        num_inference_steps: 50,
        // refine: 'expert_ensemble_refiner',
        prompt_strength: parseFloat(((100 - similarity) / 100).toFixed(2)),
        image: dataURI,
        seed: Math.ceil(Math.random() * 1_000_000),
    };
    console.log("generating", input)
    //     curl -s -X POST \
    //   -d '{"version": "d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82", "input": {"prompt": "An astronaut riding a rainbow unicorn"}}' \
    //   -H "Authorization: Token $REPLICATE_API_TOKEN" \
    //   "https://api.replicate.com/v1/predictions" | jq

    try {
        const response = await axios.post("https://api.replicate.com/v1/predictions", {
            version: "d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82",
            input: input
        }, {
            headers: {
                "Authorization": `Token ${process.env.replicate_api_token}`
            },
            timeout: 1000 * 60 * 5
        });
        console.log("GOT RESPONSE", response.data);
        let id = response.data.id
        imgGenRequest.taskId = id;
//         curl -s -H "Authorization: Token $REPLICATE_API_TOKEN" \
//   "https://api.replicate.com/v1/predictions/j6t4en2gxjbnvnmxim7ylcyihu" | jq "{id, input, output, status}"

        // for(let i = 0; i < 100; i++) {
        //     await new Promise(resolve => setTimeout(resolve, 1000));
        //     let r2 = await axios.get(`https://api.replicate.com/v1/predictions/${id}`, { headers: { Authorization: `Token ${process.env.replicate_api_token}` } });
        //     console.log(r2.status);
        //     console.log(r2.data);
        //     let data = r2.data;
        //     if (data.status == "failed" || data.status == "cancelled") {
        //         throw new Error(data.error || "Failed " + data.status);
        //     }
        //     if(data.output) {
        //         // output = data.output[0]
        //         imgGenRequest.outputUrl = data.output[0];
        //         break;
        //     }
        // }
        // const output = await replicate.run('stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82', {
        //     input: input,
        //     wait: {
        //         interval: 1000,
        //     }
        // });
        // console.log(output);
        // imgGenRequest.outputUrl = output[0];
        // imgGenRequest.status = "COMPLETED";
        imgGenRequest.provider = "replicate"
        await imgGenRequest.save()
        // .catch(err => {
        //     console.error("Erro saving img gen request", output, imgGenRequest);
        //     console.error(err);
        // })
    } catch (error) {
        try {
            imgGenRequest.status = "FAILED";
            imgGenRequest.error = error.message;
            if (error.message?.indexOf("NSFW") > -1)
                imgGenRequest.nsfw = true;
            await imgGenRequest.save();
        } catch (err) {
            console.error("Error saving error");
            console.error(err);
        }
        console.error(error);
        console.error(`Failed to generate replicate: ${error.message}`);
    }
}