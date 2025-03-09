import { Request } from "express";
import { ShareComment } from "../models/ShareComment";

export async function updateShareComment(req: Request, res) {
    let { body } = req.body;
    let { id } = req.params;
    let [[shareComment]] = await global.db.query(`SELECT * FROM ShareComment WHERE id=?`, [id]) as any[];
    if (!shareComment) {
        return res.json({ error: "Share comment not found" });
    }
    if (shareComment.authenticatedUser !== req.authenticatedUser.id) {
        return res.json({ error: "You do not have permission to edit this comment" });
    }
    shareComment = new ShareComment(shareComment);
    shareComment.body = body;
    await shareComment.save();
    return res.json(shareComment);
}

export const route = {
    url: "/api/share-comment/:id",
    method: 'PUT',
    authenticated: true,
};