import { SharedImage } from "../models/SharedImage";

export async function putToggleSharedImageSexualContent(req, res) {
    let [[user]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]) as any[];
    if (user.email !== 'support@dreamgenerator.ai') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    let share = req.body as any;
    let [[sharedImage]] = await global.db.query(`SELECT * FROM SharedImage WHERE id=?`, [share.sharedImage]) as any;

    sharedImage.sexualContent = sharedImage.sexualContent ? 0 : 1;
    await global.db.query(`UPDATE SharedImage SET sexualContent = ? WHERE id=?`, [sharedImage.sexualContent, sharedImage.id]);
    if (sharedImage.sexualContent) {
        await removeSexualContentFromFeeds(share);
    }
    return res.json({ sexualContent: sharedImage.sexualContent });
}

// export const route = {
//     url: "/api/share-featured",
//     method: "PUT"
// };

export async function removeSexualContentFromFeeds(share) {
    await global.db.query(`DELETE FROM UserMainFeed WHERE share=?`, [share.id]);
}