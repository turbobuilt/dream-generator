import { Request, Response } from "express";

export default async function (req: Request, res: Response) {
    let { token } = req.query;
    if (!token) {
        return res.status(400).send({ error: "No token provided" });
    }
    let [[emailVerification]] = await global.db.query(`SELECT * FROM EmailVerification WHERE token = ?`, [token]);
    if (!emailVerification) {
        return res.status(400).send({ error: "Invalid token" });
    }
    await global.db.query(`UPDATE AuthenticatedUser SET emailVerified=1 WHERE id=?`, [emailVerification.authenticatedUser]);
    // set verified on EmailVerification
    await global.db.query(`UPDATE EmailVerification SET verified=1 WHERE token=?`, [token]);
}

export const route = {
    authenticated: false
}