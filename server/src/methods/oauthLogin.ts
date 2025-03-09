// typescript

/*
Step 1: Import necessary dependencies and modules
Step 2: Write the async function oauthLogin that will take req and res express
Step 3: Destructure token and provider from req.body
Step 4: Check if the provider is "google"
Step 5: If it's google, use google-auth-library to verify the given token using your CLIENT_ID
Step 6: Get user information from the payload. If an error occurs, return status 404 with the error message
Step 7: Check if the provider is "apple"
Step 8: If it's apple, use the verify-apple-id-token package to verify the given token using your clientId. Also get user data.
Step 9: If the token is invalid, return status 404 with error message
Step 10: If the token is valid, fetch the user details with the given email. If the user doesn't exist, create a new one
Step 11: Create a new AuthToken and generate a token
Step 12: Return the user details and the generated token
Step 13: At the end, write the export statement for this api's route

NB: You need to replace "yourIdToken", "yourAppleClientId", "nonce", "yourClientId", "clientId", "CLIENT_ID" with your actual client IDs and values
*/

import { Request, Response } from "express";
import { OAuth2Client, auth } from 'google-auth-library';
import { createUser } from "./createUser"
import { getAuthenticatedUserByEmail } from "./getAuthenticatedUserByEmail";
import { AuthToken } from '../models/AuthToken';
import axios from "axios";
import moment from "moment";
import jwt from "jsonwebtoken";
import { AuthenticatedUser } from "../models/AuthenticatedUser";
import maxmind, { CityResponse } from 'maxmind';
import { CreditLog } from "../models/CreditLog";
import { assignNewUserFreeCredits } from "./assignFreeCredits";
import { getRequestGeolocation, getRequestIp } from "./getRequestIp";

let appleKeys = null;


// let ip: string = (req.headers['CF-Connecting-IP'.toLowerCase()] || req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
let geoDb = null;
export async function geolocateIp(ip = "113.210.106.145") {
    if (geoDb === null) {
        geoDb = await maxmind.open<CityResponse>(process.env.environment == 'development' ? '/Users/dev/Documents/geoip/GeoLite2-City.mmdb' : '/home/dreamgenerator/GeoLite2-City.mmdb');
    }
    let result = geoDb.get(ip);
    let city = result.city.names.en;
    let country = result.country.iso_code;
    let state = result.subdivisions[0]?.names.en;

    return { city, country, state };
}

export async function oauthLogin(req: Request, res: Response): Promise<Response> {
    console.log("oauth login");
    let { isandroid, isios } = req.headers as any;
    if (!appleKeys) {
        appleKeys = (await axios.get('https://appleid.apple.com/auth/keys')).data;
    }
    let { token, provider, allowNudity } = req.body;
    if (!token || !provider) {
        return res.status(400).send({ error: "token and provider must be sent" });
    }

    let authenticatedUser: AuthenticatedUser = null;
    if (req.authenticatedUser) {
        if (req.authenticatedUser.provider !== "anonymous") {
            return res.status(400).send({ error: "You are already logged in. If this is not true, logout and try again.  If you still get the issue contact support@dreamgenerator.ai.  Apologies for the issue, working hard to make a great product!" });
        }
        authenticatedUser = req.authenticatedUser;
    }
    console.log(token, provider)
    let email = null, name = null, picture;
    let newUser = false;
    let signupPlatform = "web";
    if (isandroid == "true") {
        signupPlatform = "android";
    } else if (isios == "true") {
        signupPlatform = "ios";
    }

    var city = null, country = null, state = null;
    try {
        // cloudflare
        var { city, country, state } = await getRequestGeolocation(req);
        // let ip = getRequestIp(req);
        // ({ city, country, state } = await geolocateIp(ip));
    } catch (err) {
        console.error("error looking up ip")
        console.error(err);
    }

    if (provider === "google") {
        const client = new OAuth2Client();
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                // audience: "790316791498-3v4aburatuui2n989tdp3cstr97ss1ti.apps.googleusercontent.com",  
            });
            const payload = ticket.getPayload();
            const userid = payload['sub'];
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
            let columnName = provider + "Id";

            authenticatedUser = await getAuthenticatedUserByEmail(email) as any as AuthenticatedUser;
            if (authenticatedUser && !authenticatedUser.googleId) {
                await global.db.query(`UPDATE AuthenticatedUser SET ${columnName} = ? WHERE id = ?`, [userid, authenticatedUser.id]);
            }
            if (!authenticatedUser) {
                if (req.authenticatedUser && req.authenticatedUser.provider === "anonymous") {
                    await global.db.query(`UPDATE AuthenticatedUser SET ${columnName} = ?, email = ?, name = ?, provider='${provider}' WHERE id = ?`, [userid, email, name, req.authenticatedUser.id]);
                    [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser where id = ?`, [req.authenticatedUser.id]);
                } else {
                    newUser = true;
                    authenticatedUser = await createUser({ email: email, name: name, provider: provider, providerData: {}, city, state, country, [columnName]: userid, signupPlatform });
                }
            }
        } catch (err) {
            console.error(err)
            return res.status(400).json({ error: 'Failed to authenticate token: ' + err });
        }
    } else if (provider === "apple") {
        try {
            token = Buffer.from(token, 'base64').toString('ascii');
            console.log(token);
            const claims = await verifyAppleToken(token)
            console.log(claims)
            email = claims.email;
            let appleIdentifier = claims.sub;
            if (email) {
                authenticatedUser = await getAuthenticatedUserByEmail(email) as any as AuthenticatedUser;
                if (authenticatedUser && !authenticatedUser.appleIdentifier) {
                    await global.db.query(`UPDATE AuthenticatedUser SET appleIdentifier = ? WHERE id = ?`, [appleIdentifier, authenticatedUser.id]);
                }
            }
            if (!authenticatedUser) {
                [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser where appleIdentifier = ?`, [appleIdentifier])
            }

            if (!authenticatedUser) {
                email = claims.email;
                name = claims.name;
                if (req.authenticatedUser && req.authenticatedUser.provider === "anonymous") {
                    await global.db.query(`UPDATE AuthenticatedUser SET appleIdentifier = ?, email = ?, name = ?, provider='apple' WHERE id = ?`, [appleIdentifier, email, name, req.authenticatedUser.id]);
                    [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser where id = ?`, [req.authenticatedUser.id]);
                } else {
                    newUser = true;
                    authenticatedUser = await createUser({ email: email, name: name, provider: provider, providerData: {}, appleIdentifier, city, state, country, signupPlatform });
                }
            }
        } catch (err) {
            console.error(err)
            return res.status(400).json({ error: 'Failed to authenticate token: ' + err });
        }
    } else if (provider == "facebook") {
        try {
            let facebookData = req.body.facebookData;
            let response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`);
            const email = response.data.email;
            console.log('User email:', response.data);
            if(!email) {
                return res.status(400).json({error: "Facebook login failed because your email couldn't be retrieved.  Please contact support if this issue is bad and you can't figure out what to do.  Email support@dreamgenerator.ai"})
            }
            authenticatedUser = await getAuthenticatedUserByEmail(email) as any as AuthenticatedUser;
            if (!authenticatedUser) {
                console.log("making new facebook user")
                newUser = true;
                authenticatedUser = await createUser({ email: email, name: response.data.name, provider: provider, city, state, country, signupPlatform });
            }
            await global.db.query(`UPDATE AuthenticatedUser SET name = ?, facebookId = ?, facebookData = ? WHERE id = ?`, [response.data.name, response.data.id, JSON.stringify(facebookData), authenticatedUser.id]);
        } catch (err) {
            console.error(err?.response?.data || err);
            let errorMsg = err?.response?.data || err;
            return res.status(400).json({ error: 'Failed to authenticate token: ' + errorMsg });
        }
    }

    authenticatedUser = new AuthenticatedUser(authenticatedUser);
    if (allowNudity) {  
        authenticatedUser.expandedContent = true;
        await authenticatedUser.save();
    }
    if (newUser) {
        await assignNewUserFreeCredits(authenticatedUser);
    }
    const authToken = new AuthToken();
    await authToken.generate(authenticatedUser.id);
    return res.json({ authenticatedUser: authenticatedUser.getClientSafeUser(), token: authToken.token, newUser: newUser, plan: authenticatedUser.plan, creditsRemaining: authenticatedUser.creditsRemaining });
}

export const route = { url: "/api/oauth-login", method: "POST", authenticated: false }


const NodeRSA = require('node-rsa');
const request = require('request-promise');

async function verifyAppleToken(token) {
    const APPLE_IDENTITY_URL = 'https://appleid.apple.com';

    const getAppleIdentityPublicKey = async (kid) => {
        const url = APPLE_IDENTITY_URL + '/auth/keys';
        const data = await request({ url, method: 'GET' });
        const keys = JSON.parse(data).keys;
        const key = keys.find(k => k.kid === kid);
        const pubKey = new NodeRSA();
        pubKey.importKey({ n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') }, 'components-public');
        return pubKey.exportKey(['public']);
    };

    const iosBundleId = "ai.dreamgenerator.app"

    const validateIdentityToken = async (identityToken, isDev) => {
        try {
            const clientID = iosBundleId;
            const { header } = jwt.decode(identityToken, { complete: true });
            const applePublicKey = await getAppleIdentityPublicKey(header.kid);
            const jwtClaims = jwt.verify(identityToken, applePublicKey, { algorithms: 'RS256' });
            if (jwtClaims.iss !== APPLE_IDENTITY_URL) throw new Error('Apple identity token wrong issuer: ' + jwtClaims.iss);
            if (jwtClaims.aud !== clientID) throw new Error('Apple identity token wrong audience: ' + jwtClaims.aud);
            if (jwtClaims.exp < moment.utc().unix()) throw new Error('Apple identity token expired');
            return jwtClaims;
        } catch (err) {
            console.error(err)
            return null;
        }
    }
    let result = validateIdentityToken(token, false)
    return result
}