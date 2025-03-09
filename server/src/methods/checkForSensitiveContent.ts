import fetch from 'node-fetch';
import sharp from 'sharp';
import { createRandomGuid } from '../lib/db_old';
import { exec } from 'child_process';
import { unlink } from 'fs/promises';

let pythonPath = process.env.NODE_ENV === "development" ? "/usr/bin/python3" : "python3";

export async function checkForSensitiveContent(storageKey: string) {
    let localImagePath = null;
    try {
        let random = await createRandomGuid();
        localImagePath = `/tmp/${random}.jpg`;
        let sensitiveContentResult = null;
        let url = `https://images.dreamgenerator.ai/${storageKey}`;
        console.log(url)
        let response = await fetch(url);
        let image = await response.buffer();
        console.log("got image", image.slice(0,10))
        await sharp(image).png().toFile(localImagePath);
        let sensitiveContentResultJson = await new Promise((resolve, reject) => exec(`${pythonPath} src/lib/detect_nudity.py ${localImagePath}`, (err, stdout, stderr) => err ? reject(err) : resolve(stdout))) as string;
        sensitiveContentResult = sensitiveContentResultJson.split(">>>>RESULT>>>>")[1].trim();
        console.log(sensitiveContentResult);
        // detection_example = [
        //     {'class': 'BELLY_EXPOSED',
        //      'score': 0.799403190612793,
        //      'box': [64, 182, 49, 51]},
        //     {'class': 'FACE_FEMALE',
        //      'score': 0.7881264686584473,
        //      'box': [82, 66, 36, 43]},
        //     ]
        let containsNudity = false;
        for (let box of sensitiveContentResult) {
            if (nudity.includes(box.class)) {
                containsNudity = true;
                break;
            }
        }
        return { sensitiveContentResult, containsNudity };
    } catch (err) {
        console.error(err);
    } finally {
        try {
            unlink(localImagePath).catch(console.error);
        } catch (err) {
            console.error(err);
        }
    }
}

let all_labels = [
    "FEMALE_GENITALIA_COVERED",
    "FACE_FEMALE",
    "BUTTOCKS_EXPOSED",
    "FEMALE_BREAST_EXPOSED",
    "FEMALE_GENITALIA_EXPOSED",
    "MALE_BREAST_EXPOSED",
    "ANUS_EXPOSED",
    "FEET_EXPOSED",
    "BELLY_COVERED",
    "FEET_COVERED",
    "ARMPITS_COVERED",
    "ARMPITS_EXPOSED",
    "FACE_MALE",
    "BELLY_EXPOSED",
    "MALE_GENITALIA_EXPOSED",
    "ANUS_COVERED",
    "FEMALE_BREAST_COVERED",
    "BUTTOCKS_COVERED",
]

let nudity = [
    // "BUTTOCKS_EXPOSED",
    // "FEMALE_BREAST_EXPOSED",
    "FEMALE_GENITALIA_EXPOSED",
    "ANUS_EXPOSED",
    "MALE_GENITALIA_EXPOSED",
]