export async function generateFeed() {
    let [oldPopulartyFeed] = await global.db.query(`SELECT * FROM PopularityFeed ORDER BY position DESC`) as any[];
    let ordering: Map<string, [any, number]> = new Map();
    for (let i = 0; i < oldPopulartyFeed.length; i++) {
        ordering.set(oldPopulartyFeed[i].share, [oldPopulartyFeed[i], i]);
    }
    oldPopulartyFeed = null;

    let [newPopularityFeed] = await global.db.query(`SELECT Share.*, COUNT(*) as likesCount 
    FROM Share
    LEFT JOIN ShareLike on Share.id = ShareLike.share
    GROUP BY Share.id
    ORDER BY likesCount DESC`) as any[];

    let orderDeltas: Map<string, { oldIndex: number, newIndex: number }> = new Map();
    for (let i = 0; i < newPopularityFeed.length; i++) {
        let oldIndex = ordering.get(newPopularityFeed[i].id)?.[1];
        if (oldIndex !== undefined) {
            orderDeltas.set(newPopularityFeed[i].id, { oldIndex, newIndex: i });
        }
    }

    if (orderDeltas.size > 0) {
        let query = `SELECT PopularityFeed.share
        FROM PopularityFeed
        JOIN UserPopularityFeed ON UserPopularityFeed.share = PopularityFeed.share
        JOIN UserFeedInfo ON UserFeedInfo.authenticatedUser = UserPopularityFeed.authenticatedUser
        WHERE `;
        let params = [];
        for (let [shareId, { oldIndex, newIndex }] of orderDeltas) {
            query += `(PopularityFeed.share = ? AND UserFeedInfo.globalPopularityFeedPosition < ? AND UserFeedInfo.globalPopularityFeedPosition > ?) OR `;
            params.push(shareId, oldIndex, newIndex);
        }
        let [needsUpdate] = await global.db.query(query.slice(0, -4), params) as any[];
        // for any items that are found, add them to the UserPopularityFeed table
        if (needsUpdate.length > 0) {
            let [[{position}]] = await global.db.query(`SELECT MAX(position) as position FROM UserPopularityFeed WHERE authenticatedUser=?`, [needsUpdate[0].authenticatedUser]) as any[];
            let query = `INSERT INTO UserPopularityFeed (created, authenticatedUser, share, position) VALUES `;
            let params = [];
            for (let i = 0; i < needsUpdate.length; i++) {
                query += `(?, ?, ?),`;
                params.push(Date.now(), needsUpdate[i].authenticatedUser, needsUpdate[i].share, ++position);
            }
            query = query.slice(0, -1);
            await global.db.query(query, params);
        }
        // insert into OrderDelta (created, share, oldIndex, newIndex) on duplicate key update newIndex=newIndex
    }

    // truncate PopularityFeed and insert newPopularityFeed
    await global.db.query(`TRUNCATE TABLE PopularityFeed`);
    let query = `INSERT INTO PopularityFeed (created, share, position) VALUES `;
    let params = [];
    for (let i = 0; i < newPopularityFeed.length; i++) {
        query += `(?, ?, ?),`;
        params.push(Date.now(), newPopularityFeed[i].id, i);
    }
}