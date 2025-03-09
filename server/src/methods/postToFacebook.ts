import axios from "axios";
import { Share } from "../models/Share";
import { SharedImage } from "../models/SharedImage";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./publishPrompt";
import sharp from "sharp";
let pageId: string = "61550897801086"

export async function shortTokenToLong(token) {
    console.log("requesting long lived token")
    let apiUrl = `https://graph.facebook.com/v11.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.facebook_app_id}&client_secret=${process.env.facebook_secret}&fb_exchange_token=${token}`;
    try {
        var response = await axios.get(apiUrl);
    } catch (err) {
        console.error(err)
        console.error(err.response.data)
    }

    console.log(response.data);


}

export async function postToFacebook(url): Promise<any> {
    try {
        const message = encodeURIComponent('');
        const encodedUrl = encodeURIComponent(url);
        const apiUrl = `https://graph.facebook.com/${process.env.facebook_page_id}/feed?message=${message}&link=${encodedUrl}&access_token=${process.env.facebook_api_token}`;

        const response = await axios.post(apiUrl);
        console.log('Post created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating facebook post:', error.response.data.error);
    }
}


// Endpoints
// The API consists of the following endpoints. Refer to each endpoint's reference document for usage requirements.

// POST /{ig-user-id}/media — upload media and create media containers.
// POST /{ig-user-id}/media_publish — publish uploaded media using their media containers.
// GET /{ig-container-id}?fields=status_code — check media container publishing eligibility and status.
// GET /{ig-user-id}/content_publishing_limit — check app user's current publishing rate limit usage.
// Single Media Posts
// Publishing single image, video, story or reel is a two-step process:

// Use the POST /{ig-user-id}/media endpoint to create a container from an image or video hosted on your public server.
// Use the POST /{ig-user-id}/media_publish endpoint to publish the container.
// Step 1 of 2: Create Container

// Let's say you have an image at...

// https://www.example.com/images/bronz-fonz.jpg
// ... that you want to publish with the hashtag "#BronzFonz" as its caption. Send a request to the POST /{ig-user-id}/media endpoint:

// Sample Request
// POST https://graph.facebook.com/v19.0/17841400008460056/media
//   ?image_url=https://www.example.com/images/bronz-fonz.jpg
//   &caption=#BronzFonz
// This returns a container ID for the image.

// Sample Response
// {
//   "id": "17889455560051444"  // IG Container ID
// }
// Step 2 of 2: Publish Container

// Use the POST /{ig-user-id}/media_publish endpoint to publish the container ID returned in the previous step.

// Sample Request
// POST https://graph.facebook.com/v19.0/17841400008460056/media_publish
//   ?creation_id=17889455560051444
// Sample Response
// {
//   "id": "17920238422030506" // IG Media ID
// }
export async function postToInstagram(share: Share, sharedImage: SharedImage) {
    // first convert to jpeg

    await global.db.query(`UPDATE Share SET instagramPublishStarted = 1 WHERE id = ?`, [share.id])
    let imageUrl = `https://images.dreamgenerator.ai/${sharedImage.path}`;
    let outputPath = sharedImage.path.replace(".avif", ".jpg");
    try {
        // download
        let response = await fetch(imageUrl);
        let buffer = await response.arrayBuffer();
        // convert to webp
        let result = await sharp(buffer).jpeg({ 
            mozjpeg: true,
            quality: 75
        }).toBuffer();
        // upload to r2
        let upload = await s3Client.send(new PutObjectCommand({
            Bucket: "dreamgeneratorshared",
            ContentType: "image/jpeg",
            Key: outputPath,
            Body: result
        }));
        await global.db.query(`UPDATE SharedImage set jpg=1 WHERE id = ?`, [sharedImage.id]).catch(err => {
            console.error("Error updating jpg");
            console.error(err);
        });
        // now start upload
        let instagramId = "dream_generator_ai";
        // let apiUrl = `https://graph.facebook.com/v11.0/${process.env.instagram_user_id}/media?image_url=${imageUrl}&caption=${share.text}&access_token=${process.env.instagram_api_token}`;

        // create container
        let captions = `DreamGenerator.ai imagined this: '${share.text}'`;
        let containerResponse = await axios.post(`https://graph.facebook.com/v11.0/${instagramId}/media`, {}, {
            params: {
                image_url: `https://images.dreamgenerator.ai/${sharedImage.path}`,
                caption: captions,
                access_token: process.env.facebook_api_token
            }
        });
        let instagramPostId = containerResponse.data.id;

        // post to instagram
        let publishResponse = await axios.post(`https://graph.facebook.com/v11.0/${instagramId}/media_publish`, {}, {
            params: {
                creation_id: instagramPostId,
                access_token: process.env.facebook_api_token
            }
        });

        await global.db.query(`UPDATE Share set instagramId = ? WHERE id = ?` , [instagramPostId, share.id]);
        console.log("upload", upload);
    } catch (err) {
        console.log("error converting to jpg", err);
    } finally {
        
    }

}