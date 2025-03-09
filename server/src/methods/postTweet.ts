import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';
const twitterClient = new TwitterApi(process.env.twitter_bearer_token);
import { Client, auth } from "twitter-api-sdk";
const requestClient = new TwitterApi({ clientId: process.env.twitter_oath2_client_id, clientSecret: process.env.twitter_oath2_client_secret });

const readOnlyClient = twitterClient.readWrite;

export async function postTweet(tweet) {
    try {
        const requestClient = new TwitterApi({ clientId: process.env.twitter_oath2_client_id, clientSecret: process.env.twitter_oath2_client_secret });
        let [[tokenInfo]] = await db.query(`SELECT * FROM TwitterAuth ORDER BY id DESC LIMIT 1`);
        let expired = tokenInfo.expires < Date.now() - 10 * 1000;
        if (expired) {
            console.log("refreshing token")
            let result = await requestClient.refreshOAuth2Token(tokenInfo.refreshToken);
            var { expiresIn, accessToken, refreshToken } = result;
            let expirationMillisEpoch = Date.now() + expiresIn * 1000;
            await db.query(`INSERT INTO TwitterAuth (refreshToken, accessToken, expires) VALUES (?, ?, ?)`, [refreshToken, accessToken, expirationMillisEpoch]);
            console.log(result);
        } else {
            console.log("token not expired")
            var { accessToken } = tokenInfo as { accessToken: string };
        }
        // let response = await client.v2.tweet("This is a test");
        let response = await axios.post('https://api.twitter.com/2/tweets', {
            text: tweet
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        console.log("twitter result", response.data);
        return response.data;
    } catch (err) {
        console.error("erorr posting tweet")
        console.error(err);
    }
}