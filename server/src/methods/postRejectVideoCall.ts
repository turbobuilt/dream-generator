import { Request, Response } from "express";
import { postMessageToUser } from "./postSubscribeToNotifications";

export async function postRejectVideoCall(req: Request, res: Response, { callRoomId }) {
    let [participants] = await db.query(`SELECT CallRoomAuthenticatedUser
        FROM CallRoomAuthenticatedUser
        WHERE callRoom = ?`, [callRoomId]);
    if (participants.length === 2) {
        // end call
        let promises = await participants.map(async (participant) => {
            if (participant.authenticatedUser == req.authenticatedUser.id)
                return;
            await postMessageToUser(participant.id, { event: "endVideoChat", from: req.authenticatedUser.id, fromUserName: req.authenticatedUser.userName, data: { callRoom: callRoomId } });
        })
    }
}