import { AuthToken } from "../models/AuthToken";
import { createUser } from "./createUser";
import { Request, Response } from "express";
import { geolocateIp } from "./oauthLogin";

export async function createAnonymousAccount(req: Request, res: Response) {
    let { accountCreated, isWeb } = req.body as any;
    let signupPlatform = "";
    if (isWeb) {
        signupPlatform = "web";
    }
    let { isios, isandroid } = req.headers;
    if (isios == "true") {
        signupPlatform = "ios";
    } else if (isandroid == "true") {
        signupPlatform = "android";
    } else {
        signupPlatform = "web";
    }
    console.log("headers", req.headers)
    var city = null, country = null, state = null;
    try {
        // cloudflare
        let ip = (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
        ({ city, country, state } = await geolocateIp(ip));
    } catch (err) {
        console.error("error looking up ip")
        console.error(err);
    }

    let authenticatedUser = await createUser({ email: null, name: null, provider: "anonymous", signupPlatform, city, state, country });
    console.log("Body si", req.body);
    if (isWeb) {
        authenticatedUser.creditsRemaining = 1;
        authenticatedUser.agreesToTerms = true;
        await authenticatedUser.save();
    }
    if (accountCreated == true || accountCreated == "true") {
        authenticatedUser.creditsRemaining = 0;
        authenticatedUser.agreesToTerms = true;
        console.log("Saving user new...")
        await authenticatedUser.save();
    }

    const authToken = new AuthToken();
    await authToken.generate(authenticatedUser.id);

    return res.json({ authenticatedUser: authenticatedUser.getClientSafeUser(), token: authToken.token });
}

export const route = { url: "/api/create-anonymous-account", method: "POST", authenticated: false }