import { Request, Response } from "express";
import { CallRoom } from "../models/CallRoom";
import { postMessageToUser } from "./postSubscribeToNotifications";

export async function postCallRoomAnswer(req: Request, res: Response, data: { sdp }, callRoomId) {
    return res.json({ error: "this method has been deprecated use post videoChatSdpAnswer"});

    // console.log("Data is", data);
    // let [[callRoom]] = await db.query(`SELECT CallRoom.*, JSON_ARRAYAGG(authenticatedUser) as authenticatedUserIds
    //     FROM CallRoom 
    //     LEFT JOIN CallRoomAuthenticatedUser ON CallRoom.id = CallRoomAuthenticatedUser.callRoom
    //     WHERE CallRoom.id = ?`, [callRoomId]) as (CallRoom & { authenticatedUserIds: number[] })[][];

    // if (!callRoom)
    //     return res.status(400).send({ error: 'Call room not found' });

    // console.log("call room is", callRoom)
    // for (let callRoomUserId of callRoom.authenticatedUserIds) {
    //     if (callRoomUserId === req.authenticatedUser.id)
    //         continue;
    //     postMessageToUser(callRoomUserId, { event: "videoChatSdpAnswer", from: req.authenticatedUser.userName, data: { callRoom, sdp: data.sdp }, fromUserName: req.authenticatedUser.userName });
    // }
    // return res.send({ success: true });
}