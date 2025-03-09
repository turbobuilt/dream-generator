import { Request, Response } from "express";
import { CallRoom } from "../models/CallRoom";
import { postMessageToUser } from "./postSubscribeToNotifications";

export async function postIceCandidate(req: Request, res: Response, data: { callRoomId, candidate, sdp, sdpId, remoteSdpId }) {
    let [[callRoomData]] = await db.query(`SELECT CallRoom.*, JSON_ARRAYAGG(authenticatedUser) as authenticatedUserIds
        FROM CallRoom 
        LEFT JOIN CallRoomAuthenticatedUser ON CallRoom.id = CallRoomAuthenticatedUser.callRoom
        WHERE CallRoom.id = ?`, [data.callRoomId]) as (CallRoom & { authenticatedUserIds: number[] })[][];
    if (!callRoomData)
        return res.status(400).send({ error: 'Call room not found' });
    let { authenticatedUserIds, ...callRoom } = callRoomData;
    callRoom = CallRoom.from(callRoom);
    console.log("call room is ", callRoomData, "call room id", data.callRoomId);

    for (let callRoomUserId of callRoomData.authenticatedUserIds) {
        if (callRoomUserId === req.authenticatedUser.id)
            continue;
        postMessageToUser(callRoomUserId, { event: "iceCandidate", from: req.authenticatedUser.id, fromUserName: req.authenticatedUser.userName, data: { callRoom, candidate: data.candidate, sdp: data.sdp, sdpId: data.sdpId, remoteSdpId: data.remoteSdpId } });
    }
    return res.send({ success: true });
}