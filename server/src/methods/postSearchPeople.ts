import { Request, Response } from 'express';

export async function postSearchPeople(req, res, search, options) {
    let { page, perPage } = options;
    const [results] = await db.query(`SELECT AuthenticatedUser.id, AuthenticatedUser.userName, MIN(pictureGuid),
        WeFriended.friend IS NOT NULL AS weFriended, TheyFriended.friend IS NOT NULL AS theyFriended
        FROM AuthenticatedUser 
        LEFT JOIN AuthenticatedUserProfilePicture ON AuthenticatedUserProfilePicture.authenticatedUser = AuthenticatedUser.id
        LEFT JOIN AuthenticatedUserFriend as WeFriended ON (WeFriended.authenticatedUser = ? AND WeFriended.friend = AuthenticatedUser.id)
        LEFT JOIN AuthenticatedUserFriend as TheyFriended ON (TheyFriended.authenticatedUser = AuthenticatedUser.id AND TheyFriended.friend = ?)
        WHERE username LIKE ?
        GROUP BY AuthenticatedUser.id
        LIMIT ?, ?`, [req.authenticatedUser.id, req.authenticatedUser.id, '%' + search + "%", (page - 1) * perPage, perPage]);
    return res.json({ items: results });
}