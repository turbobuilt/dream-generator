import { Request, Response } from "express";

export async function postSetCallKitPushToken(req: Request, res: Response) {
    const { pushToken } = req.body;

    if (!pushToken) {
        return res.status(400).json({ error: "Missing pushToken" });
    }
    await db.query(`UPDATE AuthenticatedUser SET callKitPushToken = ? WHERE id = ?`, [pushToken, req.authenticatedUser.id]);

    return res.status(200).json({ success: true });
}