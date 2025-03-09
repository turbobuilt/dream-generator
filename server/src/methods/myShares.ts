// typescript

/* 

Step-by-step plan of how the function is implemented:

1. Import the necessary modules.
2. Create an async function named "myShares" which takes req and res as parameters.
3. Extract id from req.authenticatedUser.
4. Use global.db.query to execute the required SQL query by passing the SQL command and the parameters array.
5. Execute the query and store the results.
6. Extract "items" from the results.
7. Respond to the client with the extracted items.

*/

import express from 'express';

export async function myShares(req: express.Request, res: express.Response, data?: { page: number, perPage: number }): Promise<void> {
    let { page, perPage } = data && typeof data !== 'function' ? data : req.query as any;
    let { id } = req.authenticatedUser;

    perPage = parseInt(perPage) || 10;
    if (perPage > 100)
        perPage = 100;

    page = parseInt(page) || 1;

    // Execute the query to get Shares
    let query = `SELECT Share.*, SharedImage.path 
                 FROM Share 
                 LEFT JOIN SharedImage ON SharedImage.id = Share.sharedImage 
                 WHERE Share.authenticatedUser = ? AND Share.parent IS NULL 
                 ORDER BY Share.created DESC
                LIMIT ? OFFSET ?`;
    
    let [results] = await global.db.query(query, [id, perPage, (page - 1) * perPage]);

    // Send the retrieved Shares to the client
    res.send({ items: results });
}

// Information for Express router
export const route = {
    url: "/api/my-shares",
    method: "GET",
    authenticated: true
};