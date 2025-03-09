// typescript

/**
 * Steps of the getUserPrompts function
 * 1. Destructure and retrieve authenticatedUser id from request.
 * 2. Construct SQL query to select data from Prompt and PromptCategory where user matches authenticatedUser.
 * 3. Run query using global.db object.
 * 4. Return the result list as an object { items: [result]}.
 */

import { Request, Response } from "express";

export async function getPromptsForUser(req: Request, res: Response): Promise<void> {
    // retrieve authenticated user id from request body
    let { authenticatedUser } = req.body;

    // sql query
    const sql = `SELECT Prompt.*, PromptCategory.name AS promptCategoryName FROM Prompt
                 JOIN PromptCategory ON Prompt.promptCategory = PromptCategory.id
                 WHERE Prompt.authenticatedUser = ?`;

    // fetch and return data
    try {
        let [results] = await global.db.query(sql, [authenticatedUser]);
        res.json({ items: results });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
}

export const route = {
    url: "/api/user-prompt",
    method: 'GET',
    authenticated: true,
};
