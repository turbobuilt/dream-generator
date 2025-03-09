import { Request, Response } from 'express';

export async function getUserShares(req: Request, res: Response): Promise<void> {
    let { userName, page } = req.query as any;
    let { isandroid, isios } = req.headers as any || {};
    let perPage = 10;

    let sexualContentFilter = isandroid == "true" ? " AND SharedImage.sexualContent <> 1" : "";
    let [shares] = await global.db.query(`
        SELECT Share.*, COUNT(ShareLike.id) as likesCount
            , MIN(SharedImage.path) AS imagePath, MIN(SharedImage.model) AS model, COUNT(ShareLike.id) as likesCount,AuthenticatedUser.userName, AuthenticatedUser.id as userId, COUNT(ObjectionableContentReport.id) as objectionableContentCount, COUNT(DISTINCT BlockedAuthenticatedUser.blockingAuthenticatedUser) as blockedCount
        FROM Share
        JOIN AuthenticatedUser ON (Share.authenticatedUser = AuthenticatedUser.id AND AuthenticatedUser.userName = ?)
        LEFT JOIN SharedImage on Share.sharedImage = SharedImage.id
        LEFT JOIN ObjectionableContentReport on Share.id = ObjectionableContentReport.share
        LEFT JOIN ShareLike on Share.id = ShareLike.share
        LEFT JOIN BlockedAuthenticatedUser ON Share.authenticatedUser = BlockedAuthenticatedUser.blockedAuthenticatedUser
        WHERE parent IS NULL
            AND ObjectionableContentReport.id IS NULL
            ${sexualContentFilter}
        GROUP BY Share.id
        ORDER BY likesCount DESC, Share.created DESC
        LIMIT ${perPage} OFFSET ?
    `, [userName, (page - 1) * perPage]);
    
    for(let share of shares) {
        share.children = [];
    }
    res.json({ items: shares });
}