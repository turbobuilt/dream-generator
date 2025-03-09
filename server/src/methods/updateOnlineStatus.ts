export async function updateOnlineStatus(req, res) {
    let [missed] = await global.db.query(`SELECT *
    FROM PopularityFeed
    WHERE PopularityFeed.position < (SELECT popularityFeedPosition FROM UserFeedInfo WHERE authenticatedUser=?)
    AND PopularityFeed.share NOT IN (SELECT share FROM UserPopularityFeed WHERE authenticatedUser=?)
    `, [req.authenticatedUser.id, req.authenticatedUser.id]) as any[];

    // add them to the UserPopularityFeed table
    if (missed.length > 0) {
        let [[{position}]] = await global.db.query(`SELECT MAX(position) as position FROM UserPopularityFeed WHERE authenticatedUser=?`, [req.authenticatedUser.id]) as any[];
        let query = `INSERT INTO UserPopularityFeed (created, authenticatedUser, share, position) VALUES `;
        let params = [];
        for (let i = 0; i < missed.length; i++) {
            query += `(?, ?, ?, ?),`;
            params.push(Date.now(), req.authenticatedUser.id, missed[i].share, ++position);
        }
        query = query.slice(0, -1);
        await global.db.query(query, params);
    }
}