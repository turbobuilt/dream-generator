import { Request, Response } from "express";
import { loginUser } from "../lib/loginUser";

export default async function (req: Request, res: Response) {
    let { token } = req.body;
    if (!token) {
        return res.status(400).send({ error: "No token provided" });
    }
    let [[emailLogin]] = await global.db.query(`SELECT * FROM EmailLogin WHERE token = ?`, [token]);
    if (!emailLogin) {
        return res.status(400).send({ error: "Invalid token" });
    }
    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [emailLogin.authenticatedUser]);
    if (!authenticatedUser) {
        return res.status(400).send({ error: "User not found" });
    }
    // set verified to 1 on EmailLogin
    await global.db.query(`UPDATE EmailLogin SET verified=1 WHERE token=?`, [token]);
    // generate a new token
    return res.json(await loginUser(authenticatedUser.id));
}

export const route = {
    authenticated: false
}