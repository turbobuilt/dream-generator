export async function updateNudity(req, res) {
    let { allowNudity } = req.body;

    await global.db.query(`UPDATE AuthenticatedUser SET expandedContent = ? WHERE id = ?`, [allowNudity ? 1 : 0, req.authenticatedUser.id]);

    return res.json({ success: true });
}

export const route = { url: "/api/update-nudity", method: "POST", authenticated: true };