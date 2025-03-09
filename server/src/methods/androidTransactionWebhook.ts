// typescript

// Plan:
// 1. Import necessary packages and methods
// 2. Define the `androidTransactionWebhook` function
// 3. Destructure objects from req.body and check the notificationType
// 4. If the notificationType is not SUBSCRIPTION_RENEWED, return a 200 status code and log the information
// 5. Call `verifyAndroidPayment` function with purchaseToken and subscriptionId as arguments, await its response
// 6. Destructure the response and log any errors
// 7. Run a sql query to get authenticatedUser by androidToken from Payment table, await its response
// 8. Check if the user exists, if not return a 400 status code and log the error
// 9. If the user exists, update the user's remaining credits by the gotten credits	
// 10. return a successful response with status code 200 

import { Request, Response } from "express";
import { verifyAndroidPayment } from "./verifyAndroidPayment";
import { PubSub } from '@google-cloud/pubsub';
import { GoogleAuth } from "google-auth-library";
import * as google from "@googleapis/androidpublisher";

export async function startListeningPubSub() {
    var projectId = "dreamgenerator-1691405135213" //process.env.google_cloud_project_id, 
    var topicNameOrId = 'projects/dreamgenerator-1691405135213/topics/android'
    var subscriptionName = 'android-sub';
    // if (process.env.NODE_ENV != "production") {
    //     console.log("ignoring pubsub for non production NODE_ENV");
    //     return;
    // }

    // const auth = new google.auth.GoogleAuth({
    //     keyFile: "dreamgenerator-pubsub.json",
    //     // keyFile: "server_oauth_google.json",
    //     projectId: "dreamgenerator-1691405135213",
    //     scopes: ['https://www.googleapis.com/auth/pubsub']
    // });
    console.log("listening to pub sub");
    let auth = new GoogleAuth({keyFile: "dreamgenerator-pubsub.json"});

    // Instantiates a client

    const pubsub = new PubSub({ projectId, auth: auth });
    
    let [subscriptions] = await pubsub.getSubscriptions();
    // console.log(subscriptions)
    let subscription = subscriptions.find(s => s.metadata.topic == topicNameOrId);
    console.log(topicNameOrId)

    // Receive callbacks for new messages on the subscription
    subscription.on('message', async message => {
        try {
            console.log("got message")
            console.log('Received message:', message.data.toString());
            // "Ack" (acknowledge receipt of) the message
            message.ack();
            let result = await processBody(JSON.parse(message.data.toString()));
            console.log("result is", result);
        } catch (err) {
            console.error("Error processing message", err);
        }
    });

    // Receive callbacks for errors on the subscription
    subscription.on('error', error => {
        console.error('Received error:', error);
    });
}

export async function processBody(body) {
    console.log("processing body", body);
    if(!body.subscriptionNotification) {
        console.log("no subscription notification", body);
        return { success: true };
    }
    let { notificationType, purchaseToken, subscriptionId } = body.subscriptionNotification;

    if (notificationType !== 2) {
        console.log(`Non renewing subscription ignored. Subscription type: ${notificationType}, PurchaseToken: ${purchaseToken}, SubscriptionId: ${subscriptionId}. `);
        return { success: true };
    }

    let verificationResult = await verifyAndroidPayment(purchaseToken, subscriptionId);

    if (verificationResult.error) {
        console.error(`Verification error: ${verificationResult.error}`);
        return { error: verificationResult.error };
    }

    return { success: true };
}

export async function androidTransactionWebhook(req: Request, res: Response): Promise<Response> {
    let body = JSON.parse(Buffer.from(req.body.message.data, 'base64').toString())
    let { subscriptionNotification } = body;
    let { notificationType, purchaseToken, subscriptionId } = subscriptionNotification;

    if (notificationType !== 2) {
        console.log(`Subscription type: ${notificationType}, PurchaseToken: ${purchaseToken}, SubscriptionId: ${subscriptionId}. Non renewing subscription ignored.`);
        return res.status(200).json({ success: true });
    }

    let verificationResult = await verifyAndroidPayment(purchaseToken, subscriptionId);

    if (verificationResult.error) {
        console.error(`Verification error: ${verificationResult.error}`);
        return res.status(400).json({ error: verificationResult.error });
    }

    return res.status(200).json({ success: true });
}