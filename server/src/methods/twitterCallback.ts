import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';
const twitterClient = new TwitterApi(process.env.twitter_bearer_token);
import { Client, auth } from "twitter-api-sdk";
const requestClient = new TwitterApi({ clientId: process.env.twitter_oath2_client_id, clientSecret: process.env.twitter_oath2_client_secret });

// https://dreamgenerator.ai/twitter-callback?state=g0t_7QX-8fX5XRBqsdGDVWKWXRrJgM11&code=cnhLMjNoS1dTSVF6S0liRnVXM3hWVU95SDlpamRIX09hOVp4Mi1ydTVWYjBrOjE3MDEwNzIxNjAzNzU6MTowOmFjOjE
export async function twitterCallback(req, res) {
    let { code, state } = req.query;
    let [[auth]] = await global.db.query("SELECT * FROM TwitterAuth WHERE state=?", [state]);
    try {
        const { client: userClient, refreshToken } = await requestClient.loginWithOAuth2({
            code: code,
            redirectUri: 'https://dreamgenerator.ai/twitter-callback',
            codeVerifier: auth.codeVerifier
        });
        console.log(userClient, refreshToken);
        // const accessToken = await userClient.
        await db.query(`UPDATE TwitterAuth SET refreshToken = ? WHERE id = ?`, [refreshToken, auth.id]);
        return res.json({ success: true, refreshToken: refreshToken });
    } catch (err) {
        console.error(err);
    }
}

export const route = {
    url: "/twitter-callback",
    method: "GET",
    authenticated: false
};