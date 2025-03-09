var Filter = require('bad-words'),
    filter = new Filter();

export async function saveShareEmail(req, res) {
    let { shareEmail } = req.body;
    if(!shareEmail) {
        return res.status(400).json({ error: 'Missing shareEmail' });
    }
    if (filter.isProfane(shareEmail)) {
        console.log("profane", shareEmail);
        return res.status(400).json({ error: 'Profanity detected' });
    }
    await global.db.query(`UPDATE AuthenticatedUser SET shareEmail=? WHERE id=?`, [shareEmail, req.authenticatedUser.id]);
}


export const route = {
    url: "/api/share-email",
    method: 'POST',
    authenticated: true,
};
