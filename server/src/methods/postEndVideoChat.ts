import { Request, Response } from 'express';
import { CallRoom, CallRoomAuthenticatedUser } from '../models/CallRoom';
import { postMessageToUser } from './postSubscribeToNotifications';

export async function postEndVideoChat(req: Request, res: Response, data: { callRoomId }) {
    console.log("cal room id is", data.callRoomId);
    let callRoom = await CallRoom.fetchById(data.callRoomId);
    if (!callRoom) {
        return res.status(400).send({ error: 'Call room not found' });
    }
    console.log("Call room is", callRoom);
    // get all users in the chat room
    let callRoomAuthenticatedUsers = await CallRoomAuthenticatedUser.queryFetchAll(`SELECT * FROM CallRoomAuthenticatedUser WHERE callRoom = ?`, [callRoom.id]);
    console.log("call room authenticated users are", callRoomAuthenticatedUsers);

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
        promises.push(postMessageToUser(id, { event: 'endVideoChat', from: req.authenticatedUser.id, data: { callRoom: { id: callRoom.id } } }));
    }
    await Promise.all(promises);
    console.log("Sent messages")
    return res.send({ success: true });
}