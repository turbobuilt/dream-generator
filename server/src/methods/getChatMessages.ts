import { Request, Response } from 'express';
import { getVideoCallLink, getVideoCallLinkSync } from '../models/ChatMessageVideoCall';

export async function getChatMessages(req: Request, res: Response) {
    let [items] = await db.query(`SELECT ChatMessage.id, ChatMessage.created, ChatMessage.authenticatedUser, 
            ChatMessageTarget.viewed, ChatMessageText.text, ChatMessageTarget.authenticatedUser as recipient,
            ChatMessageVideoCall.id as videoCallId, ChatMessageVideoCall.slug as videoCallSlug
        FROM ChatMessage
        JOIN ChatMessageTarget ON ChatMessageTarget.chatMessage = ChatMessage.id
        LEFT JOIN ChatMessageText ON ChatMessageText.chatMessage = ChatMessage.id
        LEFT JOIN ChatMessageVideoCall ON ChatMessageVideoCall.chatMessage = ChatMessage.id
        WHERE ChatMessageTarget.authenticatedUser = ? AND ChatMessageTarget.viewed = 0
        ORDER BY ChatMessage.created DESC
        LIMIT 10
        `, [req.authenticatedUser.id]);
    let promises = await items.map(async (item) => {
        if (item.videoCallId) {
            item.videoCallLink = getVideoCallLinkSync(item.videoCallId, req.authenticatedUser.userName || "Anonymous");
        }
    })
    await Promise.all(promises);
    console.log("itmes", items);
    return res.send({ items });
}