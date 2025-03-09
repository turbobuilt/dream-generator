import { Request, Response } from "express";

export async function downgradePlan(req: Request, res: Response, id) {
    // if the selected plan is same as current plan, return
    if (req.authenticatedUser.plan == id) {
        return res.status(400).json({ error: "You are already on this plan. If this is a mistake, please contact support (support@dreamgenerator.ai), and we will fix it" });
    }
    await db.query(`UPDATE AuthenticatedUser SET downgradePlanTo = ? WHERE id = ?`, [id, req.authenticatedUser.id]);
    return res.json({ success: true });
}