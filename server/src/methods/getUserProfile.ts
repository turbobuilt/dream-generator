import { Request, Response } from "express";
import { userHasActiveConnection } from "./postSubscribeToNotifications";

export async function getUserProfile(req: Request, res: Response, data: any) {
    let userName = req.query?.userName || data?.userName;
    let [[profile]] = await global.db.query(`SELECT AuthenticatedUserProfile.*, IF(AuthenticatedUserFriend.id IS NULL, 0, 1) as isFriend, AuthenticatedUser.id as userId, AuthenticatedUser.userName, AuthenticatedUserProfilePicture.pictureGuid as picture
    FROM AuthenticatedUser
    LEFT JOIN AuthenticatedUserProfile ON AuthenticatedUser.id = AuthenticatedUserProfile.authenticatedUser
    LEFT JOIN AuthenticatedUserProfilePicture ON AuthenticatedUserProfilePicture.authenticatedUser = AuthenticatedUser.id
    LEFT JOIN AuthenticatedUserFriend ON (AuthenticatedUserFriend.authenticatedUser = ? AND AuthenticatedUserFriend.friend = AuthenticatedUser.id)
    WHERE AuthenticatedUser.userName = ?`, [req.authenticatedUser.id, userName]);
    if(!profile) {
        return res.status(400).send({ error: 'User not found' });
    }
    profile.isFriend = !!profile.isFriend;
    // check if is online
    profile.isOnline = userHasActiveConnection(profile.userId);
    return res.json({ profile });
}

export const route = {
    url: "/api/get-user-profile",
    method: 'GET',
    authenticated: true
};