export async function publicFeed(req, res) {
    let { page, skip, originalPosition, maxPage, first, isFirstLoad } = req.query as any;
    let direction: "forward" | "reverse" = req.query.direction;
    let perPage = 8;
    skip = parseInt(skip) || 0;

    // if (isFirstLoad) {
    //     // delete all items from UserMainFeed for testing
    //     await global.db.query(`DELETE FROM UserMainFeed WHERE authenticatedUser=?`, [req.authenticatedUser.id]);
    // }

    let items: any[] = [];
    console.log(`
    SELECT items.*
    FROM (
        SELECT Share.id as id, Prompt.text, Prompt.style, Prompt.id as promptId, MIN(SharedImage.path) AS imagePath, COUNT(ShareLike.id) as likesCount, AuthenticatedUser.userName, AuthenticatedUser.id as userId
        FROM Share
        LEFT JOIN Prompt ON Share.prompt = Prompt.id
        LEFT JOIN SharedImage ON Share.sharedImage = SharedImage.id
        LEFT JOIN ShareLike ON Share.id = ShareLike.share
        LEFT JOIN AuthenticatedUser ON Share.authenticatedUser = AuthenticatedUser.id
        WHERE Share.parent IS NULL 
            AND Share.sharedImage IS NOT NULL AND SharedImage.uploaded=1
            ${req.authenticatedUser?.expandedContent ? "" : "AND SharedImage.nudity <> 1"}
            AND SharedImage.sexualContent <> 1
        GROUP BY Share.id, Prompt.id, Share.authenticatedUser
        ORDER BY likesCount DESC
        LIMIT ? OFFSET ?
    ) as items
`);

    [items] = await global.db.query(`
            SELECT items.*
            FROM (
                SELECT Share.id as id, Prompt.text, Prompt.style, Prompt.id as promptId, MIN(SharedImage.path) AS imagePath, COUNT(ShareLike.id) as likesCount, AuthenticatedUser.userName, AuthenticatedUser.id as userId
                FROM Share
                LEFT JOIN Prompt ON Share.prompt = Prompt.id
                LEFT JOIN SharedImage ON Share.sharedImage = SharedImage.id
                LEFT JOIN ShareLike ON Share.id = ShareLike.share
                LEFT JOIN AuthenticatedUser ON Share.authenticatedUser = AuthenticatedUser.id
                WHERE Share.parent IS NULL 
                    AND Share.sharedImage IS NOT NULL AND SharedImage.uploaded=1
                    ${req.authenticatedUser?.expandedContent ? "" : "AND SharedImage.nudity <> 1"}
                    AND SharedImage.sexualContent <> 1
                GROUP BY Share.id, Prompt.id, Share.authenticatedUser
                ORDER BY likesCount DESC
                LIMIT ? OFFSET ?
            ) as items
    `, [perPage, skip]) as any[];
    if (items.length > 0) {
        // add position to items
    }

    console.log(items);

    if (!items.length) {
        return res.json({ items: [], page });
    }

    // load child shares
    let ids = [], placeholder = [];
    for (let i = 0; i < items.length; i++) {
        ids.push(items[i].id);
        placeholder.push("?");
    }
    let [children] = await global.db.query(`
        SELECT results.parent, JSON_ARRAYAGG(JSON_OBJECT('id', results.id, 'parent', results.parent, 'text', results.text, 'resultsImage', results.sharedImage, 'likesCount', likesCount, 'userName', userName, 'userId', userId)) as children
        FROM Share AS sharea,
        LATERAL (
            SELECT Share.*, COUNT(ShareLike.id) as likesCount, AuthenticatedUser.userName, AuthenticatedUser.id as userId
            FROM Share
            LEFT JOIN ShareLike ON Share.id = ShareLike.share
            LEFT JOIN AuthenticatedUser ON Share.authenticatedUser = AuthenticatedUser.id
            WHERE Share.parent = sharea.id
            GROUP BY Share.id, AuthenticatedUser.userName, AuthenticatedUser.id
            ORDER BY likesCount DESC, Share.created DESC
            LIMIT 3
        ) as results
        WHERE sharea.id IN (${placeholder.join(",")})
        GROUP BY results.parent
    `, ids) as any[];

    let childrenMap = {};
    for (let i = 0; i < children.length; i++) {
        childrenMap[children[i].parent] = children[i].children;
    }

    for (let i = 0; i < items.length; i++) {
        items[i].children = childrenMap[items[i].id] || [];
    }

    return res.json({ items, page });
}
export const route = {
    url: "/api/public-feed",
    method: 'GET',
    authenticated: false,
};