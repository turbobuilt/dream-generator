import moment from "moment";
import mysql from "mysql";

export async function getFeedItems(req, res) {
    let { page, originalPosition, maxPage, first, isFirstLoad } = req.query as any;
    let { isandroid, isios } = req.headers as any;
    let direction: "forward" | "reverse" = req.query.direction;
    isFirstLoad = isFirstLoad == "true" || isFirstLoad == true;

    let perPage = 4;
    let isAppStoreApp = isios == 'true' || isandroid == 'true';
    console.log("Getting id")
    let escapedUserId = parseInt(req.authenticatedUser.id);
    console.log("got id")
    if (Number.isNaN(escapedUserId)) {
        console.log("invalid user id");
        return res.status(400).json({ error: "Invalid authenticated user id" });
    }

    let expandedContent = false;
    if (req.authenticatedUser) {
        let [[info]] = await global.db.query("SELECT expandedContent FROM AuthenticatedUser WHERE id=?", [req.authenticatedUser.id]) as any[];
        expandedContent = info.expandedContent;
    }

    let minLikes = 0;
    if (process.env.NODE_ENV === "production") {
        minLikes = 5;
    }

    let nudityFilter = expandedContent ? "" : "AND (SharedImage.nudity <> 1 OR Share.sharedAudio IS NOT NULL)";
    let hideReported = isAppStoreApp ? " AND objectionableContentCount = 0 " : "";
    let ageLimitDays = 3650
    let items: any[] = [];
    if (direction == "forward") {
        let popularItemsPromise = global.db.query(`
SELECT items.*, ShareLike.authenticatedUser IS NOT NULL as liked
FROM (
    SELECT Share.id as id, SharedImage.sexualContent, Share.featured, Share.created, Prompt.text, Prompt.style, Prompt.id as promptId, MIN(SharedImage.path) AS imagePath, MIN(SharedAudio.path) as audioPath, MIN(SharedImage.model) AS model, COUNT(ShareLike.id) as likesCount, AuthenticatedUser.userName, AuthenticatedUser.id as userId, COUNT(ObjectionableContentReport.id) as objectionableContentCount, COUNT(DISTINCT BlockedAuthenticatedUser.blockingAuthenticatedUser) as blockedCount,
    # friend
    IF(AuthenticatedUserFriend.friend IS NOT NULL, 1, NULL) as isFriend
    FROM Share
    LEFT JOIN Prompt ON Share.prompt = Prompt.id
    LEFT JOIN SharedImage ON Share.sharedImage = SharedImage.id
    LEFT JOIN SharedAudio ON Share.sharedAudio = SharedAudio.id
    LEFT JOIN ShareLike ON Share.id = ShareLike.share
    LEFT JOIN AuthenticatedUser ON Share.authenticatedUser = AuthenticatedUser.id
    LEFT JOIN AuthenticatedUserFriend ON (Share.authenticatedUser = AuthenticatedUserFriend.friend AND AuthenticatedUserFriend.authenticatedUser = ?)
    LEFT JOIN ObjectionableContentReport ON Share.id = ObjectionableContentReport.share
    LEFT JOIN BlockedAuthenticatedUser ON Share.authenticatedUser = BlockedAuthenticatedUser.blockedAuthenticatedUser
    WHERE Share.parent IS NULL 
        AND (Share.sharedImage IS NOT NULL OR Share.sharedAudio IS NOT NULL)
        AND Share.id NOT IN (SELECT share FROM UserMainFeed WHERE authenticatedUser = ?)
        AND Share.authenticatedUser NOT IN (SELECT blockedAuthenticatedUser FROM BlockedAuthenticatedUser WHERE blockingAuthenticatedUser = ?)
        AND (SharedImage.sexualContent <> 1 OR Share.sharedAudio IS NOT NULL)
        AND (Share.processed = 1 OR Share.sharedAudio IS NOT NULL)
        ${nudityFilter} AND (SharedImage.uploaded=1 OR SharedAudio.uploaded=1)
        ${isios == 'true' && false ? "AND (SharedImage.model='sdxl' OR SharedImage.model IS NULL)" : ''}
    GROUP BY Share.id, Share.featured, Share.created, Prompt.id, AuthenticatedUser.userName, AuthenticatedUser.id
    HAVING COUNT(ShareLike.id) >= ${minLikes} OR Share.created > ? ${hideReported}
    ORDER BY featured DESC, likesCount DESC
    LIMIT ?
) as items
LEFT JOIN ShareLike ON (ShareLike.share = items.id AND ShareLike.authenticatedUser = ?)`
            , [req.authenticatedUser.id, req.authenticatedUser.id, req.authenticatedUser.id, moment().subtract(ageLimitDays, "days").toDate().getTime(), perPage, req.authenticatedUser.id]) as any[];
        


        //  OR NOT EXISTS (SELECT 1 FROM ObjectionableContentReport WHERE authenticatedUser = ? LIMIT 1)
        let newItemsPromise = global.db.query(`
    SELECT items.*, ShareLike.authenticatedUser IS NOT NULL as liked
    FROM (
        SELECT Share.id as id, SharedImage.sexualContent, Share.featured, Share.created, Prompt.text, Prompt.style, Prompt.id as promptId, MIN(SharedImage.path) AS imagePath, MIN(SharedAudio.path) as audioPath, MIN(SharedImage.model) AS model, COUNT(ShareLike.id) as likesCount, AuthenticatedUser.userName, AuthenticatedUser.id as userId, COUNT(ObjectionableContentReport.id) as objectionableContentCount, COUNT(DISTINCT BlockedAuthenticatedUser.blockingAuthenticatedUser) as blockedCount,
        IF(AuthenticatedUserFriend.friend IS NOT NULL, 1, NULL) as isFriend
        FROM Share
        LEFT JOIN Prompt ON Share.prompt = Prompt.id
        LEFT JOIN SharedImage ON (Share.sharedImage = SharedImage.id)
        LEFT JOIN SharedAudio ON Share.sharedAudio = SharedAudio.id
        LEFT JOIN ShareLike ON Share.id = ShareLike.share
        LEFT JOIN AuthenticatedUser ON Share.authenticatedUser = AuthenticatedUser.id
        LEFT JOIN AuthenticatedUserFriend ON (Share.authenticatedUser = AuthenticatedUserFriend.friend AND AuthenticatedUserFriend.authenticatedUser = ?)
        LEFT JOIN ObjectionableContentReport ON Share.id = ObjectionableContentReport.share
        LEFT JOIN BlockedAuthenticatedUser ON Share.authenticatedUser = BlockedAuthenticatedUser.blockedAuthenticatedUser
            WHERE Share.parent IS NULL 
            AND (Share.sharedImage IS NOT NULL OR Share.sharedAudio IS NOT NULL)
            AND Share.id NOT IN (SELECT share FROM UserMainFeed WHERE authenticatedUser = ?)
            AND Share.authenticatedUser NOT IN (SELECT blockedAuthenticatedUser FROM BlockedAuthenticatedUser WHERE blockingAuthenticatedUser = ?)
            AND (SharedImage.sexualContent <> 1 OR Share.sharedAudio IS NOT NULL)
            AND (Share.processed = 1 OR Share.authenticatedUser = ? OR Share.sharedAudio IS NOT NULL)
            ${nudityFilter} AND (SharedImage.uploaded=1 OR SharedAudio.uploaded = 1)
            ${isios == 'true' ? "AND (SharedImage.model='sdxl' OR SharedImage.model IS NULL)" : ''}
        GROUP BY Share.id, Share.featured, Share.created, Prompt.id, AuthenticatedUser.userName, AuthenticatedUser.id
        HAVING COUNT(ShareLike.id) >= ${minLikes} OR Share.created > ? ${hideReported}
        ORDER BY created DESC
        LIMIT ?
    ) as items
    LEFT JOIN ShareLike ON (ShareLike.share = items.id AND ShareLike.authenticatedUser = ?)`
            , [req.authenticatedUser.id, req.authenticatedUser.id, req.authenticatedUser.id, req.authenticatedUser.id, moment().subtract(ageLimitDays, "days").toDate().getTime(), perPage, req.authenticatedUser.id]) as any[];
        console.log(mysql.format(`
    SELECT items.*, ShareLike.authenticatedUser IS NOT NULL as liked
    FROM (
        SELECT Share.id as id, SharedImage.sexualContent, Share.featured, Share.created, Prompt.text, Prompt.style, Prompt.id as promptId, MIN(SharedImage.path) AS imagePath, MIN(SharedAudio.path) as audioPath, MIN(SharedImage.model) AS model, COUNT(ShareLike.id) as likesCount, AuthenticatedUser.userName, AuthenticatedUser.id as userId, COUNT(ObjectionableContentReport.id) as objectionableContentCount, COUNT(DISTINCT BlockedAuthenticatedUser.blockingAuthenticatedUser) as blockedCount,
        IF(AuthenticatedUserFriend.friend IS NOT NULL, 1, NULL) as isFriend
        FROM Share
        LEFT JOIN Prompt ON Share.prompt = Prompt.id
        LEFT JOIN SharedImage ON (Share.sharedImage = SharedImage.id)
        LEFT JOIN SharedAudio ON Share.sharedAudio = SharedAudio.id
        LEFT JOIN ShareLike ON Share.id = ShareLike.share
        LEFT JOIN AuthenticatedUser ON Share.authenticatedUser = AuthenticatedUser.id
        LEFT JOIN AuthenticatedUserFriend ON (Share.authenticatedUser = AuthenticatedUserFriend.friend AND AuthenticatedUserFriend.authenticatedUser = ?)
        LEFT JOIN ObjectionableContentReport ON Share.id = ObjectionableContentReport.share
        LEFT JOIN BlockedAuthenticatedUser ON Share.authenticatedUser = BlockedAuthenticatedUser.blockedAuthenticatedUser
            WHERE Share.parent IS NULL 
            AND (Share.sharedImage IS NOT NULL OR Share.sharedAudio IS NOT NULL)
            AND Share.id NOT IN (SELECT share FROM UserMainFeed WHERE authenticatedUser = ?)
            AND Share.authenticatedUser NOT IN (SELECT blockedAuthenticatedUser FROM BlockedAuthenticatedUser WHERE blockingAuthenticatedUser = ?)
            AND (SharedImage.sexualContent <> 1 OR Share.sharedAudio IS NOT NULL)
            AND (Share.processed = 1 OR Share.authenticatedUser = ? OR Share.sharedAudio IS NOT NULL)
            ${nudityFilter} AND (SharedImage.uploaded=1 OR SharedAudio.uploaded = 1)
            ${isios == 'true' ? "AND (SharedImage.model='sdxl' OR SharedImage.model IS NULL)" : ''}
        GROUP BY Share.id, Share.featured, Share.created, Prompt.id, AuthenticatedUser.userName, AuthenticatedUser.id
        HAVING COUNT(ShareLike.id) >= ${minLikes} OR Share.created > ? ${hideReported}
        ORDER BY created DESC
        LIMIT ?
    ) as items
    LEFT JOIN ShareLike ON (ShareLike.share = items.id AND ShareLike.authenticatedUser = ?)`
            , [req.authenticatedUser.id, req.authenticatedUser.id, req.authenticatedUser.id, req.authenticatedUser.id, moment().subtract(ageLimitDays, "days").toDate().getTime(), perPage, req.authenticatedUser.id]))
        let [[popularItems], [newItems]] = await Promise.all([popularItemsPromise, newItemsPromise]);

        // console.log("popular items", popularItems);
        // console.log("new items", newItems);

        let popularItemIds = new Set(popularItems.map(item => item.id));
        let newItemsFiltered = newItems.filter(item => !popularItemIds.has(item.id));
        // console.log("popular items", popularItems.map(item => item.id));
        console.log("new items", newItemsFiltered.map(item => item.id));

        for (let i = popularItems.length - 1; i >= 0; i--) {
            items.push(popularItems[i]);
            popularItems.splice(i, 1);
        }
        // interleave popularItems and newItems
        for (var i = 0; i < Math.max(popularItems.length, newItemsFiltered.length); i++) {
            if (popularItems[i])
                items.push(popularItems[i]);
            if (newItemsFiltered[i])
                items.push(newItemsFiltered[i]);
        }

        if (items.length > 0) {
            // add position to items
            let [[maxPositionResult]] = await global.db.query(`SELECT MAX(position) as maxPosition FROM UserMainFeed WHERE authenticatedUser=?`, [req.authenticatedUser.id]) as any[];
            let maxPosition = maxPositionResult?.maxPosition || 0;
            await updateMainFeedItems(items, req.authenticatedUser.id, maxPosition);
            for (var item of items) {
                item.position = ++maxPosition;
            }
            first = items[0].position;
        }
    }
    var addExtra = (isFirstLoad && items.length < perPage)
    if (direction == "reverse" || addExtra) {
        let positionQuery = first ? `AND UserMainFeed.position < ${parseInt(first)}` : "";
        let [oldItems] = await global.db.query(`
        SELECT items.*, ShareLike.authenticatedUser IS NOT NULL as liked
        FROM (
            SELECT Share.id as id, SharedImage.sexualContent, UserMainFeed.position, Prompt.text, Prompt.style, Prompt.id as promptId, MIN(SharedImage.path) AS imagePath, MIN(SharedAudio.path) as audioPath, MIN(SharedImage.model) as model, COUNT(ShareLike.id) as likesCount, AuthenticatedUser.userName, AuthenticatedUser.id as userId, COUNT(ObjectionableContentReport.id) as objectionableContentCount, COUNT(DISTINCT BlockedAuthenticatedUser.blockingAuthenticatedUser) as blockedCount,
            IF(AuthenticatedUserFriend.friend IS NOT NULL, 1, NULL) as isFriend
            FROM Share
            LEFT JOIN Prompt ON Share.prompt = Prompt.id
            LEFT JOIN SharedImage ON Share.sharedImage = SharedImage.id
            LEFT JOIN SharedAudio ON Share.sharedAudio = SharedAudio.id
            LEFT JOIN ShareLike ON Share.id = ShareLike.share
            LEFT JOIN UserMainFeed ON (Share.id = UserMainFeed.share AND UserMainFeed.authenticatedUser = ?)
            LEFT JOIN AuthenticatedUser ON Share.authenticatedUser = AuthenticatedUser.id
            LEFT JOIN AuthenticatedUserFriend ON (Share.authenticatedUser = AuthenticatedUserFriend.friend AND AuthenticatedUserFriend.authenticatedUser = ?)
            LEFT JOIN ObjectionableContentReport ON Share.id = ObjectionableContentReport.share
            LEFT JOIN BlockedAuthenticatedUser ON Share.authenticatedUser = BlockedAuthenticatedUser.blockedAuthenticatedUser
            WHERE Share.parent IS NULL 
                AND (Share.sharedImage IS NOT NULL OR Share.sharedAudio IS NOT NULL)
                AND (SharedImage.sexualContent <> 1 OR Share.sharedAudio IS NOT NULL)
                AND Share.id IN (
                    SELECT share FROM (
                        SELECT share FROM UserMainFeed WHERE authenticatedUser = ? ${positionQuery} ORDER BY position DESC LIMIT ?
                    ) ids
                )
                AND (SharedImage.uploaded = 1 OR SharedAudio.uploaded = 1)
                AND (Share.processed = 1 OR Share.authenticatedUser = ? OR Share.sharedAudio IS NOT NULL)
            GROUP BY Share.id, Prompt.id, UserMainFeed.position, AuthenticatedUser.userName, AuthenticatedUser.id
            ORDER BY likesCount DESC
        ) as items
        LEFT JOIN ShareLike ON (ShareLike.share = items.id AND ShareLike.authenticatedUser = ?)
        ORDER BY items.position ASC
        `, [req.authenticatedUser.id, req.authenticatedUser.id, req.authenticatedUser.id, perPage, req.authenticatedUser.id, req.authenticatedUser.id]) as any[];
        for (let i = 0; i < oldItems.length; i++) {
            oldItems[i].addAtFront = true;
        }
        if (addExtra) {
            items = oldItems.slice(0, perPage - items.length).concat(items);
            if (items.length)
                delete items[items.length - 1].addAtFront;
        } else {
            items = oldItems;
        }
    }
    console.log("items are ", items)
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
        SELECT results.parent, JSON_ARRAYAGG(JSON_OBJECT('id', results.id, 'parent', results.parent, 'text', results.text, 'resultsImage', results.sharedImage, 'likesCount', likesCount, 'userName', userName, 'userId', userId, 'objectionableContentCount', objectionableContentCount )) as children
        FROM Share AS sharea,
        LATERAL (
            SELECT Share.*, COUNT(ShareLike.id) as likesCount, AuthenticatedUser.userName, AuthenticatedUser.id as userId, COUNT(ObjectionableContentReport.id) as objectionableContentCount
            FROM Share
            LEFT JOIN ShareLike ON sharea.id = ShareLike.share
            LEFT JOIN AuthenticatedUser ON sharea.authenticatedUser = AuthenticatedUser.id
            LEFT JOIN ObjectionableContentReport ON sharea.id = ObjectionableContentReport.share
            WHERE Share.parent = sharea.id AND Share.sharedImage IS NULL
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
    console.log("items are", items)
    return res.json({ items, page });

    // if (page < 0) {
    //     // just get items from UserMainFeed
    //     let [items] = await global.db.query(`SELECT *
    //     FROM UserMainFeed
    //     JOIN Share ON Share.id = UserMainFeed.share
    //     WHERE UserMainFeed.authenticatedUser = ? AND UserMainFeed.position < ?
    //     ORDER BY UserMainFeed.position DESC
    //     LIMIT 20`, [req.authenticatedUser.id, originalPosition]) as any[];
    // }

    // let [popularityItems] = await global.db.query(`SELECT * 
    // FROM UserPopularityFeed 
    // WHERE authenticatedUser=? AND position > (SELECT popularityFeedPosition FROM UserFeedInfo WHERE authenticatedUser=?) LIMIT 20`, [req.authenticatedUser.id, req.authenticatedUser.id]) as any[];
    // if (popularityItems.length === 0) {
    //     return { items: [] };
    // }
    // global.db.query(`UPDATE UserFeedInfo SET popularityFeedPosition = popularityFeedPosition + ? WHERE authenticatedUser=?`, [popularityItems.length, req.authenticatedUser.id]).catch(console.error);

    // // TODO get items from UserSocialFeed, and more
    // let allItems = popularityItems;

    // // insert iitems into UserMainFeed (created, authenticatedUser, share, position)
    // let query = `INSERT INTO UserMainFeed (created, authenticatedUser, share, position) VALUES `;
    // let values = [];
    // let [[{ maxPosition }]] = await global.db.query(`SELECT MAX(position) as maxPosition FROM UserMainFeed WHERE authenticatedUser=?`, [req.authenticatedUser.id]) as any[];
    // for (let i = 0; i < allItems.length; i++) {
    //     query += `(?, ?, ?, ?),`;
    //     values.push(Date.now(), req.authenticatedUser.id, allItems[i].share, ++maxPosition);
    // }
    // query = query.slice(0, -1);
    // await global.db.query(query, values);

    // return { items: allItems };
}

export async function updateMainFeedItems(items, authenticatedUserId, maxPosition) {
    let query = `INSERT INTO UserMainFeed (created, authenticatedUser, share, position) VALUES `;
    let values = [];
    for (let i = 0; i < items.length; i++) {
        query += `(?, ?, ?, ?),`;
        values.push(Date.now(), authenticatedUserId, items[i].id, ++maxPosition);
    }
    query = query.slice(0, -1);
    await global.db.query(query, values);
}

export const route = {
    url: "/api/feed",
    method: 'GET',
    authenticated: false,
};


//         `
//         SELECT items.*, ShareLike.authenticatedUser IS NOT NULL as liked
//         FROM (
//             SELECT Share.id as id, Prompt.text, Prompt.style, Prompt.id as promptId, MIN(SharedImage.path) AS imagePath, MIN(SharedAudio.path) as audioPath, COUNT(ShareLike.id) as likesCount, AuthenticatedUser.userName, AuthenticatedUser.id as userId
//             FROM Share
//             LEFT JOIN Prompt ON Share.prompt = Prompt.id
//             LEFT JOIN SharedImage ON Share.sharedImage = SharedImage.id
//             LEFT JOIN ShareLike ON Share.id = ShareLike.share
//             LEFT JOIN AuthenticatedUser ON Share.authenticatedUser = AuthenticatedUser.id
//             WHERE Share.parent IS NULL
//                 AND Share.sharedImage IS NOT NULL
//                 AND Share.id NOT IN (SELECT share FROM UserMainFeed WHERE authenticatedUser = ?)
//             GROUP BY Share.id, Prompt.id, AuthenticatedUser.userName, AuthenticatedUser.id
//             ORDER BY likesCount DESC
//             LIMIT ?
//         ) as items
//         LEFT JOIN ShareLike ON (ShareLike.share = items.id AND ShareLike.authenticatedUser = ?)
// `