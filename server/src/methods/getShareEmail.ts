
export async function getShareEmail(req, res) {
    let [[shareEmailData]] = await global.db.query(`SELECT shareEmail FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]);
    return res.json({ shareEmail: shareEmailData.shareEmail ?? "" });
}


export const route = {
    url: "/api/share-email",
    method: 'GET',
    authenticated: true,
};
