import { Request } from "express";
import { ShareComment } from "../models/ShareComment";

export async function saveShareComment(req: Request, res, data: { share: number, parent: number, body: string }) {
    let { share, parent, body } = data && typeof data !== "function" ? data : req.body;
    if (parent) {
        // make sure parent and share are on the same comment
        for (var i = 0; i < 1000; ++i) {
            let [[parentComment]] = await global.db.query(`SELECT * FROM ShareComment WHERE id=?`, [parent]) as any[];
            if (!parentComment) {
                return res.json({ error: "Parent comment not found" });
            }
            if (parentComment.share === share) {
                break;
            }
            parent = parentComment.parent;
        }
        if (i === 1000) {
            return res.json({ error: "Parent comment not found, over 1000 tries! This may be a mistake if this is the world's biggest thread!" });
        }
    }
    let shareComment = new ShareComment({ share, parent, body, authenticatedUser: req.authenticatedUser.id });
    await shareComment.save();
    return res.json({ ...shareComment, likesCount: 0, likes: 0 });
}

export const route = {
    url: "/api/share-comment",
    method: 'POST',
    authenticated: true,
};