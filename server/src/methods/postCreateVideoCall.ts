import { Request, Response } from "express";
import { transaction } from "../lib/db";
import { ChatMessage } from "../models/ChatMessage";
import { ChatMessageVideoCall, getVideoCallLink } from "../models/ChatMessageVideoCall";
import { rword } from 'rword';
import moment from "moment";
import { postMessageToUser } from "./postSubscribeToNotifications";
import { ChatMessageTarget } from "../models/ChatMessageTarget";

export async function postCreateVideoCall(req: Request, res: Response, authenticatedUserIds: number[]) {
    // rate limit it to 5 per hour per user
    let [chatMessageVideoCalls] = await db.query(`SELECT ChatMessageVideoCall.* FROM ChatMessageVideoCall
        JOIN ChatMessage ON ChatMessage.id = ChatMessageVideoCall.chatMessage
        WHERE ChatMessage.authenticatedUser = ? AND ChatMessage.created > ?`, [req.authenticatedUser.id, moment().subtract(1, "hour").toDate().getTime()]);
    if (chatMessageVideoCalls.length >= 10) {
        return res.status(429).json({ error: "Rate limited hourly" });
    }

    let chatMessage = new ChatMessage();
    let chatMessageVideoCall = new ChatMessageVideoCall();
    await transaction(async (con) => {
        chatMessage.authenticatedUser = req.authenticatedUser.id;
        await chatMessage.save(con);
        chatMessageVideoCall.chatMessage = chatMessage.id;
        chatMessageVideoCall.slug = `${rword.generate(2).join('-')}`;
        await chatMessageVideoCall.save(con);
        authenticatedUserIds.unshift(req.authenticatedUser.id);
        let promises = await authenticatedUserIds.map(async (authenticatedUserId) => {
            let chatMessageTarget = new ChatMessageTarget();
            chatMessageTarget.chatMessage = chatMessage.id;
            chatMessageTarget.authenticatedUser = authenticatedUserId;
            chatMessageTarget.viewed = false;
            await chatMessageTarget.save(con);
        });
        await Promise.all(promises);
    });
    chatMessage["videoCallId"] = chatMessageVideoCall.id;

    let promises = await authenticatedUserIds.map(async (authenticatedUserId) => {
        let localChatMessage = JSON.parse(JSON.stringify(chatMessage));
        localChatMessage["videoCallLink"] = await getVideoCallLink(chatMessageVideoCall.id, authenticatedUserId);
        postMessageToUser(authenticatedUserId, { event: "chatMessage", data: { chatMessage: localChatMessage }, from: req.authenticatedUser.id, fromUserName: req.authenticatedUser.userName });
    });
    await Promise.all(promises);

    return res.json({ chatMessage });
}