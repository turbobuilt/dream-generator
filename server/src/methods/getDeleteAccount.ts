// typescript

/*
1. We first import the necessary packages and modules that would be needed to accomplish this task.
2. Next, we define the `deleteAccount` function. 
3. Within the function, we initiate a MySQL transaction using global.db.beginTransaction. 
4. Then, we execute the `delete` operation on `ImageGenerationRequest`, `AuthenticatedUser` and `AuthToken` tables separately, passing `req.authenticatedUser.id` as a parameter.
5. If everything executes without any exceptions being thrown, we commit the transaction and send {success: true} to the client.
6. In case of any error, we roll back the transaction.
7. Finally, we close the MySQL connection.
8. At the end, we export the route details.
*/

import { Request, Response } from "express";

export async function getDeleteAccount(req: Request, res: Response): Promise<void> {
    // Start transaction
    let connection;
    try {
        connection = await global.db.getConnection();
        await connection.beginTransaction();
        // Execute DELETE query on ImageGenerationRequest, AuthenticatedUser and AuthToken
        await connection.query("UPDATE Prompt SET authenticatedUser = NULL WHERE authenticatedUser = ?", [req.authenticatedUser.id]);
        await connection.query("DELETE FROM ShareLike WHERE authenticatedUser = ?", [req.authenticatedUser.id]);
        // AutomailerSubscription
        await connection.query("DELETE FROM AutomailerSubscription WHERE authenticatedUser = ?", [req.authenticatedUser.id]);
        await connection.query('DELETE FROM ImageGenerationRequest WHERE authenticatedUser = ?', [req.authenticatedUser.id]);
        await connection.query('DELETE FROM AuthToken WHERE authenticatedUser = ?', [req.authenticatedUser.id]);
        await connection.query("UPDATE Payment SET authenticatedUser = NULL WHERE authenticatedUser = ?", [req.authenticatedUser.id]);
        await connection.query('DELETE FROM AuthenticatedUser WHERE id = ?', [req.authenticatedUser.id]);

        // Commit transaction
        await connection.commit();

        // Send success response
        res.status(200).json({ success: true });
    } catch (error) {
        // If error occurs, roll back the transaction
        if (connection) {
            await connection.rollback();
        }
        console.error(error.message)
        res.status(500).json({ success: false, error: 'An error occurred while trying to delete this account: ' + error.message });
    } finally {
        // Close connection
        if (connection) {
            await connection.release();
        }
    }
}

export const route = { url: '/api/delete-account', method: "GET", authenticated: true };