

import { generateImage } from './generateImage';
import bodyParser from "body-parser";
import formidable, { errors as formidableErrors } from 'formidable';
const busboy = require('busboy');

export async function submitImageModifyWithPrompt(req, res) {
    console.log("got request");
    const form = formidable({
        maxFileSize: 5 * 1024 * 1024
    });
    let fields;
    let files;
    // console.log(req)
    let data = await getFormData(req);
    console.log("data is", data);
    console.log("will generate")
    let result = await generateImage({ ...data as any, authenticatedUser: req.authenticatedUser }, req);
    return res.json(result);
}

export const route = { url: '/api/submit-image-modify-with-prompt', method: 'POST', authenticated: true };


export function getFormData(req) {
    let data = {};
    return new Promise(resolve => {
        const bb = busboy({ headers: req.headers });
        bb.on('file', (name, file, info) => {
            let fileData = [];
            const { filename, encoding, mimeType } = info;
            console.log(
                `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
                filename,
                encoding,
                mimeType
            );
            file.on('data', (data) => {
                fileData.push(data);
            }).on('close', () => {
                console.log(`File [${name}] Finished`);
                data[name] = { mimeType, data: Buffer.concat(fileData) };
            });
        });
        bb.on('field', (name, val, info) => {
            data[name] = val;
        });
        bb.on('close', () => {
            console.log('Closed');
            resolve(data);
        });
        req.pipe(bb);
    });
}