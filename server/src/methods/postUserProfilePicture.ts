import { Request, Response } from "express";
// import busboy
import Busboy from "busboy";
import { createRandomGuid } from "../lib/db_old";
import sharp from "sharp";
import { s3Client } from "./publishPrompt";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { AuthenticatedUserProfilePicture } from "../models/AuthenticatedUserProfilePicture";
import cron from "node-cron";
import { checkForSensitiveContent } from "./checkForSensitiveContent";

type Fields = { [key: string]: string };
type Files = { [key: string]: { data: Buffer, filename: string, encoding: string, mimetype: string } };

export async function postUserProfilePicture(req: Request, res: Response) {
    // if content length is greater than 3mb too large, return 413
    let maxLength = 3 * 1024 * 1024;
    if (parseFloat(req.headers["content-length"]) > maxLength) {
        res.status(413).send("Request Entity Too Large");
        return;
    }
    console.log("parsing form data");
    // annotate return type
    try {
        var { fields, files } = await new Promise((resolve: (value: { fields: Fields, files: Files }) => void, reject) => {
            const busboy = Busboy({ headers: req.headers });
            let fields: Fields = {};
            let files: Files = {};
            let totalLength = 0;

            busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
                let dataParts = []
                file.on("data", (data) => {
                    dataParts.push(data);
                    totalLength += data.length;
                    if (totalLength > maxLength) {
                        console.log("File too large");
                        busboy.removeAllListeners();
                        req.unpipe(busboy);
                        reject(new Error("File too large"));
                    }
                });
                file.on("end", () => {
                    files[fieldname] = {
                        data: Buffer.concat(dataParts),
                        filename,
                        encoding,
                        mimetype
                    }
                });
            });

            busboy.on("field", (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
                fields[fieldname] = val;
            });

            busboy.on("finish", () => {
                resolve({ fields, files });
            });

            busboy.on("error", (err) => {
                console.log("Error parsing form data", err);
                reject(err);
            })

            req.pipe(busboy);
        });
    } catch (err) {
        console.error("Error parsing form data", err);
        res.status(500).json({ error: "Error parsing form data: " + err.message });
        return;
    }
    let file = files["file"];
    if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
    }

    let guid = await createRandomGuid();
    let resizedImage = await sharp(file.data).resize(512, 512, { fit: "outside", position: "center" }).avif().toBuffer();

    try {
        let authenticatedUserProfilePicture = new AuthenticatedUserProfilePicture();
        authenticatedUserProfilePicture.authenticatedUser = req.authenticatedUser.id;
        authenticatedUserProfilePicture.pictureGuid = guid;
        authenticatedUserProfilePicture.nsfwResult = false;
        authenticatedUserProfilePicture.uploaded = false;
        await authenticatedUserProfilePicture.save();

        await s3Client.send(new PutObjectCommand({
            Bucket: "dreamgeneratorshared",
            Key: `profile-pictures/${guid}`,
            Body: resizedImage,
            ContentType: "image/avif"
        }));
        authenticatedUserProfilePicture.uploaded = true;
        await authenticatedUserProfilePicture.update();
    } catch (e) {
        console.error(e);
        global.db.query("UPDATE AuthenticatedUserProfile SET picture = NULL WHERE authenticatedUser = ?", [req.authenticatedUser.id]);
        res.status(500).json({ error: "Error uploading picture" });
        return;
    }
    await global.db.query("UPDATE AuthenticatedUserProfile SET pictureUploaded = ? WHERE authenticatedUser = ?", [1, req.authenticatedUser.id]);
    console.log("uploaded picture");
    res.json({ picture: guid });
}

export const route = {
    url: "/api/post-user-profile-picture",
    method: 'POST',
    authenticated: true
};

export async function checkForSensitiveContentInProfilePic() {
    let [items] = await global.db.query(`SELECT * FROM AuthenticatedUserProfilePicture WHERE checkedForNsfw = 0 AND uploaded = 1 LIMIT 1`) as any[];
    for (let rawItem of items) {
        let item = new AuthenticatedUserProfilePicture(rawItem);
        Object.assign(item, rawItem);
        try {
            let result = await checkForSensitiveContent(`profile-pictures/${item.pictureGuid}`);
            if (result.containsNudity) {
                item.nsfwResult = true;
            }
            item.checkedForNsfw = true;
            await item.save();
            console.log(result);
        } catch (err) {
            console.error("error checking profile pic for nsfw", err);
        }
    }
}

cron.schedule('* * * * *', () => {
    checkForSensitiveContentInProfilePic().catch(err => console.error("error checking profile pics for nsfw", err));
});