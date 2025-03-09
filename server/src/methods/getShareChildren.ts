export async function getShareChildren(req, res, data?: { share: number, levels: number, loadImages: boolean }) {
    let { share, levels, loadImages } = data && typeof data !== 'function' ? data : req.query;
    // select comments that are top level (no parent) join on ShareLike, order by likesCount desc.  Then make that a subquery so that you can now select the children of each comment, and join on ShareLike again, order by likesCount desc.  Get top 5 comments and top 5 children of each comment.
    var sharedImagesQuery
    if (loadImages) {
        sharedImagesQuery = global.db.query(`
        SELECT Share.*, SharedImage.*
        FROM Share
        JOIN SharedImage ON SharedImage.id=Share.sharedImage
        WHERE Share.parent = ? AND SharedImage.id IS NOT NULL AND SharedImage.uploaded=1
        ORDER BY Share.created DESC
        `, [share]) as any[];
    }

    let items = [];
    console.log("share is ", share);
    if (levels) {
        let [shares] = await global.db.query(`
        SELECT children.*, ShareLike.id IS NOT NULL as liked
        FROM (SELECT Share.*, COUNT(ShareLike.id) as likesCount, COUNT(ObjectionableContentReport.id) as objectionableContentCount
            FROM Share
            LEFT JOIN ShareLike ON ShareLike.share=Share.id
            LEFT JOIN ObjectionableContentReport ON ObjectionableContentReport.share = Share.id
            WHERE Share.parent = ?
            GROUP BY Share.id
            ORDER BY likesCount DESC, Share.created DESC) as children
        LEFT JOIN ShareLike ON (ShareLike.share=children.id AND ShareLike.authenticatedUser=?)
        `, [share, req.authenticatedUser.id]) as any[];

        if (shares.length === 0) {
            return res.json({ items: [] });
        }
        let ids = [], placeholders = [];
        for (let item of shares) {
            ids.push(item.id);
            placeholders.push('?');
        }
        let promises = [];
        for (let item of shares) {
            // select comments and whether or not there is a ShareLike for the authenticated user for each comment
            promises.push(global.db.query(`
            SELECT info.*, COUNT(Share.id) as childCount FROM
                (SELECT comments.*, ShareLike.id IS NOT NULL as liked
                FROM (SELECT Share.*, COUNT(ShareLike.id) as likesCount, COUNT(ObjectionableContentReport.id) as objectionableContentCount
                    FROM Share
                    LEFT JOIN ShareLike ON ShareLike.share=Share.id
                    LEFT JOIN ObjectionableContentReport ON ObjectionableContentReport.share = Share.id
                    WHERE Share.parent = ?
                    GROUP BY Share.id
                    ORDER BY likesCount DESC, Share.created DESC) as comments
                LEFT JOIN ShareLike ON (ShareLike.share=comments.id AND ShareLike.authenticatedUser=?)) as info
            LEFT JOIN Share ON Share.parent=info.id
            GROUP BY info.id
            ORDER BY info.likesCount DESC, info.created DESC
            `, [item.id, req.authenticatedUser.id]));
        }
        let children = await Promise.all(promises);
        for (let i = 0; i < shares.length; i++) {
            items.push(shares[i]);
            items.push(...children[i][0]);
        }
    } else {
        let [comments] = await global.db.query(`
        SELECT info.*, COUNT(Share.id) as childCount FROM
            (SELECT comments.*, ShareLike.id IS NOT NULL as liked
            FROM (SELECT Share.*, COUNT(ShareLike.id) as likesCount, COUNT(ObjectionableContentReport.id) as objectionableContentCount
                FROM Share
                LEFT JOIN ShareLike ON ShareLike.share=Share.id
                LEFT JOIN ObjectionableContentReport ON ObjectionableContentReport.share = Share.id
                WHERE Share.parent = ?
                GROUP BY Share.id
                ORDER BY likesCount DESC, Share.created DESC) as comments
            LEFT JOIN ShareLike ON (ShareLike.share=comments.id AND ShareLike.authenticatedUser=?)) as info
        LEFT JOIN Share ON Share.parent=info.id
        GROUP BY info.id
        ORDER BY info.likesCount DESC, info.created DESC
        `, [share, req.authenticatedUser.id]) as any[];    
        items.push(...comments);
    }
    // console.log("items", items);
    if (sharedImagesQuery) {
        let [images] = await sharedImagesQuery;
        return res.json({ items, images });
    }
    return res.json({ items });
}
export const route = {
    url: "/api/share-children",
    method: "GET",
    authenticated: true
}

// SELECT *
// FROM (
//     SELECT *
//     FROM Share
//     LEFT JOIN ShareLike ON ShareLike.share=Share.id
//     WHERE Share.share=? AND Share.parent ${parent ? `= ?` : `IS NULL`}
//     ORDER BY ShareLike.likesCount DESC
//     LIMIT 5
// ) AS top_comments
// LEFT JOIN LATERAL (
//     SELECT *
//     FROM Share
//     LEFT JOIN ShareLike ON ShareLike.share=Share.id
//     WHERE Share.parent = top_comments.id
//     ORDER BY ShareLike.likesCount DESC
//     LIMIT 5
// ) AS top_replies ON TRUE

// let params = [share, share];
// let query = `
//     SELECT *
//     FROM (
//         SELECT *
//         FROM Share
//         LEFT JOIN ShareLike ON ShareLike.share=Share.id
//         WHERE Share.share=? AND Share.parent IS NULL
//         ORDER BY ShareLike.likesCount DESC
//         LIMIT 5
//     ) AS TopComments
//     LEFT JOIN (
//         SELECT *
//         FROM (
//             SELECT
//                 Share.*,
//                 ShareLike.*,
//                 ROW_NUMBER() OVER(PARTITION BY Share.parent ORDER BY ShareLike.likesCount DESC) as rn
//             FROM Share
//             LEFT JOIN ShareLike ON ShareLike.share=Share.id 
//             WHERE Share.share=?
//         ) subq
//         WHERE subq.rn <= 5
//     ) AS TopReplies ON TopComments.id = TopReplies.parent