// typescript

// The implementation plan:
//
// 1. Import the necessary dependencies (express and verifyIosTransaction)
// 2. Define the function clientVerifyIosTransaction with the specified async keyword
// 3. Inside the function, extract transactionIdentifier from req.body using destructuring
// 4. Call the verifyIosTransaction function with the extracted transactionIdentifier, and wait for the promise using await. Use destructuring to extract error and data.
// 5. If error is set, respond with status 400 and the error message
// 6. If no error, using destructuring, extract creditsRemaining and newCredits from data
// 7. Send the extracted creditsRemaining and newCredits to the client in response
// 8. Export the route object with the required properties (url, method, authenticated) and the function as a handler

import express, { Request, Response } from "express";
import { verifyIosTransaction } from "./verifyIosTransaction";
import * as fs from 'fs';
var appleReceiptVerify = require('node-apple-receipt-verify');
var pkcs7 = require('pkcs7');

appleReceiptVerify.config({
    verbose: true,
    environment: process.env.NODE_ENV == 'production' ? 'production' : 'sandbox',
});

export async function clientVerifyIosTransaction(req: Request, res: Response) {
    let { old_receipt, transactionIdentifier } = req.body;
    
    let result = await verifyIosTransaction(transactionIdentifier, req.authenticatedUser, req);
    let { error, data } = result;
    if(data == null) {
        console.log("No data", req.body)
    }
    if (error) {
        res.status(400).json({ error: error });
    } else {
        res.json(data);
    }
}

export const route = {
    url: "/api/client-verify-ios-transaction",
    method: 'POST',
    authenticated: false,
    handler: clientVerifyIosTransaction
};
