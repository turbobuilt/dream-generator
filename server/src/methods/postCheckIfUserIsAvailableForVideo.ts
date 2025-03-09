import { Request, Response } from 'express';
import { userHasActiveConnection } from './postSubscribeToNotifications';
import { AuthenticatedUser } from '../models/AuthenticatedUser';


export async function postCheckIfUserIsAvailableForVideo(req: Request, res: Response, { userId }) {
    console.log("Checking", userId)
    if (!userId) {
        return res.status(400).json({ error: "no user specified" });
    }
    let [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [userId]) as AuthenticatedUser[][];
    if (await userHasActiveConnection(userId) || authenticatedUser?.callKitPushToken) {
        return res.json({ available: true });
    } else if (false) {

    } else {
        return res.json({ available: false });
    }
}