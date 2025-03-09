import { Request, Response } from 'express';
import { AuthenticatedUser } from '../models/AuthenticatedUser';
import jwt, { JwtPayload } from 'jsonwebtoken';
import moment from "moment";
import { assignNewUserFreeCredits } from './assignFreeCredits';
import { geolocateIp } from './oauthLogin';
import { getRequestGeolocation } from './getRequestIp';
import { AuthToken } from '../models/AuthToken';
import axios from 'axios';
// var jwkToPem = require('jwk-to-pem');
import jwkToPem from 'jwk-to-pem';
import argon2 from "argon2";
import * as crypto from 'crypto';

export async function postSubmitAppleWebLogin(req: Request, res: Response, data: any) {
    let { appleLoginData } = data as any;
    let idToken = appleLoginData.authorization.id_token;
    // let parsed = jwt.decode(idToken) as any;
    let parsed = await verifyAppleJwt(idToken);
    console.log("parsed", parsed);
    if (!parsed) {
        return res.status(400).send({ error: 'Invalid token' });
    }
    if (parsed.iss !== 'https://appleid.apple.com') {
        return res.status(400).send({ error: 'Invalid token. issuer is incorrect' });
    }
    let appleIdentifier = parsed.sub;
    let audienceId = parsed.aud;
    if (audienceId !== 'ai.dreamgenerator') {
        return res.status(400).send({ error: 'Invalid token. audience is incorrect' });
    }
    let expires = parsed.exp;
    if (expires < moment().unix()) {
        return res.status(400).send({ error: 'Invalid token. token has expired' });
    }
    let email = parsed.email;

    // find user by appleIdentifier
    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE appleIdentifier = ?`, [appleIdentifier]);
    let isNewUser = false;
    if (!authenticatedUser) {
        console.log("checking for user by email", email);
        [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE email = ?`, [email]);
        if (authenticatedUser) {
            // foun demail
            console.log("found user by email", authenticatedUser);
            // update to set appleIdentifier
            await global.db.query(`UPDATE AuthenticatedUser SET appleIdentifier = ? WHERE id = ?`, [appleIdentifier, authenticatedUser.id]);
        } else {
            isNewUser = true;
            authenticatedUser = new AuthenticatedUser();
            let { city, country, state } = await getRequestGeolocation(req);
            authenticatedUser.city = city;
            authenticatedUser.country = country;
            authenticatedUser.state = state;
            authenticatedUser.signupPlatform = "web";
            authenticatedUser.appleIdentifier = appleIdentifier;
            authenticatedUser.email = email;
            authenticatedUser.passwordHash = await argon2.hash(crypto.randomBytes(16).toString('hex'));
            authenticatedUser.name = `${appleLoginData.user?.name?.firstName || ''} ${appleLoginData.user?.name?.lastName || ''}`.trim() || null;
            authenticatedUser.provider = 'apple';
            await authenticatedUser.save();
            assignNewUserFreeCredits(authenticatedUser);
        }
    }
    authenticatedUser = Object.assign(new AuthenticatedUser(), authenticatedUser);

    const authToken = new AuthToken();
    await authToken.generate(authenticatedUser.id);
    return res.json({ authenticatedUser: authenticatedUser.getClientSafeUser(), token: authToken.token, newUser: isNewUser, plan: authenticatedUser.plan, creditsRemaining: authenticatedUser.creditsRemaining });
}

export const route = {
    authenticated: false
}

let appleKeys = [];
let lastFetch = 0;


async function verifyAppleJwt(token: string) {
    if (!appleKeys.length || lastFetch < moment().subtract(1, 'hour').unix()) {
        let response = await axios.get(`https://appleid.apple.com/auth/keys`);
        appleKeys = response.data.keys;
    }
    let parsed = jwt.decode(token, { complete: true });
    let key = appleKeys.find((k: any) => k.kid === parsed.header.kid);
    if (!key) {
        console.log("no key found");
        return false;
    }

    let pem = jwkToPem(key);
    try {
        let decoded = jwt.verify(token, pem, { algorithms: [key.alg] });
        return decoded as JwtPayload;
    } catch (err) {
        console.log("error verifying token", err);
        return false;
    }

    // {
    //     "keys": [
    //       {
    //         "kty": "RSA",
    //         "kid": "pggnQeNCOU",
    //         "use": "sig",
    //         "alg": "RS256",
    //         "n": "xyWY7ydqTVHRzft5fPZmTuD9Ahk7-_2_IekZGy07Ovhj5IhYyVU8Hq5j0_c9m9tSdJTRdKmNjMURpY4ZJ_9rd3EOQ_WnYHM2cZIQ5y3f_WxeElnv_f2fKDruA-ERaQ6duov-3NAXC3oTWdXuRGRLbbfOVCahTjvnAA8YBRUe3llW7ZvTG14g-fAEQVlMYDxxCsbjtBJiUzKxbH-8KvhIhP9AJtiLDfiK1yzVJ7Qn6HNm5AUsFQKOAgTqxDMJkhi7pyntTyxhpkLYTEndaPRXth_LM3hVmaoFb3P3TsPCbDjSEbKy1wAndfPSzUk6qjyyBYhdXH0sgVpKMBAdggylLQ",
    //         "e": "AQAB"
    //       },
    // ...
    //     ]
    //   }
}