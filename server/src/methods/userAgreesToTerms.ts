// typescript

/*
Step 1: Check if the req obj has authenticatedUser property and it also has agreesToTerms value set to true.
Step 2: If already set, stop execution and return 400 status with error message as JSON object.
Step 3: If not set, run an SQL query using global.db to increment the creditsRemaining by 24 and set agreesToTerms to 1 where id matches req.authenticatedUser.id.
            Here, make sure to handle null for creditsRemaining.
Step 4: Run another SQL query to get the updated creditsRemaining for the user.
Step 5: Return the updated creditsRemaining as JSON object to the user. 
*/

import express from "express";
import { createConnection } from "mysql2/promise";
import { CreditLog } from "../models/CreditLog";

export async function userAgreesToTerms(req: express.Request, res: express.Response) {
	let { authenticatedUser } = req;
    let { isandroid, isios } = req.headers as any;
	if (!authenticatedUser) {
		return res.status(400).json({ error: "User not authenticated" });
	}

	let { agreesToTerms } = authenticatedUser;
	if (agreesToTerms) {
		return res.status(400).json({ alreadyAgrees: true, creditsRemaining: authenticatedUser.creditsRemaining });
	}

	let userId = authenticatedUser.id;
    let freeCredits = 5; // isios == "true" ? 6 : 4;
    if (isandroid == "true") {
        freeCredits = 5;
    }
    // let [[info]] = await global.db.query(`SELECT verified FROM AuthenticatedUser WHERE id = ?`, [userId]);
    // if(!info.verified) {
    //     freeCredits = 5;
    // }
    let creditLog = new CreditLog({ authenticatedUser: userId, credits: freeCredits });
    await creditLog.save();
	let sqlUpdate = `UPDATE AuthenticatedUser SET creditsRemaining = COALESCE(creditsRemaining, 0) + ?, agreesToTerms = 1 WHERE id = ?`;
	await global.db.query(sqlUpdate, [freeCredits, userId]);

	let sqlSelect = `SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`;
	let [results] = await global.db.query(sqlSelect, [userId]);
	let creditsRemaining = results[0]['creditsRemaining'];

	return res.json({ creditsRemaining });
};

export const route = { url: "/api/user-agrees", method: "GET", authenticated: true };