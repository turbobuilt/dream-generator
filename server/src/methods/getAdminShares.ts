export async function getAdminShares(req, res) {
    let [[user]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]) as any[];
    if (user.email !== 'support@dreamgenerator.ai') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    let { page } = req.query as any;
    page = parseInt(page);
    if (isNaN(page)) {
        page = 1;
    }
    let [shares] = await global.db.query(`SELECT Share.*, SharedImage.path, SharedImage.sexualContent, SharedImage.nudity
    FROM Share
    LEFT JOIN SharedImage ON SharedImage.id = Share.sharedImage
    WHERE Share.parent IS NULL
    ORDER BY id DESC LIMIT ?, 20`, [(page-1) * 20]) as any[];
    return res.json({ items: shares });
}

export const route = {
    url: "/api/admin-shares",
    method: "GET"
};