import { AuthenticatedUser } from "../models/AuthenticatedUser";
import { firebaseMessaging } from "./main";
import apn from "@parse/node-apn";
import { PostMessageToUser } from "./postSubscribeToNotifications";

var options = {
    token: {
        key: process.env.apple_key_file,
        keyId: process.env.apple_key_id,
        teamId: process.env.apple_team
    },
    production: false, //process.env.NODE_ENV === "production"
};


export async function sendVideoChatPush(authenticatedUserId: number, payload: PostMessageToUser) {
    var apnProvider = new apn.Provider(options);
    console.log("sending push to", authenticatedUserId);
    let [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [authenticatedUserId]) as AuthenticatedUser[][];
    console.log("authentending push to auticatedUser", authenticatedUser);
    if (!authenticatedUser || !authenticatedUser.callKitPushToken) {
        return;
    }

    // if (!authenticatedUser.pushToken) {
    //     return;
    // }

    // const response = await firebaseMessaging.send(message);
    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 10; // Expires 1 hour from now.
    note.badge = 3;
    note.sound = "ping.aiff";
    note.alert = "You have a new call";
    note.payload = payload;
    note.topic = "ai.dreamgenerator.app.voip";
    try {
        let result = await apnProvider.send(note, authenticatedUser.callKitPushToken);
        if (result.failed?.[0]) {
            console.log("failed to send push", result.failed?.[0]);
            return { error: JSON.stringify(result.failed?.[0]) };
        } else {
            console.log("sent push", result);
            return { success: true };
        }
    } catch (e) {
        console.log("error sending apns", e);
        return { error: e };
    }
}