// typescript

/*
Plan:
1. Import necessary modules and types.
2. Declare an async function updateuserName that takes two parameters (req, res) which represent the request and response objects respectively.
3. Destructure userName from the req.query.
4. Await on the global.db.query(...) to update userName in the AuthenticatedUser table in the database.
5. Return a JSON object { success: true } using res.json(...)
6. Export an object containing routing info.
*/

import { Request, Response } from 'express';
var Filter = require('bad-words'),
    filter = new Filter();

// function to update user's name
export async function saveUserName(req: Request, res: Response): Promise<void> {
    // get userName from query parameters
    let { userName } = req.query;
    if (!userName) {
        userName = req.body?.userName;
    }
    if (!userName) {
        res.status(400).json({ error: "User name is empty! This shouldn't happen, if it's a mistake contact support@dreamgenerator.ai" });
        return;
    }
    if (userName.length > 20) {
        res.status(400).json({ error: "User name must be less than 20 characters." });
        return;
    }
    if (filter.isProfane(userName)) {
        res.status(400).json({ error: "Profanity detected in user name." });
        return;
    }

    try {
        // make database query to update user's name
        const query = 'UPDATE AuthenticatedUser SET userName = ? WHERE id=?';
        await global.db.query(query, [userName, req.authenticatedUser.id]);

        // send back a json object showing that the operation was successful
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        if (err?.sqlMessage == "Duplicate entry 'bob' for key 'authenticateduser.userName'") {
            res.status(400).json({ error: "User name already taken" });
        } else {
            // In case of an error, instead of crashing, log the error and return a JSON response with success: false
            res.status(500).json({ error: err.message || "Error please contact support@dreamgenerator.ai" });
        }
    }
}

// route: all routes are listed here, this object includes all the routes this function is bound to.
export const route = {
    url: "/api/save-user-name",
    method: "POST",
    authenticated: true
}
