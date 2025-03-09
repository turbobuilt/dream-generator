import { ShareLike } from "../models/ShareLike";
import { PromptLike } from '../models/PromptLike';
import { Notification } from "../models/Notification";
import moment from 'moment';
import { firebaseMessaging } from "./main";
import { FreeCredit } from "../models/FreeCredit";
import { postToFacebook } from "./postToFacebook";
import { postTweet } from "./postTweet";
import { rm } from "fs/promises";
import sharp from "sharp";
import fetch from "node-fetch";
import { dreamGenOutS3Client } from "./s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./publishPrompt";


export async function likeShare(req, res, data: { share: number }) {
    let { share } = data && typeof data !== "function" ? data : req.body;
    try {
        let shareLike = new ShareLike({ share: share, authenticatedUser: req.authenticatedUser.id });
        await shareLike.save();

        // get the number of individual days where FreeCredits of type 'like' have been issued.  So that they can only get free credits for a total of 10 days.  Note: created is in milliseconds since epoch
        let [[days]] = await global.db.query(`SELECT COUNT(DISTINCT FROM_UNIXTIME(created/1000, '%Y-%m-%d')) as days FROM FreeCredit WHERE authenticatedUser = ? AND type = 'like'`, [req.authenticatedUser.id]);

        let newCredits = 0, likeDays = days.days;
        if (days.days < 10 && false) {
            // check FreeCredits in past 24 hours where type = 'like' sum credits
            let [[creditsToday]] = await global.db.query(`SELECT SUM(credits) as credits FROM FreeCredit WHERE authenticatedUser = ? AND created > ? AND type = 'like'`, [req.authenticatedUser.id, moment().subtract(24, 'hours').toDate().getTime()]);
            // make sure FreeCredit.share is not taken already
            let [[existing]] = await global.db.query(`SELECT * FROM FreeCredit WHERE authenticatedUser = ? AND share = ?`, [req.authenticatedUser.id, share]);
            console.log("credits", creditsToday);
            if (existing) {

            } else if (creditsToday.credits < 3) {
                ++newCredits;
                await Promise.all([(async () => {
                    console.log("adding free credit")
                    let freeCredits = new FreeCredit({ authenticatedUser: req.authenticatedUser.id, credits: 1, type: 'like', share: share });
                    await freeCredits.save();
                })(), (async () => {
                    console.log("increasing credits")
                    await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = creditsRemaining + 1 WHERE id = ?`, [req.authenticatedUser.id]);
                })()]);
            }
        }
        let [[creditsRemaining]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id]);
        console.log("Credits Remaining", creditsRemaining);

        // notify owner their post was liked
        ((async () => {
            let [[shareData]] = await global.db.query(`SELECT * FROM Share WHERE id = ?`, [share]);
            let [[sharedImage]] = await global.db.query(`SELECT * FROM SharedImage WHERE id = ?`, [shareData.sharedImage]);
            if (!shareData.parent && shareData.sharedImage && req.authenticatedUser.id != shareData.authenticatedUser && !sharedImage.nudity) {
                if (!shareData.postedToFacebookBegun && !shareData.parent && !sharedImage.nudity) {
                    global.db.query(`UPDATE Share SET postedToFacebookBegun = 1 WHERE id = ?`, [share]).catch(err => {
                        console.error("Error updating postedToFacebookBegun");
                        console.error(err);
                    });
                    postToFacebook("https://dreamgenerator.ai/share/" + shareData.id).then((result) => {
                        if (!result) {
                            return;
                        }
                        global.db.query(`UPDATE Share SET facebookId = ?, postedToFacebook=1 WHERE id = ?`, [result.id, share]).catch(err => {
                            console.error("Error updating facebookId");
                            console.error(err);
                        });
                    }).catch(err => {
                        console.error("Error posting to facebook");
                        console.error(err);
                    });
                }
                if (!shareData.postedToTwitter) {
                    global.db.query(`UPDATE Share SET postedToTwitter = 1 WHERE id = ?`, [share]).catch(err => {
                        console.error("Error updating postedToTwitter");
                        console.error(err);
                    });
                    let imageUrl = `https://images.dreamgenerator.ai/${sharedImage.path}`;
                    let outputPath = sharedImage.path.replace(".avif", ".webp");
                    try {
                        // download
                        let response = await fetch(imageUrl);
                        let buffer = await response.arrayBuffer();
                        // convert to webp
                        let result = await sharp(buffer).webp().toBuffer();
                        // upload to r2
                        let upload = await s3Client.send(new PutObjectCommand({
                            Bucket: "dreamgeneratorshared",
                            ContentType: "image/webp",
                            Key: outputPath,
                            Body: result
                        }));
                        global.db.query(`UPDATE SharedImage set webp=1 WHERE id = ?`, [sharedImage.id]).catch(err => {
                            console.error("Error updating webp");
                            console.error(err);
                        });
                        console.log("upload", upload);
                    } catch (err) {
                        console.log("error converting to webp", err);
                    } finally {
                        
                    }
                    postTweet("https://dreamgenerator.ai/share/" + shareData.id).then(data => {
                        let id = data.data.id;
                        global.db.query(`UPDATE Share SET twitterId = ? WHERE id = ?`, [id, share]).catch(err => {
                            console.error("Error updating twitterId");
                            console.error(err);
                        });
                    }).catch(err => {
                        console.error("Error posting to twitter");
                        console.error(err);
                    });
                }
            }
            if (!shareData.sharedImage) {
                return;
            }
            if (shareData.authenticatedUser == req.authenticatedUser.id) {
                return;
            }
            let [[shareCreator]] = await global.db.query(`SELECT pushToken FROM AuthenticatedUser WHERE id = (SELECT authenticatedUser FROM Share WHERE id = ?)`, [share]);
            if (shareCreator && shareCreator.pushToken) {
                try {
                    let [[lastNotification]] = await global.db.query(`SELECT * FROM notification WHERE authenticatedUser=? AND type=1 AND created > ?`, [req.authenticatedUser.id, moment().subtract(30, 'minutes').toDate().getTime()]);
                    console.log(lastNotification);
                    console.log(moment().subtract(30, 'minutes').toDate().getTime());
                    if (lastNotification) {
                        console.log("last notification found")
                        return;
                    }
                } catch (err) {
                    let notification = new Notification({
                        authenticatedUser: req.authenticatedUser.id,
                        type: 1,
                        // text: `${req.authenticatedUser.username} liked your post!`
                    });
                    await notification.save();
                }
                let [[shareInfo]] = await global.db.query(`SELECT Share.*, Prompt.title
                FROM Share 
                LEFT JOIN Prompt ON Share.prompt = Prompt.id
                WHERE Share.id = ?`, [share]);
                if (!shareInfo) {
                    return res.status(400).send({ error: "Share not found. contact support@dreamgenerator.ai if this is an issue." });
                }
                const message = {
                    notification: {
                        title: 'You got a like!',
                        body: 'Somebody liked your photo/image! "' + shareInfo?.title?.slice(0, 500) + '"'
                    },
                    token: shareCreator.pushToken
                };

                // Send a message to the device corresponding to the provided
                // registration token.
                try {
                    const response = await firebaseMessaging.send(message);
                    let notification = new Notification({
                        authenticatedUser: req.authenticatedUser.id,
                        type: 1,
                        // text: `${req.authenticatedUser.username} liked your post!`
                    });
                    await notification.save();
                } catch (err) {
                    console.error(err);
                }
            }
        })()).catch(err => console.error("error notifying about like", err));


        return res.json({ shareLike, creditsRemaining: creditsRemaining.creditsRemaining, newCredits, likeDays });
    } catch (err) {
        return res.json({ error: err.message });
    }
}


export const route = {
    url: "/api/share-like",
    method: 'POST',
    authenticated: true,
};
