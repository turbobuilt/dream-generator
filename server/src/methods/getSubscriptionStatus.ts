
import { Request, Response } from "express";
import moment from "moment";
import { Payment } from '../models/Payment';
import { applePlans } from './verifyIosTransaction';
import * as g from "@googleapis/androidpublisher";
import axios, { AxiosResponse } from 'axios';
import jwt from 'jsonwebtoken';
import { AuthenticatedUser } from '../models/AuthenticatedUser';
import { verifyAndroidPayment } from "./verifyAndroidPayment";

export async function getSubscriptionStatus(req: Request, res: Response) {
    let user = req.authenticatedUser;
    let data = {
        planId: user.plan,
        planName: user.plan ? applePlans[user.plan]?.name : null,
        planCredits: user.plan ? applePlans[user.plan]?.credits : null,
        creditsRemaining: user.creditsRemaining,
        androidToken: null,
        transactionDate: null,
        error: null,
        plans: applePlans
    }

    if (user.plan) {
        let [[mostRecentPayment]] = await global.db.query('SELECT * FROM Payment WHERE authenticatedUser = ? AND androidToken IS NOT NULL OR iosTransactionId IS NOT NULL ORDER BY id DESC LIMIT 1', [user.id, user.plan]);
        data.androidToken = mostRecentPayment?.androidToken;
        if(!mostRecentPayment) {
            
        } else if (mostRecentPayment?.androidToken) {
            console.log("verifying android payment")
            let data = await verifyAndroidPayment(mostRecentPayment.androidToken, mostRecentPayment.productId, req.authenticatedUser.id);
            if (data && data.creditsRemaining > 0) {
                user.creditsRemaining = data.creditsRemaining;
                await user.save();
            }
            console.log("getting transaction")

            let transaction = await getAndroidTransaction(mostRecentPayment.androidToken, mostRecentPayment.productId);
            if (!transaction.error) {
                // check if expired
                let expiryTime = parseInt(transaction.expiryTimeMillis);
                if (expiryTime < Date.now()) {
                    console.log("expired")
                    // expired
                    data.planId = null;
                    data.planName = null;
                    data.planCredits = null;
                    data.planRenewalDate = null;
                    user.plan = null;
                } else {
                    user.plan = mostRecentPayment.productId;
                    data.androidToken = mostRecentPayment.androidToken;
                }
            } else {
                console.log(transaction.error);
                data.error = transaction.error.message;
            }
        } else if (mostRecentPayment.iosTransactionId) {
            console.log("getting ios")
            let subscriptions = await getIosSubscriptionStatus(mostRecentPayment.iosTransactionId);
            console.log("subscription", subscriptions);
            if (subscriptions.error) {
                console.error(subscriptions.error);
            } else {
                if (!subscriptions.length) {
                    user.plan = null;
                } else {
                    let transaction = subscriptions[0].lastTransactions[0];
                    // console.log(transaction); // originalTransactionId //signedTransactionInfo
                    let status = transaction.status;
                    if (status != 1) {
                        user.plan = null;
                    }
                }
            }
        }
    }
    await user.save();

    data.planId = user.plan;
    data.planName = user.plan ? applePlans[user.plan]?.name : null;

    return res.json(data);
}

async function getAndroidTransaction(token, productId) {
    try {
        const packageName: string = 'ai.dreamgenerator.app';
        let con = g.androidpublisher("v3");
        const auth = new g.auth.GoogleAuth({
            keyFile: "dreamgenerator_service_account_token.json",
            projectId: "dreamgenerator-1691405135213",
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });
        let result = await con.purchases.subscriptions.get({
            packageName: packageName,
            subscriptionId: productId,
            token: token,
            auth: auth,
        });
        return result.data;
    } catch (err) {
        console.error(err);
        return { error: err.message };
    }
}

// export async function getTransactionInfo(transactionIdentifier) {
//     let subscriptions = await getIosSubscriptionStatus(transactionIdentifier);
//     if (subscriptions.error) {
//         return subscriptions;
//     }
//     let transaction = data.lastTransactions[0];
// }

export async function getIosSubscriptionStatus(transactionIdentifier, isProduction = process.env.NODE_ENV == 'production') {
    let apple_iap_api_key_id = process.env.apple_iap_api_key_id;
    let apple_iap_api_key = Buffer.from(process.env.apple_iap_api_key, "base64")

    const rootUrl = !isProduction ? 'https://api.storekit-sandbox.itunes.apple.com/inApps/v1/subscriptions/' : 'https://api.storekit.itunes.apple.com/inApps/v1/subscriptions/';

    const jwToken = jwt.sign({
        iss: 'c2f6b442-5025-4d44-8a8b-314aee748cb8',
        iat: moment().unix(),
        exp: moment().add(60, 'minutes').unix(),
        aud: 'appstoreconnect-v1',
        bid: 'ai.dreamgenerator.app',
    }, apple_iap_api_key, {
        algorithm: 'ES256', keyid: apple_iap_api_key_id
    });

    const headers = {
        Authorization: `Bearer ${jwToken}`,
    };

    try {
        let subscriptionStatus = await axios.get(`${rootUrl}${transactionIdentifier}`, { headers })
        let info = subscriptionStatus.data;
        return info.data;
    } catch (err) {
        if (err.response) {
            let response = err.response;
            if (response.status === 404) {
                return { error: "that transaction was not found on apple servers. if this is a mistake please contact support@dreamgenerator.ai and I will fix. I apologize for the inconvenience and hope to fix it soon! Sincerely, management" };
            } else if (response.status === 401 && isProduction) {
                console.log("401 error... trying sandbox");
                return getIosSubscriptionStatus(transactionIdentifier, false);
            } else {
                console.error(err);
                return { error: err.message };
            }
        } else {
            console.error(err);
            return { error: err.message };
        }
    }
}

export const route = { url: '/api/subscription-status', method: 'GET', authenticated: true };