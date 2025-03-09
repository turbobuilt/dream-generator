// typescript

// Step-by-step Plan
// 1. Import the necessary libraries and functions. Should import "AuthenticatedUser" from "../models".
// 2. Define fetchAuthenticatedUser as an async function that takes in "req" and "res"
// 3. Within the function, use destructuring to extract "id" from req.authenticatedUser.
// 4. Use a "try-catch" block to handle any errors that might happen during the database query
// 5. In the "try" block, use global.db to make a query in the database. The query will be to select name, email, creditsRemaining, id, agreesToTerms from AuthenticatedUser where id = req.authenticatedUser.id
// 6. Extract the result from the query. Since only one user should match the id provided, you should pull out the first result in the returned list of results.
// 7. Return the data as a JSON response, with a 200 status code, using res.status(200).json({...result});
// 8. In the "catch" block log the error and return an error message as a JSON response with a 500 status code using res.status(500).json({"error": "Server Error"});
// 9. At the bottom export the property using exports.route

// Code implementation

import { AuthenticatedUser } from "../models/AuthenticatedUser";

export async function fetchAuthenticatedUser(req: any, res: any): Promise<any> {
    // Extract id from req.authenticatedUser.
    const { id } = req.authenticatedUser;

    try {
        // Run the db query
        const [[result]]: any = await global.db.query(`SELECT id, name, email, creditsRemaining, agreesToTerms, understandsPublishCommitment, autoPublish, userName, plan, trialUsed, isOnTrial, trialDeclined, temporaryChatPopupShown
        FROM AuthenticatedUser WHERE id = ?`, [id]);
        result.trialUsed = !!result.trialUsed;
        result.isOnTrial = !!result.isOnTrial;
        result.trialDeclined = !!result.trialDeclined;
        
        // Return the result as json
        return res.status(200).json(result);
    } catch (error) {
        // Log the error and return error message as json
        console.error(error);
        return res.status(500).json({ "error": "Server Error" });
    }
}

export const route = {
    url: "/api/user",
    method: 'GET',
    authenticated: true,
    handler: fetchAuthenticatedUser
};