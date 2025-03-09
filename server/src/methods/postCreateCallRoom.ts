import { Request, Response } from 'express';
import { CallRoom, CallRoomAuthenticatedUser } from '../models/CallRoom';
import { v4 as uuidv4 } from 'uuid';
import { PostMessageResult, PostMessageToUser, postMessageToUser, StreamingEvent as VideoChatEvent } from './postSubscribeToNotifications';
import { auth } from 'google-auth-library';
import { AuthenticatedUser } from '../models/AuthenticatedUser';
import { sendVideoChatPush } from './sendVideoChatPush';

export async function postCreateCallRoom(req: Request, res: Response, data: { callRoomId: number, authenticatedUserIds: number[] } = null) {
    // let authenticatedUserIds = req.body?.authenticatedUserIds || data?.authenticatedUserIds;
    // if (!authenticatedUserIds || !Array.isArray(authenticatedUserIds) || authenticatedUserIds.length === 0) {
    //     return res.status(400).send({ error: 'Invalid authenticatedUserIds' });
    // }

    let authenticatedUserIdsEscaped = data.authenticatedUserIds.map(val => parseInt(val as any)).filter(val => !isNaN(val));
    let newUsersSet: Set<number> = null;
    console.log("manage data is ", data)

    // create call room if no id
    let callRoom = new CallRoom();
    callRoom.uuid = uuidv4();
    callRoom.originator = req.authenticatedUser.id;
    await callRoom.save();
    newUsersSet = new Set([req.authenticatedUser.id, ...authenticatedUserIdsEscaped]);
    let newUsers = Array.from(newUsersSet);
    // console.log("Now call room is ", callRoom)
    // console.log("newUsers", newUsers);
    let originator = await AuthenticatedUser.queryFetch(`SELECT id,userName FROM AuthenticatedUser WHERE id = ?`, [callRoom.originator]);

    let newCallRoomAuthenticatedUsers = newUsers.map((authenticatedUserId: number) => {
        let callRoomAuthenticatedUser = new CallRoomAuthenticatedUser();
        callRoomAuthenticatedUser.callRoom = callRoom.id;
        callRoomAuthenticatedUser.authenticatedUser = authenticatedUserId;
        return callRoomAuthenticatedUser;
    });
    await Promise.all(newCallRoomAuthenticatedUsers.map(callRoomAuthenticatedUser => callRoomAuthenticatedUser.save()));
    let [users] = await db.query(`SELECT AuthenticatedUser.id, AuthenticatedUser.callKitPushToken
        FROM CallRoomAuthenticatedUser
        JOIN AuthenticatedUser ON CallRoomAuthenticatedUser.authenticatedUser = AuthenticatedUser.id
        WHERE CallRoomAuthenticatedUser.callRoom = ?`, [callRoom.id]);

    let usersWithoutToken = users.map(user => { return { id: user.id } });

    let promises: Promise<{ success?: boolean }>[] = [];
    for (let callRoomUser of users) {
        if (callRoomUser.id === req.authenticatedUser.id)
            continue;

        var payload: PostMessageToUser = { event: 'videoChatCallRequest', from: req.authenticatedUser.id, fromUserName: req.authenticatedUser.userName, data: { callRoom, users: usersWithoutToken, originator } };

        if (callRoomUser.callKitPushToken) {
            console.log("sending callkit push token starting videoChatCallRequest to ", callRoomUser.id)
            promises.push(sendVideoChatPush(callRoomUser.id, payload));
        }

        console.log("sending call room to user videoChatCallRequest", callRoomUser.id)
        promises.push(postMessageToUser(callRoomUser.id, payload));
    }
    let results = await Promise.allSettled(promises);
    let success = false;
    let error = null;
    console.log(results);
    if (!results.length) {
        res.send({ error: "This user is offline and doesn't have push notifications enabled, so you'll have to send a text instead!" })
        return;
    }

    let failed = [];
    let hasSuccess = false;
    for (let result of results) {
        if (result.status === "fulfilled") {
            if (result.value?.success) {
                hasSuccess = true;
                continue;
            } else {
                failed.push(result.value);
            }
        } else {
            failed.push(result.reason);
        }
    }
    console.log("Failed is", failed)
    let errorMessage = null;
    if (!hasSuccess) {
        errorMessage = failed[0];
    }

    let response = {
        callRoom,
        users: usersWithoutToken,
        originator,
        results: results,
        error: errorMessage
    };

    return res.send(response);
}