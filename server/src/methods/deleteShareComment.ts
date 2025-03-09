import { Request } from "express";
import { ShareComment } from "../models/ShareComment";

export async function deleteShareComment(req: Request, res) {
    let { id, body } = req.body;
    let [[shareComment]] = await global.db.query(`SELECT * FROM ShareComment WHERE id=?`, [id]) as any[];
    if (!shareComment) {
        return res.json({ error: "Share comment not found" });
    }
    if (shareComment.authenticatedUser !== req.authenticatedUser.id) {
        return res.json({ error: "You do not have permission to edit this comment" });
    }
    // check if any children
    let [[child]] = await global.db.query(`SELECT * FROM ShareComment WHERE parent=? LIMIT 1`, [id]) as any[];
    if (child) {
        // set body to [deleted]
        shareComment = new ShareComment(shareComment);
        shareComment.body = "[deleted]";
        await shareComment.save();
    } else {
        await global.db.query(`DELETE FROM ShareComment WHERE id=?`, [id]);
    }
    return res.json({ success: true });
}

export const route = {
    url: "/api/share-comment/:id",
    method: 'DELETE',
    authenticated: true,
};