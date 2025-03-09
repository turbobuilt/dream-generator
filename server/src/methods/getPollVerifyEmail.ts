import { Request, Response } from "express";

export default async  function(req: Request, res: Response) {
    let [[authenticatedUser]] = await global.db.query(`SELECT emailVerified FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id])
    if (authenticatedUser.emailVerified) {
        return res.json({ verified: true })
    } else {
        return res.json({ verified: false })
    }
}