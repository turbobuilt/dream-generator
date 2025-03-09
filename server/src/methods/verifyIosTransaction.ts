
import axios, { AxiosResponse } from 'axios';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { AuthenticatedUser } from '../models/AuthenticatedUser';
import { Payment } from "../models/Payment";
import { addCredits } from './updateCredits';
import { getIosSubscriptionStatus } from './getSubscriptionStatus';
import { plans as mainPlans, plans } from "./createPaymentIntent";
import { loginUser } from '../lib/loginUser';
import { Request } from "express";
import { geolocateIp } from './oauthLogin';

export const applePlans = Object.fromEntries(mainPlans.map(plan => {
    return [plan.appleId, plan]
}))

// export const plans = {
//     "ai.dreamgenerator.app.normal_plan": { credits: 100, name: "Normal" }, // 1.99
//     "ai.dreamgenerator.app.big_plan": { credits: 220, name: "Big" }, // 3.99
//     "ai.dreamgenerator.app.bigger_plan": { credits: 480, name: "Bigger" }, // 7.99
//     "ai.dreamgenerator.app.biggest_plan": { credits: 975, name: "Biggest" }, // 14.99
// }

export async function verifyIosTransaction(transactionIdentifier, user: AuthenticatedUser, req: Request): Promise<any> {
    let transactionInfo = await getTransactionIapIos(transactionIdentifier);
    if (transactionInfo?.error)
        return { error: transactionInfo.error };

    if (user) {
        let [[userData]] = await global.db.query('SELECT * FROM AuthenticatedUser WHERE id=?', [user.id]);
        user = new AuthenticatedUser();
        Object.assign(user, userData);
    }
    console.log("transaction info", transactionInfo)

    let { purchaseDate, productId, revocationDate, transactionReason, type, webOrderLineItemId, originalTransactionId, expiresDate } = transactionInfo;
    console.log("weborder line item id", webOrderLineItemId, "type", type, "reason", transactionReason, "original id", originalTransactionId)
    // or originalIosTransactionId=?
    let [[existingTransaction]] = await global.db.query('select * from Payment where webOrderLineItemIdIos=?', [webOrderLineItemId]);
    if (existingTransaction) {
        console.log("existing transaction", "web order line item id", existingTransaction.webOrderLineItemIdIos, "original id", existingTransaction.originalIosTransactionId, "transaction id", existingTransaction.iosTransactionId)
    }
    // let [[existingTransaction]] = await global.db.query('select * from Payment where webOrderLineItemIdIos=?', [webOrderLineItemId]);
    let userCreated = false;
    if (existingTransaction) {
        if (user) {
            if (!existingTransaction.authenticatedUser) {
                await global.db.query("UPDATE Payment SET authenticatedUser=? WHERE id=?", [user.id, existingTransaction.id]);
            }
            if (existingTransaction.authenticatedUser != user.id) {
                console.log("changin user")
                await updateUserInfo(user, existingTransaction.authenticatedUser, existingTransaction.productId);
            }
            let [[authenticatedUser]] = await global.db.query('select * from AuthenticatedUser where id=?', existingTransaction.authenticatedUser);
            return { data: { creditsRemaining: authenticatedUser.creditsRemaining, newCredits: 0, authenticatedUser: user.getClientSafeUser() } };
        } else {
            if (existingTransaction.authenticatedUser) {
                return { data: await loginUser(existingTransaction.authenticatedUser) };
            } else {
                let authenticatedUser = new AuthenticatedUser();
                authenticatedUser.creditsRemaining = 5;
                await authenticatedUser.save();
                return { data: await loginUser(authenticatedUser.id) };
            }
        }
    } else {
        if (!user) {
            user = new AuthenticatedUser();
            await user.save();
            try {
                let ip = (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
                let { city, country, state } = await geolocateIp(ip);
                user.city = city;
                user.country = country;
                user.state = state;
                let { isandroid, isios } = req.headers as any;
                let signupPlatform = "web";
                if (isandroid == "true") {
                    signupPlatform = "android";
                } else if (isios == "true") {
                    signupPlatform = "ios";
                }
                user.signupPlatform = signupPlatform;
                await user.save();
            } catch (err) {
                console.error("Error adding more info to new user", err);
            }
            userCreated = true;
        }
    }

    // if (originalTransaction) {
    //     console.log("found original transaction")
    //     if (!originalTransaction.authenticatedUser) {
    //         console.log("no authenticated user on original transaction", originalTransaction)
    //         return { error: "Looks like you deleted your account.  If this is a mistake, contact me at support@dreamgenerator.ai because I was too impatient to cover this rare and unlikely scenario of people resubscribing.  Sorry if this bugs you, but it's really complicated keeping track of your info and credits after you deleted your account.  Couldn't figure it out (because if I deleted it, uh...) anyways, send me an email! Thanks!" };
    //     }

    //     let [[existingTransaction]] = await global.db.query('select * from Payment where iosTransactionId=? or webOrderLineItemIdIos=? or ((purchaseDateIos=? and productId=?) AND authenticatedUser=?)', [transactionIdentifier, webOrderLineItemId, purchaseDate, productId, originalTransaction.authenticatedUser]);
    //     if (existingTransaction) {
    //         console.log("found existing transaction")
    //     } else {
    //         console.log("did not find existing transaction")
    //     }
    //     if (user) {
    //         if (originalTransaction.authenticatedUser != user.id) {
    //             console.log("changin user")
    //             await updateUserInfo(user, originalTransaction.authenticatedUser);
    //         } else {
    //             console.log("not changing user")
    //         }
    //     }

    //     // could be a restore
    //     if (existingTransaction) {
    //         console.log("existing transaction info", existingTransaction);
    //         let [[authenticatedUser]] = await global.db.query('select * from AuthenticatedUser where id=?', originalTransaction.authenticatedUser);
    //         return { data: { creditsRemaining: authenticatedUser.creditsRemaining, newCredits: 0 } };
    //     }
    // } else {
    //     console.log("did not find")
    // }

    // if (!user) {
    //     if (!originalTransaction.authenticatedUser) {
    //         console.error("Error processing webhook - no authenticated userid found on original transaction", originalTransaction);
    //         return { error: "no authenticated user on original transaction" };
    //     }
    //     let [[authenticatedUser]] = await global.db.query('select * from AuthenticatedUser where id=?', originalTransaction.authenticatedUser);
    //     if (!authenticatedUser) {
    //         console.error("Error processing webhook - no authenticated user found for original transaction", originalTransaction);
    //         return { error: "no authenticated user found" };
    //     }
    //     user = authenticatedUser;
    // }

    let { creditsRemaining, newCredits } = await addCredits(user.id, productId);
    console.log("credits remaining", creditsRemaining, "new credits", newCredits)
    let data = {
        iosTransactionId: transactionIdentifier,
        originalIosTransactionId: originalTransactionId,
        productId,
        purchaseDateIos: purchaseDate,
        credits: newCredits,
        webOrderLineItemIdIos: webOrderLineItemId,
        expiresDateApple: expiresDate,
        authenticatedUser: user.id
    };
    const transaction = new Payment();
    Object.assign(transaction, data);
    await transaction.save();
    let [[userData]] = await global.db.query('SELECT * FROM AuthenticatedUser WHERE id=?', [user.id]);
    user = new AuthenticatedUser();
    Object.assign(user, userData);

    let loginData = userCreated ? await loginUser(user.id) : { authenticatedUser: user.getClientSafeUser() }
    return { data: { creditsRemaining: user.creditsRemaining, newCredits: newCredits, ...loginData } };
}

export async function updateUserInfo(user, originalUserId, planId) {
    let [[associatedUser]] = await global.db.query('SELECT * from AuthenticatedUser WHERE id=?', originalUserId);
    associatedUser = new AuthenticatedUser(associatedUser);
    console.log("updating auth token")
    await global.db.query(`UPDATE AuthToken SET authenticatedUser = ? WHERE authenticatedUser = ?`, [associatedUser.id, user.id]);
    associatedUser.plan = planId || associatedUser.plan;
    associatedUser.email = user.email || associatedUser.email;
    associatedUser.name = user.name || associatedUser.name;
    associatedUser.provider = user.provider || associatedUser.provider;
    associatedUser.providerData = user.providerData || associatedUser.providerData;
    associatedUser.passwordHash = user.passwordHash || associatedUser.passwordHash;
    associatedUser.appleIdentifier = user.appleIdentifier || associatedUser.appleIdentifier;
    await associatedUser.save();
    return { data: { creditsRemaining: associatedUser.creditsRemaining, newCredits: 0 } };
}

setInterval(async function () {
    try {
        let [userIdsList] = await global.db.query(`SELECT id FROM AuthenticatedUser WHERE plan IS NOT NULL`);
        for (let userIdInfo of userIdsList) {
            try {
                let [[user]] = await global.db.query("SELECT * FROM AuthenticatedUser WHERE id=?", [userIdInfo.id]);
                user = new AuthenticatedUser(user);
                console.log("looding for plan", user.plan, "plans", plans, "user", user)
                let credits = plans.find(item => item.id === user.plan).credits;
                let [[lastPayment]] = await global.db.query("SELECT * FROM Payment WHERE authenticatedUser=? ORDER BY created DESC LIMIT 1", [user.id]);
                // if more than a week old, and user.creditsRemaining is greater than credits, set to credits
                if (lastPayment && lastPayment.created < Date.now() - 7 * 24 * 60 * 60 * 1000 && user.creditsRemaining > credits) {
                    await global.db.query("UPDATE AuthenticatedUser SET creditsRemaining = ? WHERE id=?", [credits, user.id]);
                }
            } catch (err) {
                console.error("error with weekly transaction thing", userIdInfo)
                console.error(err);
            }
        }
    } catch (err) {
        console.error("error with weekly transaction thing")
        console.error(err);
    }
}, 10 * 60 * 60 * 1000)



export async function getTransactionIapIos(transactionIdentifier, isProduction = process.env.NODE_ENV == "production") {
    let apple_iap_api_key_id = process.env.apple_iap_api_key_id;
    let apple_iap_api_key = Buffer.from(process.env.apple_iap_api_key, "base64");

    const prodUrl = 'https://api.storekit.itunes.apple.com/inApps/v1/transactions/';
    const sandboxUrl = 'https://api.storekit-sandbox.itunes.apple.com/inApps/v1/transactions/';
    const rootUrl = isProduction ? prodUrl : sandboxUrl;

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
        let txResponse = await axios.get(`${rootUrl}${transactionIdentifier}`, { headers });
        const jwsContent = jwt.decode(txResponse.data.signedTransactionInfo);
        return jwsContent as any;
    } catch (err) {
        if (err.response) {
            let txResponse = err.response;
            if (txResponse.status === 401 && isProduction) {
                console.log("401 error with production", isProduction, "retrying with isproduction false");
                return await getTransactionIapIos(transactionIdentifier, false);
            } else if (txResponse.status === 404 && isProduction) {
                return await getTransactionIapIos(transactionIdentifier, false);
            }
            if (txResponse.status === 404) {
                return { error: "that transaction was not found on apple servers. if this is a mistake please contact support@dreamgenerator.ai and I will fix. I apologize for the inconvenience and hope to fix it soon! Sincerely, management" };
            }
        } else {
            console.error("Error parsing ios transaction")
            console.log("transaction Identifier", transactionIdentifier)
            console.error(err);
            return { error: err.message };
        }
    }
}