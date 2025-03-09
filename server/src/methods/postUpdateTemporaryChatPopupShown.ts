import { Request, Response } from "express";

export async function postUpdateTemporaryChatPopupShown(req: Request, res: Response) {
    await db.query(`UPDATE AuthenticatedUser SET temporaryChatPopupShown = 1 WHERE id = ${req.authenticatedUser.id}`);
    res.json({ success: true });
}