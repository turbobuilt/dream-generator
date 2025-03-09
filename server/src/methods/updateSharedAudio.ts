// typescript

/*
Step-by-step plan:

1. Import necessary modules/objects/classes and methods from respective directories.
2. Declare a function called 'publishPrompt' that takes two parameters: req and res.
3. Destructure the 'prompt', 'style', and 'title' properties from the 'req.body'.
4. Perform a gptPrompt operation with certain defined prompt and settings, and await its result to a variable 'category'.
5. Make a new instance of 'Prompt', passing all necessary data to its constructor.
6. Invoke method 'save' on the 'prompt' instance and await it.
7. Define a constant 'route' that is an object containing properties 'url', 'method', 'authenticated' and 'handler'.

*/

// Import necessary modules
import { Request, Response } from 'express';
import { Prompt } from '../models/Prompt';
import { AuthenticatedUser } from '../models/AuthenticatedUser';
import { gptPrompt } from './gptPrompt';
import { PromptCategory } from '../models/PromptCategory';
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from 'crypto';
import { SharedAudio } from '../models/SharedAudio';


// define the publishPrompt async function
export async function updateSharedAudio(req: Request, res: Response) {
    let { id } = req.params as any;

    let sharedAudio = new SharedAudio();
    console.log("getting");
    await sharedAudio.get(id);
    console.log("got shared Audio")
    let prompt = new Prompt();
    await prompt.get(sharedAudio.prompt as any);
    console.log("got prompt", prompt)
    if(prompt.authenticatedUser != req.authenticatedUser.id) {
        return res.status(401).send({ error: "You can only update prompts you created." });
    }

    let { uploaded } = req.body as any;
    console.log("uploaded", uploaded);
    if (uploaded) {
        sharedAudio.uploaded = true;
    } else {
        sharedAudio.uploaded = false;
    }
    console.log("saving")
    try {
        await sharedAudio.save();
        return res.send({ sharedAudio });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err.message });
    }
}

export const route = {
    url: "/api/shared-Audio/:id",
    method: 'PUT',
    authenticated: true,
};