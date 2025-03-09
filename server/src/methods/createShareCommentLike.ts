// typescript

/* Plan:
 - Import necessary packages and modules.
 - Define the `likePrompt` function:
   - The function extracts the prompt id from the request body using destructuring.
   - It instantiates a new `Like` object with the prompt id and the authenticated user's id.
   - It saves the `Like` to the database using the `save()` method.
 - Define the route object.
*/

// Imports
import { Request, Response } from 'express';
import { PromptLike } from '../models/PromptLike';
import { Notification } from "../models/Notification";
import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import moment from 'moment';
import googleInfo from "../../firebase";
import { ShareCommentLike } from '../models/ShareCommentLike';


// const app = initializeApp({
//     credential: cert(googleInfo as any),
// });
// const messaging = getMessaging(app);


export async function createShareCommentLike(req: Request, res: Response) {
    let { shareComment } = req.body;

    // // Instantiate new Like object and save it
    // let like = new ShareCommentLike({ shareComment, authenticatedUser: req.authenticatedUser.id })
    // await like.save();
    
    // create ShareCommentLike (created Date.now(), shareComment, authenticatedUser), but only if it doesn't exist
    let [result] = await global.db.query(`INSERT INTO ShareCommentLike (created, shareComment, authenticatedUser) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM ShareCommentLike WHERE shareComment=? AND authenticatedUser=?)`, [Date.now(), shareComment, req.authenticatedUser.id, shareComment, req.authenticatedUser.id]);



    // // notify owner their post was liked
    // ((async () => {
    //     let [[promptCreator]] = await global.db.query(`SELECT pushToken FROM AuthenticatedUser WHERE id = (SELECT authenticatedUser FROM Prompt WHERE id = ?)`, [promptId]);
    //     if (promptCreator && promptCreator.pushToken) {
    //         try {
    //             let [[lastNotification]] = await global.db.query(`SELECT * FROM notification WHERE authenticatedUser=? AND type=1 AND created > ?`, [req.authenticatedUser.id, moment().subtract(30, 'minutes').toDate().getTime()]);
    //             console.log(lastNotification);
    //             console.log(moment().subtract(30, 'minutes').toDate().getTime());
    //             if (lastNotification) {
    //                 console.log("last notificatin found")
    //                 return;
    //             }
    //         } catch (err) {
    //             let notification = new Notification({
    //                 authenticatedUser: req.authenticatedUser.id,
    //                 type: 1,
    //                 // text: `${req.authenticatedUser.username} liked your post!`
    //             });
    //             await notification.save();
    //         }
    //         let [[prompt]] = await global.db.query(`SELECT * FROM Prompt WHERE id = ?`, [promptId]);
    //         if (!prompt) {
    //             return res.status(400).send({ error: "Prompt not found. contact support@dreamgenerator.ai if this is an issue." });
    //         }
    //         const message = {
    //             notification: {
    //                 title: 'You got a like!',
    //                 body: 'Somebody liked your prompt: "' + prompt.title.slice(0, 500) + '"'
    //             },
    //             token: promptCreator.pushToken
    //         };

    //         // Send a message to the device corresponding to the provided
    //         // registration token.
    //         try {
    //             const response = await messaging.send(message);
    //             let notification = new Notification({
    //                 authenticatedUser: req.authenticatedUser.id,
    //                 type: 1,
    //                 // text: `${req.authenticatedUser.username} liked your post!`
    //             });
    //             await notification.save();
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     }
    // })()).catch(err => console.error("error notifying about like", err));

    // Send the like as JSON in response
    res.json({ success: true });
}

// Route information
export const route = {
    url: "/api/share-comment-like",
    method: 'POST',
    authenticated: true,
};
