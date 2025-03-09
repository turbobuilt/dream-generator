import { Request } from "express";
import { Share } from "../models/Share";
import { SharedImage } from "../models/SharedImage";
import { getRandomString, s3Client } from "./publishPrompt";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const busboy = require('busboy');

export async function createShare(req: Request, res, data?: { parent: number, text: string, nudity: boolean }) {
    var fields = {} as any;
    var file = null, uploadPromise = null, sharedImage = null as SharedImage;
    if (req.headers['content-type'].toLowerCase().startsWith('multipart/form-data')) {
        ({ uploadPromise, fields, sharedImage } = await new Promise((resolve, reject) => {
            const bb = busboy({ headers: req.headers });
            let fields = {} as any;
            bb.on('field', (name, val, info) => {
                fields[name] = val;
                if (fields[name] === "false")
                    fields[name] = false;
            });
            bb.on('file', async (name, file, info) => {
                let sharedImage = new SharedImage({
                    path: "images/" + await getRandomString(18) + ".avif",
                    imageSize: fields.imageSize || 0,
                    model: fields.model || "",
                    nudity: fields.nudity == "true" ? 1 : 0
                });
                let uploadPromise = new Upload({
                    client: s3Client,
                    params: {
                        Bucket: "dreamgeneratorshared",
                        Key: sharedImage.path,
                        Body: file,
                        ContentType: "image/avif"
                    }
                }).done();
                await sharedImage.save();
                resolve({ uploadPromise, fields, sharedImage });
            });
            bb.on('error', (err) => {
                reject(err);
            });
            req.pipe(bb);
        }) as any);
    } else {
        fields = data && typeof data !== 'function' ? data : req.body;
    }


    let { parent, text, nudity } = fields;
    if (parent) {
        // make sure parent and share are on the same comment
        var [[parentShare]] = await global.db.query(`SELECT * FROM Share WHERE id=?`, [parent]) as any;
        if (!parentShare) {
            console.error("error finding parent");
            return res.json({ error: "Parent share not found" });
        }
        // let currentParent = parent;
        // for (var i = 0; i < 1000; ++i) {
        //     let [[parentShare]] = await global.db.query(`SELECT * FROM Share WHERE id=?`, [currentParent]) as any;
        //     if (!parentShare) {
        //         return res.json({ error: "Parent comment not found" });
        //     }
        //     if (parentShare.share === share) {
        //         break;
        //     }
        //     parent = parentShare.parent;
        // }
        // if (i === 1000) {
        //     return res.json({ error: "Parent comment not found, over 1000 tries! This may be a mistake if this is the world's biggest thread!" });
        // }
    }
    let share = new Share({ parent, text, authenticatedUser: req.authenticatedUser.id });
    if (sharedImage) {
        share.sharedImage = sharedImage.id;
    }
    let promises = [share.save()];
    if (uploadPromise) {
        await uploadPromise;
        sharedImage.uploaded = true;
        promises.push(sharedImage.save());
    }
    let [shareResult, sharedImageResult] = await Promise.all(promises);

    return res.json({ ...share, sharedImageInfo: sharedImage, likesCount: 0, likes: 0 });
}

export const route = {
    url: "/api/share",
    method: 'POST',
    authenticated: true,
};