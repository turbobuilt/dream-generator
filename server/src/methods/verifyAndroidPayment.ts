// typescript

/* 
Step-by-step Plan:
1. Import Axios for network request and global.DbObject for database interaction
2. Define function parameter types and return type
3. Inside the function, use Axios.get to send a GET request to the Android Publisher API with the provided purchaseToken and subscriptionId
4. Parse the returned JSON for the "orderId" field
5. Run a raw db query on the Payment table to check if there is an existing Payment with the same androidOrderId. If such a Payment is found, return an error.
6. If no existing Payment with the same androidOrderId is found, create a new Payment object with the provided parameters and save it in the DB
7. Return the new credits, orderId, and androidToken
*/

import axios, { Axios, AxiosResponse } from 'axios';
import { Payment } from '../models/Payment';
import { updateUserInfo } from './verifyIosTransaction';
import * as g from "@googleapis/androidpublisher";
import * as fs from "fs";
import { inspect } from 'util';
import { addCredits } from './updateCredits';
import { AuthenticatedUser } from '../models/AuthenticatedUser';

export async function verifyAndroidPayment(purchaseToken: string, subscriptionId: string, userId?: number, allowAnonymous = false, req?): Promise<any> {
    const packageName: string = 'ai.dreamgenerator.apptwo';

    let con = g.androidpublisher("v3");
    const auth = new g.auth.GoogleAuth({
        keyFile: "dreamgenerator_service_account_token.json",
        projectId: "dreamgenerator-1691405135213",
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    var result: any;
    var isOneTimePurchase = subscriptionId == "fifty_credits"
    if (isOneTimePurchase) { // single
        let tempResult = await con.purchases.products.get({
            packageName: packageName,
            productId: subscriptionId,
            token: purchaseToken,
            auth: auth,
        });
        result = tempResult
    } else {
        result = await con.purchases.subscriptions.get({
            packageName: packageName,
            subscriptionId: subscriptionId,
            token: purchaseToken,
            auth: auth,
        });
    }

    let { orderId } = result.data;

    let [[existingPayment]] = await global.db.query('SELECT * FROM Payment WHERE androidOrderId = ?', [orderId]);
    console.log("android orderid", orderId, existingPayment)
    if (existingPayment) {
        if (existingPayment.authenticatedUser && userId) {
            if (existingPayment.authenticatedUser != userId) {
                let [[currentUser]] = await global.db.query('SELECT * FROM AuthenticatedUser WHERE id = ?', [userId]);
                await updateUserInfo(currentUser, existingPayment.authenticatedUser, existingPayment.plan);
            }
        }
        let [[authenticatedUser]] = await global.db.query('SELECT * FROM AuthenticatedUser WHERE id = ?', [existingPayment.authenticatedUser]);
        console.log("already credited", authenticatedUser);
        return { newCredits: 0, creditsRemaining: authenticatedUser.creditsRemaining, orderId: orderId, androidToken: purchaseToken, alreadyCredited: true, userId: existingPayment.authenticatedUser, mustLoginUser: true };
    }

    let mustLoginUser = false;
    if (!userId) {
        let [[paymentInfo]] = await global.db.query('SELECT authenticatedUser FROM Payment WHERE androidToken = ?', [purchaseToken]);
        if (paymentInfo) {
            userId = paymentInfo.authenticatedUser;
        } else {
            // return { error: "User not found" };
            // create a new user
            console.log("HAVE TO MAKE NEW USER");
            let user = new AuthenticatedUser();
            if (req) {
                let signupPlatform = "web";
                let { isandroid, isios } = req?.headers as any || {};
                if (isandroid == "true") {
                    signupPlatform = "android";
                } else if (isios == "true") {
                    signupPlatform = "ios";
                }
            }
            await user.save();
            userId = user.id;
            mustLoginUser = true;
        }
    }

    let payment = new Payment();

    payment.androidOrderId = orderId;
    payment.androidToken = purchaseToken;
    payment.productId = subscriptionId;
    payment.authenticatedUser = userId;
    payment.credits = 1;

    await payment.save();

    if (isOneTimePurchase) {
        console.log("quantity is ", result.data.quantity)
        var newCredits = 50 * result.data.quantity
        await global.db.query('update AuthenticatedUser set creditsRemaining = creditsRemaining + ? WHERE id=?', [newCredits, userId]);
        const [[results]] = await global.db.query('select creditsRemaining from AuthenticatedUser where id=?', userId);
        var creditsRemaining = parseFloat(results.creditsRemaining) as any;
    } else {
        var { creditsRemaining, newCredits } = await addCredits(userId, subscriptionId);
    }

    return { newCredits, creditsRemaining, orderId: orderId, androidToken: purchaseToken, alreadyCredited: false, mustLoginUser, userId };
}