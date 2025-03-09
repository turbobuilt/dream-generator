// typescript

/*
Steps for implementing the function:

1. Import the express library
2. Define the async function 'createApp'
3. Create a new express application by calling express()
4. Return the newly created application
*/

import express from 'express';
import bodyParser from 'body-parser';

const RAW_BODY_WHITELIST = ['/api/stripe-webhook'];

export async function createApp(): Promise<express.Express> {
    const app = express();
    app.use((req, res, next) => {
        console.log(req.method, req.url);
        next()
    })
    app.use(bodyParser.json({ limit: '2mb' }));
    return app;
}