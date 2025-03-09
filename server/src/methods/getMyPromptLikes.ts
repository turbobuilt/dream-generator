// typescript

// Plan:
// 1. Import necessary modules and types
// 2. Declare and export the function 'getMyPromptLikes'
// 3. Perform input validation and error handling for the input from the request body
// 4. Format the SQL query string with proper ORDER BY and LIMIT clause based on user input
// 5. Execute the query and handle any database errors that will occur during the execution
// 6. Return the result of the executed SQL query as JSON

import { Request, Response } from 'express';

export async function getMyPromptLikes(req: Request, res: Response) {
    // Extract properties from request body
    let { page, perPage, orderBy, sortDirection } = req.query as any;

    // Perform input validation
    page = parseInt(page) || 1
    perPage = parseInt(perPage) || 20;
    sortDirection = parseInt(sortDirection);
    if (perPage > 50) perPage = 50;
    const validSortDirections = [1, -1];
    const validOrderByFields = ['created', 'likesCount'];

    if (!validSortDirections.includes(sortDirection)) {
        return res.status(400).json({ error: 'invalid sort direction contact support@dreamgenerator.ai if mistake' });
    }
    if (!validOrderByFields.includes(orderBy)) {
        return res.status(400).json({ error: 'invalid orderBy contact support@dreamgenerator.ai if mistake' });
    }
    if(orderBy == "created")
        orderBy = "Share.created";

    const sortDirectionSymbol = sortDirection == 1 ? 'ASC' : 'DESC';

    // Format the SQL query string
    const sqlQuery = `SELECT COALESCE(Prompt.text,'') as text, COALESCE(Prompt.title,'') as title, COUNT(ShareLike.id) as likesCount 
    FROM Share
    LEFT JOIN Prompt ON (Prompt.id = Share.prompt) 
    LEFT JOIN ShareLike ON (Share.id = ShareLike.share) 
    WHERE Share.authenticatedUser = ? AND Share.parent IS NULL
    GROUP BY Share.id
    ORDER BY ${orderBy} ${sortDirectionSymbol} LIMIT ${(page - 1)*perPage}, ${perPage}`;
    console.log('bob')
    try {
        // Execute the query
        const [promptLikes] = await global.db?.query(sqlQuery, [req.authenticatedUser.id]);
        console.log(promptLikes)
        return res.json({ items: promptLikes });
    } catch (err) {
        console.error(err);
        // Handle possible errors during SQL query execution
        return res.status(500).json({ error: err.message });
    }
}

export const route = {
    url: "/api/my-prompt-likes",
    method: 'GET',
    authenticated: true,
};
