import { Request, Response } from 'express';
import moment from 'moment';
import { inspect } from 'util';

interface ConnectionData {
    lastConnected: number,
    connection: Response<any, Record<string, any>>,
    clientGuid: string,
    eventListeners: {
        [eventListenerId: string]: { type: string, guid: string, data: any }
    }
}
export type PostMessageResult = { error?: string, code?: "user_offline" | "no_matching_event", explanation?: string, success?: boolean };

export const userConnections = {} as {
    [authenticatedUserId: number]: {
        [clientGuid: string]: ConnectionData
    }
};

// "garbage collect" items older than 2 minutes
setInterval(() => {
    for (let userId in userConnections) {
        for (let clientGuid in userConnections[userId]) {
            if (userConnections[userId][clientGuid].lastConnected < Date.now() - 120_000) {
                delete userConnections[userId][clientGuid];
            }
        }
    }
}, 60_000);

export function userHasActiveConnection(userId) {
    return !!userConnections[userId];
}

export async function postSubscribeToNotifications(req: Request, res: Response) {
    let { authenticatedUser } = req;
    if (!authenticatedUser) {
        return res.status(400).send({ error: 'Invalid authenticatedUser' });
    }
    console.log("subscribing to notifications for", authenticatedUser.id);
    let userConnection = userConnections[authenticatedUser.id];
    if (!userConnection) {
        userConnection = userConnections[authenticatedUser.id] = {};
    }
    console.log("events are", Object.values(req.body.events as any).map(obj => Object.values(obj.eventListeners).map(l => l.type).join(",")));
    let events = req.body.events;

    // remove stale client ids
    let newclientGuids = new Set(Object.keys(events));
    let existingclientGuids = new Set(Object.keys(userConnection));
    for (let clientGuid of existingclientGuids) {
        if (!newclientGuids.has(clientGuid)) {
            delete userConnection[clientGuid];
        }
    }

    for (let clientGuid of newclientGuids) {
        userConnection[clientGuid] = {
            lastConnected: Date.now(),
            connection: res,
            clientGuid: clientGuid,
            eventListeners: events[clientGuid].eventListeners
        };
    }
    // console.log("listening for events", inspect(events, false, null, true), "for", authenticatedUser.id);
    // console.log("connections is", inspect(userConnections, false, null, true));
    // send out the first sse event "connected" with { eventConnectionId }
    console.log("writing connected event");
    res.write(`event: connected\ndata: ${JSON.stringify({ connected: true })}\n\n`);
    return undefined;
}

export type StreamingEvent = "videoChatOffer" | "videoChatAnswer" | "videoChatSdp" | "videoChatCall" | "videoChatAnswer" | "videoChatHangup" | "videoChatIceCandidate" | "videoChatOffer" | "videoChatCallRequest" | "iceCandidate" | "endVideoChat" | "chatMessage" | "notification" | "videoChatSdpAnswer"
export interface PostMessageToUser { event: StreamingEvent, data: any, from: number, fromUserName: string }
export async function postMessageToUser(authenticatedUserId: number, message: PostMessageToUser): Promise<PostMessageResult> {
    console.trace(`called postMessageToUser ${message.event} to ${authenticatedUserId}`);
    let userConnection = userConnections[authenticatedUserId];
    console.log("user connections", Object.keys(userConnections));
    if (!userConnection) {
        console.log(`no connection for ${authenticatedUserId}`);
        return { error: `no connection for ${authenticatedUserId}`, code: "user_offline" };
    }
    let promises = [];

    console.log("user conneciton length", Object.keys(userConnection).length)
    for (let connection of Object.values(userConnection)) {
        if (!connection.eventListeners) {
            console.error("no eventListeners for", authenticatedUserId, "event", message.event);
            console.log(connection.eventListeners)
            continue;
        }
        let eventListener = Object.values(connection.eventListeners).find(item => item.type === message.event);
        if (!eventListener) {
            console.error(`no event listener found for user id: ${authenticatedUserId} event ${message.event}`);
            console.error(`available listeners for user: ${Object.values(connection.eventListeners).map(item => item.type)}`)
        } else {
            console.log(`found event listener for ${authenticatedUserId} event ${message.event}, sending event`)
            promises.push(new Promise(async (resolve, reject) => {
                console.log("last connected", connection.lastConnected)
                connection.connection.write(`event: ${message.event}\ndata: ${JSON.stringify({
                    eventListener,
                    ...message
                })}\n\n`, err => {
                    if (err) {
                        console.error(`error sending ${message.event} to ${authenticatedUserId}`, err);
                        resolve({ success: false, error: err.message });
                    }
                    resolve({ success: true });
                });
            }));
        }
    }
    let results = (await Promise.all(promises));
    let notificationSent = results.some(x => x?.success);
    if (notificationSent) {
        return { success: true };
    } else {
        console.error(`error sending notification to user: ${authenticatedUserId}, event: ${message.event}`);
        return { error: `no event listener for ${authenticatedUserId} that matches ${message.event}`, code: "no_matching_event", explanation: "The user you are trying to reach is offline and doesn't have notification enabled so they can't be contacted right now." + results.filter(x => x.error).map(x => x.error).join("\n  ") };
    }
}