import { Request, Response } from "express";
import { sendEmail } from "../lib/sendEmail";

export async function postBlockAuthenticatedUser(req: Request, res: Response) {
    let { authenticatedUserId, reason } = req.body;

    await global.db.query(`INSERT INTO BlockedAuthenticatedUser (blockingAuthenticatedUser, blockedAuthenticatedUser, reason) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE blockedAuthenticatedUser = ?
    `, [req.authenticatedUser.id, authenticatedUserId, reason || '', authenticatedUserId]);

    await global.db.query(`DELETE FROM UserMainFeed WHERE authenticatedUser = ? AND share IN (SELECT id FROM Share WHERE authenticatedUser = ?)`, [req.authenticatedUser.id, authenticatedUserId]);

    return res.json({ success: true });
}

export const route = {
    url: "/api/post-block-authenticated-user",
    method: 'POST',
    authenticated: true
};