import { Request, Response } from 'express';
import { CallRoom, CallRoomAuthenticatedUser } from '../models/CallRoom';
import { postMessageToUser } from './postSubscribeToNotifications';

export async function postSendRtcAnswer(req: Request, res: Response, data: { sdp, callRoomId }) {
    let callRoom = await CallRoom.fetchById(data.callRoomId);
    if (!callRoom) {
        return res.status(400).send({ error: 'Call room not found' });
    }
    // get all users in the chat room
    let callRoomAuthenticatedUsers = await CallRoomAuthenticatedUser.queryFetchAll(`SELECT * FROM CallRoomAuthenticatedUser WHERE callRoom = ?`, [callRoom.id]);
    // let isMember = chatRoom.originator === req.authenticatedUser.id || callRoomAuthenticatedUsers.some(callRoomAuthenticatedUser => callRoomAuthenticatedUser.authenticatedUser === req.authenticatedUser.id);
    let isMember = false;
    if (callRoom.originator === req.authenticatedUser.id) {
        isMember = true;
    } else {
        for (let callRoomAuthenticatedUser of callRoomAuthenticatedUsers) {
            if (callRoomAuthenticatedUser.authenticatedUser === req.authenticatedUser.id) {
                isMember = true;
                break;
            }
        }
    }
    if (!isMember) {
        return res.status(400).send({ error: 'You are not a member of this call room' });
    }
    let allIds = callRoomAuthenticatedUsers.map(callRoomAuthenticatedUser => callRoomAuthenticatedUser.authenticatedUser).concat([callRoom.originator]).filter(id => id !== req.authenticatedUser.id);

    let promises = []
    for (let id of allIds) {
        promises.push(postMessageToUser(id, { event: 'videoChatAnswer', from: req.authenticatedUser.id, data: { callRoom: callRoom, sdp: data.sdp } }));
    }
    await Promise.all(promises);

    return res.send({ callRoom });
}