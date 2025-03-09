import { Request, Response } from "express";
import { s3Client } from "./publishPrompt";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { AnimateVideoRequest } from "../models/AnimateVideoRequest";

const max_animate_video_file_size = 100 * 1024 * 1024;

export async function getAnimateVideoUploadLink(req: Request, res: Response, { size, duration, contentType }) {

    if (size > max_animate_video_file_size) {
        return res.status(400).send({ error: `File size too large. Max file size is ${max_animate_video_file_size / 1024 / 1024} MB` });
    }

    let animateVideoRequest = new AnimateVideoRequest();
    animateVideoRequest.uploadKey = crypto.randomUUID();
    animateVideoRequest.authenticatedUser = req.authenticatedUser.id;
    animateVideoRequest.status = "uploading";
    await animateVideoRequest.save();
    // let result = await createPresignedPost(s3Client, {
    //     Bucket: "dreamgeninput",
    //     Key: animateVideoRequest.uploadKey,
    //     Expires: 60 * 60,
    //     Conditions: [
    //         ["content-length-range", 0, size]
    //     ]
    // });
    // return res.json({ uploadUrl: result.url, fields: result.fields, uploadKey: animateVideoRequest.uploadKey });

    // post not supported, have to do presigend put
    const command = new PutObjectCommand({
        Bucket: "dreamgeninput",
        Key: animateVideoRequest.uploadKey,
        // ContentType: "video/mp4",
        ContentLength: size
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 });
    return res.json({ uploadUrl: url, uploadKey: animateVideoRequest.uploadKey, animateVideoRequest });
}