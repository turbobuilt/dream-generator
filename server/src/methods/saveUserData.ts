// typescript

/*
1. Destructure the understandsPublishCommitment variable from the req.body object
2. Ensure understandsPublishCommitment is cast to either a 1 or 0 based on "true" or true
3. Using the global database library, execute a query to update the AuthenticatedUser and set understandsPublishCommitment to the destructured variable where the id matches req.authenticatedUser.id
4. Return a response in json format indicating success
*/

import { NextFunction } from "express";
import { Request, Response } from "express";
import { AuthenticatedUser } from "../models/AuthenticatedUser";

export async function saveUserData (req: Request, res: Response, next: NextFunction): Promise<Response> {
    console.log("save user data");
    // Destructure variable
    let { understandsPublishCommitment, pushToken, autoPublish, trialDeclined } = req.body;

    let user = req.authenticatedUser;
    user = new AuthenticatedUser(user);
    console.log("pushtoken", pushToken);
    if(pushToken && typeof pushToken == "string" && pushToken.length < 1000) {
        user.pushToken = pushToken;
        await user.save();
        return res.json({ success: true });
    }
    if (autoPublish !== undefined) {
        user.autoPublish = autoPublish;
        await user.save();
        return res.json({ success: true });
    }
    // Ensure proper casting of variable
    understandsPublishCommitment = understandsPublishCommitment === "true" || understandsPublishCommitment === true ? 1 : 0;
    if (trialDeclined !== undefined) {
        user.trialDeclined = !!trialDeclined;
        await user.save();
        return res.json({ success: true });
    }

    try {
        // Execute update query
        // await global.db.query(`UPDATE AuthenticatedUser SET understandsPublishCommitment = ? WHERE id = ?`, [understandsPublishCommitment, req.authenticatedUser.id]);
        user.understandsPublishCommitment = understandsPublishCommitment;
        await user.save();

        // Return success response 
        return res.json({ success: true });

    } catch (err) {
        // Handle error and pass it to the next middleware
        return next(err);
    }
}

// Router details
export const route = {
    url: "/api/user/me",
    method: 'POST',
    authenticated: true
};
