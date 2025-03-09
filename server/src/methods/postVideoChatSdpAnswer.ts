import { Request, Response } from 'express';
import { CallRoom, CallRoomAuthenticatedUser } from '../models/CallRoom';
import { v4 as uuidv4 } from 'uuid';
import { PostMessageResult, PostMessageToUser, postMessageToUser, StreamingEvent as VideoChatEvent } from './postSubscribeToNotifications';
import { auth } from 'google-auth-library';
import { AuthenticatedUser } from '../models/AuthenticatedUser';

export async function postVideoChatSdpAnswer(req: Request, res: Response, data: { callRoomId: number, answer?: any, sdpId?: number, remoteSdpId?: number } = null) {

    // create call room if no id
    if (!data?.callRoomId) {
        return res.status(400).json({ error: "callRoomId is required" })
    }
    let [[callRoomResult]] = await db.query(`SELECT CallRoom.*, JSON_ARRAYAGG(authenticatedUser) as authenticatedUserIds
            FROM CallRoom 
            LEFT JOIN CallRoomAuthenticatedUser ON CallRoom.id = CallRoomAuthenticatedUser.callRoom
            WHERE CallRoom.id = ?`, [data.callRoomId]) as (CallRoom & { authenticatedUserIds: number[] })[][];
    console.log("Call room result", callRoomResult)
    if (!callRoomResult) {
        return res.status(400).send({ error: 'Call room not found' });
    }

    // @ts-ignore
    let { authenticatedUserIds, ...callRoomData } = callRoomResult;
    // console.log("call room data", callRoom)
    let callRoom = CallRoom.from(callRoomData);


    let originator = await AuthenticatedUser.queryFetch(`SELECT id,userName FROM AuthenticatedUser WHERE id = ?`, [callRoom.originator]);

    let [users] = await db.query(`SELECT AuthenticatedUser.id, AuthenticatedUser.callKitPushToken
        FROM CallRoomAuthenticatedUser
        JOIN AuthenticatedUser ON CallRoomAuthenticatedUser.authenticatedUser = AuthenticatedUser.id
        WHERE CallRoomAuthenticatedUser.callRoom = ?`, [callRoom.id]);

    let usersWithoutToken = users.map(user => { return { id: user.id } });

    let results: PostMessageResult[] = [];
    for (let callRoomUser of users) {
        if (callRoomUser.id === req.authenticatedUser.id)
            continue;
        delete callRoomUser.callKitPushToken;
        let event = ('videoChatSdpAnswer') as VideoChatEvent;
        results.push(await postMessageToUser(callRoomUser.id, { event: event, from: req.authenticatedUser.userName, fromUserName: req.authenticatedUser.userName, data: { callRoom, answer: data.answer, users: usersWithoutToken, originator, sdpId: data.sdpId, remoteSdpId: data.remoteSdpId } }));
    }

    return res.send({ callRoom, users: users.map(user => user.id), results, error: results.find(result => result.error) });
}

