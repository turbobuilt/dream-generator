import { Request, Response } from "express";

export async function deleteShareCommentLike(req: Request, res: Response): Promise<Response> {
    let { shareComment } = req.query;

    let [result] = await global.db.query(`DELETE FROM ShareCommentLike WHERE shareComment=? AND authenticatedUser=?`, [shareComment, req.authenticatedUser.id]);

    return res.json({ success: true });
}

export const route = {
    url: "/api/share-comment-like",
    method: "DELETE",
    authenticated: true
}