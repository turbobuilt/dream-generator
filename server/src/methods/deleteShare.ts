// typescript

/*  
    Implementation plan:

    1. Destructure id from req.params. 
    2. Use global.db to query the database, where we want to select items from Share where id=? and authenticatedUser=?.
    3. Run an if condition to check if an item with the provided ID exists. If it does not, we send back an error message.
    4. If the item does exist, we use the delete() function from the DbObject to remove it.
    5. After the delete is successful, we return an object with success: true. 
    6. Finally, export the route details.
*/

import { Request, Response } from "express";
import { s3Client } from "./publishPrompt";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function serverDeleteShare(share) {
    if (share.sharedImage) {
        let [[sharedImage]] = await db.query(`SELECT * FROM SharedImage WHERE id=?`, [share.sharedImage]);
        await s3Client.send(new DeleteObjectCommand({
            Bucket: "dreamgeneratorshared",
            Key: sharedImage.path
        }));
        await db.query(`DELETE FROM SharedImage where id=?`, [share.sharedImage]);
    }
    if (share.promptId)
        await db.query(`DELETE FROM Prompt where id=?`, [share.promptId]);
    await db.query(`DELETE FROM Share where id=?`, [share.id]);
}

export async function deleteShare(req: Request, res: Response, data?: { id: number }) {

    let { id } = data || req.params;

    let [[share]] = await global.db.query(`SELECT * FROM Share WHERE id=? AND authenticatedUser=?`, [id, req.authenticatedUser.id]);
    if (!share) {
        return res.status(400).json({ error: "This doesn't exist or you don't own it. If this is a mistake, contact support@dreamgenerator.ai" });
    }

    // If the item does exist, delete it
    await serverDeleteShare(share);

    // Sending back a success response
    return res.json({ success: true });
}

export const route = { url: "/api/share/:id", method: "DELETE", authenticated: true }