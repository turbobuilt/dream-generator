// typescript

/* Step-by-step plan:
1. Import axios and mysql2 from required libraries
2. Create a function "getPromptCategories" taking parameters 'req' and 'res'
3. Inside the function, write an asynchronous block to handle any database errors.
4. In the asynchronous block, define a variable to hold SQL query to get all PromptCategory records from the database.
5. Run the raw SQL query using global.db object.
6. Parse the response into a JSON object.
7. Send the JSON response back to the client using the Response object.
8. After the function declaration, define and export the 'route' object with appropriate properties.
*/

import { Request, Response } from "express";
import axios from "axios";

export async function getPromptCategories(req: Request, res: Response): Promise<void> {
    try {
        // Define the SQL query.
        const SQL: string = `SELECT PromptCategory.*
        FROM PromptCategory
        LEFT JOIN Prompt ON Prompt.promptCategory = PromptCategory.id
        LEFT JOIN PromptLike ON PromptLike.prompt = Prompt.id
        GROUP BY PromptCategory.id
        ORDER BY COUNT(PromptLike.id) DESC
        `;

        // Apply the SQL query.
        let [results] = await global.db.query(SQL);


        // Parse the response into a JSON object.
        let response = {
            items: results
        };

        // Send the parsed response.
        res.json(response);
    }
    catch (error) {
        res.status(500).send(error);
    }
}

export const route = {
    url: "/api/prompt-categories",
    method: 'GET',
    authenticated: true,
    handler: getPromptCategories
};
