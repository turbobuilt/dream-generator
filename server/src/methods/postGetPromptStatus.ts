// typescript

/*
Step-by-step plan:

1. Import necessary modules such as express from 'express' and, router from 'express'.
2. Create a new Express router.
3. Create the async function checkIfPromptLiked that accepts req and res as parameters.
4. Inside the function, using destructuring get authenticatedUser and id from the request body.
5. Use global.db.query method to perform a SQL SELECT query to check if the authenticatedUser liked the given prompt.
6. Await for the result of the query, which will be an array containing an array of existingLike. 
7. Check if existingLike is defined.
8. If it is, send it as json as a response to the client.
9. If it is not, send null as the response to the client.
10. Export the function.
*/

import { Request, Response, Router } from 'express';
const router = Router();

export async function postGetPromptStatus(req: Request, res: Response) {
    let { promptId } = req.body;
    let authenticatedUser = req.authenticatedUser;
    console.log("querying");
    let [[existingLike]] = await global.db.query(`SELECT * FROM PromptLike WHERE prompt = ? AND authenticatedUser = ?`, [promptId, authenticatedUser.id]);
    console.log("existing like is", existingLike)
    let [[prompt]] = await global.db.query(`SELECT * FROM Prompt WHERE id = ?`, [promptId]);

    if(!prompt) {
        return res.json({ isOwnPrompt: true, isLiked: false });
    }

    return res.json({ isOwnPrompt: prompt.authenticatedUser === authenticatedUser.id, isLiked: !!existingLike });
}

// Route information
export const route = {
    url: "/api/prompt/prompt-info",
    method: 'POST',
    authenticated: true,
};