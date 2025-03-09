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
import { SharedImage } from '../models/SharedImage';
import { Share } from '../models/Share';
import { postToFacebook } from './postToFacebook';
import sharp from 'sharp';
import { createRandomGuid } from '../lib/db_old';
import { exec } from 'child_process';
// node fetch
import fetch from 'node-fetch';
import { unlink } from 'fs/promises';
import { serverDeleteShare } from './deleteShare';
import { sendEmail } from '../lib/sendEmail';
import { checkForSensitiveContent } from './checkForSensitiveContent';


const sensitiveCategories = {
    "BUTTOCKS_EXPOSED": true,
    "FEMALE_BREAST_EXPOSED": true,
    "FEMALE_GENITALIA_EXPOSED": true,
    "MALE_BREAST_EXPOSED": true,
    "ANUS_EXPOSED": true,
    "BELLY_EXPOSED": true,
    "MALE_GENITALIA_EXPOSED": true
}

async function handleErrorGptCensor(share, error) {
    console.trace("gpt censor error", error)
    await serverDeleteShare(share);
    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [share.authenticatedUser]);
    await sendEmail({
        from: "filtering@dreamgenerator.ai",
        to: authenticatedUser.email,
        subject: "Error processing image",
        htmlFileName: "errorProcessingImage"
    })
}

async function processImagesCron() {
    if (!global.db) {
        setTimeout(processImagesCron, 3000);
        return;
    }
    try {
        let [shares] = await global.db.query(`SELECT 
        Share.*, SharedImage.path as sharedImagePath, Prompt.text as promptText
        FROM Share
        JOIN SharedImage ON Share.sharedImage = SharedImage.id
        JOIN Prompt ON Share.prompt = Prompt.id
        WHERE processed = 0 AND SharedImage.uploaded=1 AND Share.sharedImage IS NOT NULL`);
        for (let share of shares) {
            let hasNudity = false;
            console.log("Checking for nudity")
            let censorResult = await gptPrompt(`The following is a description of an image.  Based on your knowledge of reality,  guess the probability of the image containing nudity and child porn, where 10 means it almost certainly contains it. return just json like this { "nudity": [0-10], "childPorn": [0-10] }:\n\n${share.promptText}`, { max_tokens: 30 });
            // console.log("censor result", censorResult);
            if (censorResult.error) {
                console.error("Error processing image");
                console.error(censorResult.error);
                await handleErrorGptCensor(share, censorResult.error);
                continue;
            } else {
                try {
                    let json = JSON.parse(censorResult.result);
                    let nudity = hasNudity || parseFloat(json.nudity);
                    let childPorn = parseFloat(json.childPorn);
                    if (isNaN(nudity as any) || isNaN(childPorn)) {
                        console.log("error with censor result category is nan", censorResult.result)
                        await handleErrorGptCensor(share, "is nan for categories");
                        continue;
                    }
                    if (childPorn > 7) {
                        await serverDeleteShare(share);
                        continue;
                    }
                    if (nudity > 3) {
                        hasNudity = true;
                    }
                } catch (err) {
                    await handleErrorGptCensor(share, err);
                    continue;
                }
            }

            console.log("processing ", share.id);
            let random = await createRandomGuid();
            let localImagePath = `/tmp/${random}.jpg`;
            let result = await checkForSensitiveContent(share.sharedImagePath);
            if (result) {
                let sexualContent = 0;
                for (let resultItem of result.sensitiveContentResult) {
                    if (sensitiveCategories[resultItem.class]) {
                        sexualContent = 1;
                    }
                }

                await global.db.query(`UPDATE SharedImage SET sensitiveContentResult = ?, sexualContent=${sexualContent} WHERE id = ?`, [JSON.stringify(result.sensitiveContentResult), share.sharedImage]);
                await global.db.query(`UPDATE Share SET processed = 1 WHERE id = ?`, [share.id]);
            }
            // wait 1 second
            await new Promise((resolve, reject) => setTimeout(resolve, 1000));
        }
    } catch (err) {
        console.error(err);
    }
    // wait 5 seconds
    setTimeout(processImagesCron, 5000);
}
processImagesCron();


// define the publishPrompt async function
export async function publishPrompt(req: Request, res: Response) {
    // let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id]);
    // if(!authenticatedUser?.plan) {
    //     return res.status(500).send({ error: "You must have a plan to publish prompts.  Please subscribe to a plan and try again. If this is an error and you are signed up, I apologize, this is my best effort, but not there yet.  Contact support@dreamgenerator.ai" });
    // }
    // Destructure prompt, style, title from req.body
    let { prompt: promptText, style, title, image, imageSize, model, hasNudity } = req.body;

    console.log("has nudity is", hasNudity);

    style = style || "None";

    // if (!title || title.length < 8) {
    //     return res.status(400).send({ error: "Title must be at least 8 characters. If this is a mistake contact support@dreamgenerator.ai" });
    // }

    if (!promptText || promptText.length < 5) {
        return res.status(400).send({ error: "Prompt must be at least 5 characters. If this is a mistake contact support@dreamgenerator.ai.  Sorry!" });
    }

    if (false) { // if nudityDetected
        console.log("nudity already not detected")
    }

    if (promptText.match(/\b(naked|nude|penis)\b/gi)) { // regex finds \b(naked,nude,penis)\b
        hasNudity = true;
    }

    // Create new Prompt instance
    let prompt = new Prompt({
        // promptCategory: category.id,
        text: promptText,
        style,
        title,
        authenticatedUser: req.authenticatedUser.id,
        uploaded: false
    });
    await prompt.save();

    let sharedImage = new SharedImage({
        path: "images/" + await getRandomString(18) + ".avif",
        createdBy: req.authenticatedUser.id,
        imageSize: imageSize,
        model: model,
        nudity: hasNudity ? 1 : 0,
        // sensitiveContentResult: sensitiveContentResult,
        prompt: prompt.id
    });
    let uploadUrl = await getPresignedPut(sharedImage.path);
    await sharedImage.save();

    let share = new Share({
        prompt: prompt.id,
        authenticatedUser: req.authenticatedUser.id,
        sharedImage: sharedImage.id
    });
    await share.save();
    return res.send({ prompt, sharedImage, uploadUrl, share });
}

export const route = {
    url: "/api/publish-prompt",
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