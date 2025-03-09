// typescript

/*
Implementation Plan:
1. Access req.body to extract signedPayload which is a JWS from apple.
2. Decode this payload from apple.
3. Console.log the payload for debugging purposes.
4. Deconstruct the payload to obtain { notificationType, data }.
5. Check if notificationType is anything other than "DID_RENEW". If so, return { success: true }.
6. In the data destructure it to get {signedTransactionInfo} which is another JWS, decode it as well.
7. Get transactionId from the decoded payload.
8. Import verifyIosTransaction to verify the transaction using the transactionId.
9. If verifyIosTransaction returns an error, send a response with status 400 and an object containing the error message.
10. If transaction is verified successfully, destructure the data with { creditsRemaining, newCredits } and send this as the json response.
*/

// import necessary libraries
import { Request, Response } from 'express';
import { verifyIosTransaction } from './verifyIosTransaction';
import { decode } from 'jsonwebtoken';

export async function handleAppStoreServerNotification(req: Request, res: Response): Promise<void> {

    // extract signedPayload from req.body
    let { signedPayload } = req.body;
    if(!signedPayload) {
        console.log("no signed payload, quitting", req.body)
        return res.status(400).json({ error: "signedPayload is required" });
    }

    // decode the payload
    let payload = decode(signedPayload);

    console.log(payload);

    // deconstruct the payload
    let { notificationType, subtype, data } = payload;

    // check if notificationType is anything other than "DID_RENEW"
    if (notificationType !== "DID_RENEW" ) { // && !(notificationType == "SUBSCRIBED" && subtype == "RESUBSCRIBE")
        console.log("notificationType is not DID_RENEW. returning", notificationType, data)
        res.json({ success: true });
        return;
    }

    // decode signedTransactionInfo
    let { signedTransactionInfo } = data;
    let transactionData = decode(signedTransactionInfo);

    let { transactionId, originalTransactionId } = transactionData;

    let verifyTransaction = await verifyIosTransaction(transactionId);

    // check if there is any error returned
    if (verifyTransaction.error) {
        console.error("Error verifying transaction " + transactionId)
        console.error(verifyTransaction.error);
        res.status(400).json({ error: verifyTransaction.error });
        return;
    }

    let { creditsRemaining, newCredits } = verifyTransaction.data;

    // send the response 
    res.json({ creditsRemaining, newCredits });
}


// define the route
export const route = { url: "/api/apple-app-store-server-notification-a43qyd3abb7", method: "POST", authenticated: false };
