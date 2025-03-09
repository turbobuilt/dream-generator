import { Request, Response } from "express";

// picture
// bio
// 

export class AuthenticatedUserProfile extends global.DbObject {
    picture: string;
    bio: string;
    authenticatedUser: number;
}

export async function getMyProfile(req: Request, res: Response) {
    let [[authenticatedUserProfile]] = await global.db?.query(`SELECT AuthenticatedUserProfile.*, AuthenticatedUserProfilePicture.pictureGuid as picture
        FROM AuthenticatedUserProfile 
        LEFT JOIN AuthenticatedUserProfilePicture on AuthenticatedUserProfilePicture.authenticatedUser = AuthenticatedUserProfile.authenticatedUser
        WHERE AuthenticatedUserProfile.authenticatedUser = ?`, [req.authenticatedUser.id]);
        
    if (!authenticatedUserProfile) {
        authenticatedUserProfile = new AuthenticatedUserProfile();
        authenticatedUserProfile.authenticatedUser = req.authenticatedUser.id;
        await authenticatedUserProfile.insert();
    }
    // if (authenticatedUserProfile.pictureGuid) {
    //     authenticatedUserProfile.picture = 
    
    // }
    return res.json({
        data: {
            ...authenticatedUserProfile,
            userName: req.authenticatedUser.userName,
        }
    });
}

export const route = {
    url: "/api/get-my-profile",
    authenticated: true,
};