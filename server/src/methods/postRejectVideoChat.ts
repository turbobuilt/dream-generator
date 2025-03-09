import { Request, Response } from "express";
import { CallRoom } from "../models/CallRoom";
import { postMessageToUser } from "./postSubscribeToNotifications";

export async function postRejectVideoChat(req: Request, res: Response, data: { callRoomId, candidate, sdp }) {
    let [[callRoomData]] = await db.query(`SELECT CallRoom.*, JSON_ARRAYAGG(authenticatedUser) as authenticatedUserIds
        FROM CallRoom 
        LEFT JOIN CallRoomAuthenticatedUser ON CallRoom.id = CallRoomAuthenticatedUser.callRoom
        WHERE CallRoom.id = ?`, [data.callRoomId]) as (CallRoom & { authenticatedUserIds: number[] })[][];
    if (!callRoomData)
        return res.status(400).send({ error: 'Call room not found' });
    let { authenticatedUserIds, ...callRoom } = callRoomData;
    callRoom = CallRoom.from(callRoom);

    // remove user
    await db.query(`DELETE FROM CallRoomAuthenticatedUser WHERE callRoom = ? AND authenticatedUser = ?`, [data.callRoomId, req.authenticatedUser.id]);

    for (let callRoomUserId of callRoomData.authenticatedUserIds) {
        if (callRoomUserId === req.authenticatedUser.id)
            continue;
        postMessageToUser(callRoomUserId, { event: "videoChatReject", from: req.authenticatedUser.userName, data: { callRoom, candidate: data.candidate, sdp: data.sdp } });
        // postMessageToUser(callRoomUserId, { event: "videoChatAnswer", from: req.authenticatedUser.userName, data: { callRoom, sdp: data.sdp } });
    }
    return res.send({ success: true });
}