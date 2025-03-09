// typescript

// Plan
// 1. Import necessary modules and types
// 2. Define the asynchronous function authenticateUser with request and response parameters from express module
// 3. Extract the "authorizationtoken" from the request header
// 4. If "authorizationtoken" isn't available, send an error response
// 5. If "authorizationtoken" is set, perform a raw sql query to fetch the authenticated user data from the database
// 6. If the sql query result is empty, send an error response that the provided token doesn't match any user in the database
// 7. If the sql query is successful and resulted in the user data, attach the user data to the request and continue the next middleware

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from '../models/AuthenticatedUser';


export async function authenticateUserInternal(req: Request, res: Response): Promise<{ success: boolean, error?: string }> {
    if (req.authenticatedUser) {
        return { success: true }
    }
    let { authorizationtoken } = req.headers;

    if (!authorizationtoken) {
        console.log("no auth token", req.url)
        return {
            success: false,
            error: "No auth token set. If this is an error, please contact support and will fix ASAP! " +
                "Thank you for your help. Please go to dreamgenerator.ai to find contact info. Thank you!"
        }
    }

    const sqlQuery = "select AuthenticatedUser.* from AuthenticatedUser join AuthToken on AuthToken.authenticatedUser = AuthenticatedUser.id where AuthToken.token = ?";
    let [[results]] = await global.db.query(sqlQuery, [authorizationtoken]);

    if (!results) {
        console.log("auth token", authorizationtoken)
        return {
            success: false,
            error: "The provided token isn't found in our database. You may have logged out from another device or session. If this error persists even after logging back in, please contact support@dreamgenerator.ai"
        }
    }

    // Set authenticated user in the request
    req.authenticatedUser = new AuthenticatedUser(results);
    return { success: true };
}


export async function authenticateUser(req: Request, res: Response, next?: NextFunction): Promise<void> {
    let { success, error } = await authenticateUserInternal(req, res);
    if (!success) {
        res.status(401).json({ error });
        return;
    }
    next && next();
    // if (req.authenticatedUser) {
    //     next && next();
    //     return;
    // }
    // let { authorizationtoken } = req.headers;

    // if (!authorizationtoken) {
    //     console.log("no auth token", req.url)
    //     if (next) {
    //         res.status(401).json({
    //             error:
    //                 "No auth token set. If this is an error, please contact support and will fix ASAP! " +
    //                 "Thank you for your help. Please go to dreamgenerator.ai to find contact info. Thank you!"
    //         });
    //     }
    //     return;
    // }

    // const sqlQuery = "select AuthenticatedUser.* from AuthenticatedUser join AuthToken on AuthToken.authenticatedUser = AuthenticatedUser.id where AuthToken.token = ?";
    // let [[results]] = await global.db.query(sqlQuery, [authorizationtoken]);

    // if (!results) {
    //     console.log("auth token", authorizationtoken)
    //     res.json({
    //         error: "The provided token isn't found in our database. You may have logged out from another device or session. If this error persists even after logging back in, please contact support@dreamgenerator.ai"
    //     });
    //     return;
    // }

    // // Set authenticated user in the request
    // req.authenticatedUser = new AuthenticatedUser(results);
    // if (next)
    //     next();
}


export async function tryAuthenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    let { authorizationtoken } = req.headers;

    if (!authorizationtoken) {
        next();
        return;
    }

    const sqlQuery = "select AuthenticatedUser.* from AuthenticatedUser join AuthToken on AuthToken.authenticatedUser = AuthenticatedUser.id where AuthToken.token = ?";
    let [[results]] = await global.db.query(sqlQuery, [authorizationtoken]);

    if (!results) {
        next();
        return;
    }

    // Set authenticated user in the request
    req.authenticatedUser = new AuthenticatedUser(results);
    next();
}