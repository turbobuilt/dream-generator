// typescript

/**
 * Implementing the unlikePrompt function
 * 
 * Step 1: Retrieve the promptId from the request body
 * Step 2: Use raw query language to delete entry in Like where the promptId matches and the authenticated user is the
 *         requester
 * Step 3: Send back response to user
 */

// Import needed modules
import { Request, Response } from 'express';

// The main function
export async function unlikePrompt(req: Request, res: Response): Promise<void> {
    // Step 1: Retrieve the promptId
    let { promptId } = req.body;

    // Step 2: Delete the like entry
    let query = "DELETE FROM PromptLike WHERE prompt=? AND authenticatedUser=?";
    let placeholders = [promptId, req.authenticatedUser.id];
    await global.db.query(query, placeholders);

    // Step 3: Send back response to user
    res.json({success: true});
}

// Defining the endpoint details
export const route = {
    url: "/api/prompt/unlike",
    method: 'POST',
    authenticated: true,
};
