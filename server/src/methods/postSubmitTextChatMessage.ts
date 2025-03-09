import { Request, Response } from 'express';
import { ChatMessage } from '../models/ChatMessage';
import { ChatMessageText } from '../models/ChatMessageText';
import { postMessageToUser } from './postSubscribeToNotifications';
import { Notification } from "../models/Notification";
import { transaction } from '../lib/db';
import moment from 'moment';
import { ChatMessageTarget } from '../models/ChatMessageTarget';
import * as worker_threads from 'worker_threads';
import cron from "node-cron";

// if is main thread, not child process
if (worker_threads.isMainThread) {
    // every 30 seconds, check for ChatMessageTarget that are older than 1.5 minutes and send notification if not viewed
    cron.schedule("*/30 * * * * *", async function () {
        // console.log("Checking for notifications to send");
        var chatMessageTargets;
        try {
            [chatMessageTargets] = await db.query(`SELECT ChatMessage.*, 
                ChatMessageTarget.authenticatedUser as recipient,
                AuthenticatedUser.userName as originatorUserName,
                AuthenticatedUserProfilePicture.pictureGuid as originatorPictureGuid
            FROM ChatMessageTarget
            LEFT JOIN Notification ON Notification.chatMessage = ChatMessageTarget.chatMessage
            JOIN ChatMessage ON ChatMessage.id = ChatMessageTarget.chatMessage
            JOIN AuthenticatedUser ON AuthenticatedUser.id = ChatMessage.authenticatedUser
            LEFT JOIN AuthenticatedUserProfilePicture ON AuthenticatedUserProfilePicture.authenticatedUser = ChatMessage.authenticatedUser
            WHERE
                Notification.id IS NULL
                AND ChatMessage.created < ${moment().subtract(0, "minutes").toDate().getTime()}
                AND ChatMessage.created > ${moment().subtract(25, "minutes").toDate().getTime()}
                AND ChatMessageTarget.viewed <> 1`);
        } catch (e) {
            console.error("Error querying notifications", e);
            return;
        }
        chatMessageTargets.map(async function(data, index) {
            console.log("data", data, index);
            if (index === undefined)
                return;
            try {
                let notification = new Notification();
                notification.authenticatedUser = data.recipient;
                notification.chatMessage = data.id;
                notification.eventDateTime = data.created;
                await notification.save();
                notification.originatorPictureGuid = data.originatorPictureGuid;
                notification.originatorUserName = data.originatorUserName;
                await postMessageToUser(notification.authenticatedUser, { event: "notification", data: { notification, chatMessage: data }, from: data.authenticatedUser, fromUserName: null })
            } catch (e) {
                console.error("Error sending notification", e);
            }
        });
    });

}


export async function postSubmitTextChatMessage(req: Request, res: Response, authenticatedUserIds: number[], message: string) {
    var chatMessage = new ChatMessage();
    var chatMessageText = new ChatMessageText();

    // rate limit them to 10 per hour
    // let [[chatMessageCount]] = await db.query(`SELECT COUNT(*) as count 
    //     FROM ChatMessage 
    //     WHERE authenticatedUser = ? AND created > ${moment().subtract(1, "hour").toDate().getTime()}`, [req.authenticatedUser.id]);
    // if (chatMessageCount.count >= 10) {
    //     return res.status(429).send({ error: "You can't send a lot of texts now while in beta. This limit will be raised in the future. Please be patient, your quota resets every hour." });
    // }

    await transaction(async (con) => {
        chatMessage.authenticatedUser = req.authenticatedUser.id;
        await chatMessage.save(con);

        chatMessageText.text = message;
        chatMessageText.chatMessage = chatMessage.id;
        await chatMessageText.save(con);
        authenticatedUserIds.unshift(req.authenticatedUser.id);
        let promises = authenticatedUserIds.map(async (authenticatedUserId) => {
            let chatMessageTarget = new ChatMessageTarget();
            chatMessageTarget.chatMessage = chatMessage.id;
            chatMessageTarget.authenticatedUser = authenticatedUserId;
            chatMessageTarget.viewed = false;
            await chatMessageTarget.save(con);

            return chatMessageTarget;
        })
        await Promise.all(promises);
    });

    // await postMessageToUser
    let promises = [];
    for (let authenticatedUserId of authenticatedUserIds) {
        promises.push(postMessageToUser(authenticatedUserId, { event: "chatMessage", data: { chatMessage }, from: req.authenticatedUser.id, fromUserName: req.authenticatedUser.userName }));
    }
    await Promise.all(promises);
    return res.send({ chatMessage });
}