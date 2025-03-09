import { Request, Response } from 'express';
import axios from "axios";
import { AuthenticatedUser } from '../models/AuthenticatedUser';
import { getRequestGeolocation } from './getRequestIp';
import argon2 from "argon2";
import * as crypto from 'crypto';
import { assignNewUserFreeCredits } from './assignFreeCredits';
import { AuthToken } from '../models/AuthToken';

export async function postMicrosoftLogin(req: Request, res: Response, data) {
    // https://graph.microsoft.com/v1.0/me
    let { accessToken } = data;
    console.log("accessToken", accessToken);
    let response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    console.log("data is", response.data);
    let { email, id, displayName } = response.data;
    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE microsoftId = ?`, [id, email]);
    let isNewUser = false;
    if (!authenticatedUser) {
        console.log("checking for user by email", email);
        [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE email = ?`, [email]);
        if (authenticatedUser) {
            // foun demail
            console.log("found user by email", authenticatedUser);
            // update to set appleIdentifier
            await global.db.query(`UPDATE AuthenticatedUser SET microsoftId = ? WHERE id = ?`, [id, authenticatedUser.id]);
        } else {
            isNewUser = true;
            authenticatedUser = new AuthenticatedUser();
            let { city, country, state } = await getRequestGeolocation(req);
            authenticatedUser.city = city;
            authenticatedUser.country = country;
            authenticatedUser.state = state;
            authenticatedUser.signupPlatform = "web";
            authenticatedUser.microsoftId = id;
            authenticatedUser.email = email;
            authenticatedUser.passwordHash = await argon2.hash(crypto.randomBytes(16).toString('hex'));
            authenticatedUser.name = displayName;
            authenticatedUser.provider = 'microsoft';
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