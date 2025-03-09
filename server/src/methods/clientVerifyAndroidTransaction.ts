// typescript

// Implementation Steps
// 1. Import needed modules and methods.
// 2. Define an async function named clientVerifyAndroidTransaction accepting two arguments req and res.
// 3. Extract transactionIdentifier and productId from the body of req.
// 4. Call method verifyAndroidPayment with arguments transactionIdentifier, productId and req.authenticatedUser.id.
// 5. Send the result of the verifyAndroidPayment using res.json.

// Imports
import { Auth } from "firebase-admin/lib/auth/auth";
import { loginUser } from "../lib/loginUser";
import { AuthenticatedUser } from "../models/AuthenticatedUser";
import { verifyAndroidPayment } from "./verifyAndroidPayment";
import { Request, Response } from "express";

// Function
export async function clientVerifyAndroidTransaction(req: Request, res: Response): Promise<void> {
    // Destructure parameters from request body
    let { transactionIdentifier, productId, old_receipt } = req.body;
    // User ID from authenticated user
    let userId = req.authenticatedUser?.id;
    // // if no user, create a new user
    // let userIsNew = false;
    // if (!userId) {
    //     let user = new AuthenticatedUser();
    //     await user.save();
    //     userId = user.id;
    //     userIsNew = true;
    // }
    // console.log("user id is", userId);

    try {
        // Verify Android Payment
        let verificationResult = await verifyAndroidPayment(old_receipt, productId, userId, true, req);
        userId = verificationResult.userId;
        console.log("Verification Result: ", verificationResult);
        // Send result as JSON to client
        let [[userData]] = await global.db.query('SELECT * FROM AuthenticatedUser WHERE id = ?', [userId]);

        let user = new AuthenticatedUser();
        
        Object.assign(user, userData);
        let loginData = verificationResult.mustLoginUser ? await loginUser(userId) : { authenticatedUser: user.getClientSafeUser() }
        console.log("must log in user: ", verificationResult.mustLoginUser);
        res.json({ ...verificationResult, ...loginData, });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error ' + error.message, message: error?.message });
    }
}

// Routing Configuration
export const route = {
    url: "/api/client-verify-android-transaction",
    method: 'POST',
    authenticated: false,
    handler: clientVerifyAndroidTransaction
};