var Filter = require('bad-words'),
    filter = new Filter();
export async function setName(req, res) {
    const { name } = req.body;
    if(!name) {
        return res.status(400).json({ error: 'Missing name' });
    }
    if (filter.isProfane(name)) {
        console.log("profane", name);
        return res.status(400).json({ error: 'Profanity detected' });
    }
    // run sql query to find and remove all emails that are already in ShareContact
    await global.db.query(`UPDATE AuthenticatedUser SET name=? WHERE id=?`, [name, req.authenticatedUser.id]);
    return res.json({ name });
}


export const route = {
    url: "/api/set-name",
    method: 'POST',
    authenticated: true,
};
