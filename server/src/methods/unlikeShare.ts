import { ShareLike } from "../models/ShareLike";

export async function unlikeShare(req, res) {
    let { share } = req.query;
    await global.db.query(`DELETE FROM ShareLike WHERE share=? AND authenticatedUser=?`, [share, req.authenticatedUser.id]);
    return res.json({ success: true });
}


export const route = {
    url: "/api/share-like",
    method: 'DELETE',
    authenticated: true,
};
