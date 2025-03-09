// typescript

/* Implementation plan:
1. Import necessary dependencies and methods.
2. Define the post route function `getPrompt`, taking request and response as parameters.
3. Destructure the id from the req.params object.
4. Use global.db.query() to run an SQL query that selects all fields from the Prompt table where the ID matches the provided ID.
5. Retrieve the results from the database and select the first one.
6. Respond with a status of 200 and the prompt data in JSON format.
7. Add error handling for cases where the database can't be accessed or the prompt with the desired ID doesn't exist.
*/

import { Request, Response } from "express";

export async function getPrompt(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;

    // Run the SQL query
    let [results] = await global.db.query('SELECT Prompt.* FROM Prompt WHERE id=?', [id]);

    // Check to make sure there is a prompt with the provided ID
    if (!results.length) {
        return res.status(404).json({"error" : "No prompt found with provided id"});
    }
    
    // Fetch the first result
    let prompt = results[0];

    // Return the prompt in the response
    return res.status(200).json(prompt);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ 'error': 'An error occurred while fetching the prompt' });
  }
}

export const route = {
    url: "/api/prompt/:id",
    method: 'GET',
    authenticated: true,
    handler: getPrompt
};