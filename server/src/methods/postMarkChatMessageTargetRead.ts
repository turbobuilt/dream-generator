import { Request, Response } from "express";
import { transaction } from "../lib/db";

export async function postMarkChatMessageTargetRead(req: Request, res: Response, chatMessageId: number) {
    let [[chatMessageTarget]] = await global.db.query(`SELECT ChatMessageTarget.*
        FROM ChatMessageTarget
        JOIN ChatMessage ON ChatMessage.id = ChatMessageTarget.chatMessage
        WHERE ChatMessage.id = ? AND ChatMessageTarget.authenticatedUser = ?
        `, [chatMessageId, req.authenticatedUser.id]);
    if (!chatMessageTarget)
        return res.status(404).send({ message: 'not found' });
    // count existing targets for this
    let [[count]] = await global.db.query(`SELECT COUNT(*) as count
        FROM ChatMessageTarget
        WHERE ChatMessageTarget.chatMessage = ?`, [chatMessageTarget.chatMessage]);
    await transaction(async (con) => {
        await con.query(`UPDATE ChatMessageTarget SET viewed = 1 WHERE ChatMessageTarget.id = ?`, [chatMessageTarget.id]);
        // await global.db.query(`DELETE FROM ChatMessageTarget WHERE ChatMessageTarget.id = ?`, [chatMessageTargetId]);
        // await global.db.query(`DELETE FROM ChatMessage WHERE ChatMessage.id = ?`, [chatMessageTarget.chatMessage]);
        if (count.count <= 1) {
            await con.query(`DELETE FROM ChatMessageText WHERE ChatMessageText.chatMessage = ?`, [chatMessageTarget.chatMessage]);
        }
    });

    return res.json({ success: true });
}