import { Request, Response } from "express";
import { AuthenticatedUserFriend } from "../models/AuthenticatedUserFriend";
import { Notification } from "../models/Notification";

export  async function postAddFriend(req: Request, res: Response, data) {
    let user = req.authenticatedUser;
    let friendId = req.body?.friendId || data?.friendId;

    let authenticatedUserFriend = new AuthenticatedUserFriend();
    authenticatedUserFriend.authenticatedUser = user.id;
    authenticatedUserFriend.friend = friendId;
    
    try {
        await authenticatedUserFriend.save();
        let notification = new Notification();
        notification.authenticatedUser = friendId;
        notification.authenticatedUserFriend = authenticatedUserFriend.id;
        notification.save().catch(e => console.error("Error saving friend notification", e));
    } catch (e) {
        // check for duplicate key error - is friend already
        if (e.code === 'ER_DUP_ENTRY') {
            return res.status(400).send({ error: "Already friends" });
        }
        console.error(e);
        return res.status(500).send({ error: "Failed to add friend" });
    }
    // now check if there was a notification for us to remove
    let [[notification]] = await db.query(`SELECT Notification.* FROM
        Notification
        JOIN AuthenticatedUserFriend ON AuthenticatedUserFriend.id = Notification.authenticatedUserFriend
        WHERE Notification.authenticatedUser = ? AND AuthenticatedUserFriend.friend = ?`, [user.id, friendId]);
    if (notification) {
        await db.query(`DELETE FROM Notification WHERE id = ?`, [notification.id]);
    }
    res.send({ success: true });
}