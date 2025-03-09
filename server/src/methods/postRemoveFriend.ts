import { Request, Response } from "express";
import { AuthenticatedUserFriend } from "../models/AuthenticatedUserFriend";

export default async function (req: Request, res: Response) {
    let user = req.authenticatedUser;
    let { friendId } = req.body;

    try {
        await global.db.query(`DELETE FROM AuthenticatedUserFriend WHERE authenticatedUser = ? AND friend = ?`, [user.id, friendId])
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: "Failed to add friend" });
    }
    res.send({ success: true });
}