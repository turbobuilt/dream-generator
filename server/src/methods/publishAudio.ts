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
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from 'crypto';
import { SharedImage } from '../models/SharedImage';
import { Share } from '../models/Share';
import { SharedAudio } from '../models/SharedAudio';


// define the publishPrompt async function
export async function publishAudio(req: Request, res: Response) {
    console.log("doing method publish audio")
    // Destructure prompt, style, title from req.body
    let { promptText, title, size, model } = req.body;
    console.log("Body is", req.body)

    if (!promptText || promptText.length < 5) {
        return res.status(400).send({ error: "Prompt must be at least 5 characters. If this is a mistake contact support@dreamgenerator.ai.  Sorry!" });
    }

    if (false) { // if nudityDetected
        console.log("nudity already not detected")
    }

    // // Create new Prompt instance
    let prompt = new Prompt({
        text: promptText,
        audio: true,
        title,
        authenticatedUser: req.authenticatedUser.id,
        uploaded: false
    });

    await prompt.save();

    let sharedAudio = new SharedAudio({
        path: "audio/" + await getRandomString(18) + ".opus",
        createdBy: req.authenticatedUser.id,
        size: size,
        model: model,
        prompt: prompt.id
    });
    let uploadUrl = await getPresignedPut(sharedAudio.path);
    await sharedAudio.save();

    let share = new Share({
        prompt: prompt.id,
        text: promptText,
        authenticatedUser: req.authenticatedUser.id,
        sharedAudio: sharedAudio.id
    });
    await share.save();
    return res.send({ prompt, sharedAudio, uploadUrl, share });
}

export const route = {
    url: "/api/publish-audio",
    method: 'POST',
    authenticated: true
};

export let s3Client = new S3Client({
    region: "auto",
    endpoint: "https://6d1fd8715ac1dc4960355505312f9f79.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: "855dafb7ccd48d9d2ae26c21c6295ea1",
        secretAccessKey: "337bac80dcab5d78b06cc42951515f3a5ec64a6fe1ceffe750eea36173d04596"
    }
});

export async function getPresignedPut(key, bucket = "dreamgeneratorshared") {
    let url = await getSignedUrl(s3Client as any, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: "image/avif" }), { expiresIn: 604800 });
    return url;
}
export async function getPresignedGet(key, bucket = "dreamgeneratorshared") {
    let url = await getSignedUrl(s3Client as any, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 24 * 60 * 60 });
    return url;
}


// creates a random string of characters 0-9a-zA-Z starting with a letter of length n using crypto.randomBytes
export async function getRandomString(length: number) {
    let bytes = await new Promise<Buffer>((resolve, reject) => {
        randomBytes(length, (err, buf) => {
            if (err)
                reject(err);
            else
                resolve(buf);
        });
    });
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; ++i) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}
