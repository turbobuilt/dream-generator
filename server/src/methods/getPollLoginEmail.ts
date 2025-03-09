import { Request, Response } from "express";
import { loginUser } from "../lib/loginUser";

export default async function (req: Request, res: Response) {
    let { insecureToken } = req.query;
    let [[emailLogin]] = await global.db.query(`SELECT * FROM EmailLogin WHERE insecureToken = ?`, [insecureToken]);
    if (!emailLogin) {
        return res.status(400).send({ error: "Invalid email login, please try again. If this is a bug contact support@dreamgenerator.ai" });
    }
    if (emailLogin.verified) {
        let data = await loginUser(emailLogin.authenticatedUser)
        return res.json({ verified: true, data });
    } else {
        return res.json({ verified: false })
    }
}

export const route = {
    authenticated: false
}