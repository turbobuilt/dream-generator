import { Request, Response } from "express";

export async function postFetchChatMessageContent(req: Request, res: Response, chatMessageId: number) {
    let [[chatMessageText]] = await db.query(`SELECT ChatMessageText.*
        FROM ChatMessageText
        JOIN ChatMessage ON ChatMessage.id = ChatMessageText.chatMessage
        JOIN ChatMessageTarget ON ChatMessageTarget.chatMessage = ChatMessage.id
        WHERE ChatMessageText.chatMessage = ? AND ChatMessageTarget.authenticatedUser = ?
        `, [chatMessageId, req.authenticatedUser.id]);
    if (!chatMessageText) return res.status(400).send({ message: 'Chat message not found', code: "not_found" });
    return res.json({ items: [chatMessageText] });
}