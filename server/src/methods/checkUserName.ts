// typescript

/* 
Step-by-step plan:
 1. import dependencies and necessary objects
 2. define async function 'checkUserName' to check user name availability
 3. destructure 'userName' from req.query
 4. check if 'userName' is empty or null, if it is then return error 400 using res.status().json()
 5. if username is not empty or null, do a raw sql query on 'AuthenticatedUser.userName'
 6. if username exists in the database, return res.json() with 'available':false 
 7. if username does not exist in the database, return res.json() with 'available': true
 8. handle any thrown errors during the process.
 */


import { Request, Response } from 'express';

export async function checkUserName(req: Request, res: Response): Promise<Response> {
    try {
        // destructuring the userName from the request query
        let userName = req.body?.userName || req.query?.userName;

        // checking if username is null or empty
        if (!userName) {
            return res.status(400).json({ error: "User name is empty or null" });
        }

        // raw sql query to be run on AuthenticatedUser table
        const query = 'SELECT userName FROM AuthenticatedUser WHERE userName = ?'; 

        // executing the query
        const [results] = await global.db.query(query, [userName]);

        // checking if user name exists in the database
        if (results.length > 0) {
            return res.json({ available: false });
        } else {
            return res.json({ available: true });
        }
    } catch (error) {
        return res.status(500).json({error: "An error occured while processing your request"});
    }
}

export const route = { url: "/api/check-user-name", method: "GET", authenticated: false }