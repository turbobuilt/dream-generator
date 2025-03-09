export async function toggleShareFeatured(req, res) {
    let [[user]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]) as any[];
    if (user.email !== 'support@dreamgenerator.ai') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    let share = req.body as any;
    share.featured = share.featured ? 0 : 1;
    await global.db.query(`UPDATE Share SET featured = ? WHERE id=?`, [share.featured, share.id]);
    return res.json({ share });
}

export const route = {
    url: "/api/share-featured",
    method: "PUT"
};