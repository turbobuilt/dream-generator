import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';
// Instantiate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi(process.env.twitter_bearer_token);
// twitterClient.
import { Client, auth } from "twitter-api-sdk";

// Initialize auth client first

const requestClient = new TwitterApi({ clientId: process.env.twitter_oath2_client_id, clientSecret: process.env.twitter_oath2_client_secret });


export async function createTwitterToken(req, res) {
    let result = await requestClient.generateOAuth2AuthLink('https://dreamgenerator.ai/twitter-callback', { scope: ['offline.access', 'tweet.write', 'tweet.read', 'users.read'] });
    await db.query(`INSERT INTO TwitterAuth (codeVerifier, state) VALUES (?, ?)`, [result.codeVerifier, result.state]);
    // redirect end-user to url
    return res.redirect(result.url);
}

export const route = {
    url: "/api/twitter-token",
    method: "GET",
    authenticated: false
};