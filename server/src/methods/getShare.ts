export async function getShare(req, res, data?: { id: number }) {
    let { id } = data || req.params;

    if (!id) {
        return res.status(400).send({ message: "ID is required" });
    }

    let query = `SELECT Share.*, Prompt.text, AuthenticatedUser.userName, SharedImage.path AS imagePath, SharedImage.model as model
    FROM Share 
    LEFT JOIN SharedImage ON Share.sharedImage = SharedImage.id 
    LEFT JOIN Prompt ON Share.prompt = Prompt.id
    LEFT JOIN AuthenticatedUser on Share.authenticatedUser = AuthenticatedUser.id
    WHERE Share.id = ?`;

    let [[share]] = await global.db.query(query, [id]);

    if (!share) {
        return res.status(404).send({ message: "Share not found" });
    }

    return res.send(share);
}

export const route = {
    url: "/api/share/:id",
    method: 'GET',
    authenticated: true
}