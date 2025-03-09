import { Request, Response } from "express";
import { loginUser } from "../lib/loginUser";
const argon2 = require('argon2');

export default async function (req: Request, res: Response) {
    let { token, password } = req.body;
    if (!token) {
        return res.status(400).send({ error: "No token provided" });
    }
    let [[emailVerification]] = await global.db.query(`SELECT * FROM EmailVerification WHERE token = ?`, [token]);
    if (!emailVerification) {
        return res.status(400).send({ error: "Invalid token" });
    }
    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [emailVerification.authenticatedUser]);
    if (!authenticatedUser) {
        return res.status(400).send({ error: "User not found" });
    }
    if (authenticatedUser.emailVerified) {
        return res.status(400).send({ error: "Email already verified" });
    }
    await global.db.query(`UPDATE AuthenticatedUser SET emailVerified=1 WHERE id=?`, [emailVerification.authenticatedUser]);

    // add 6 credits
    await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining=creditsRemaining+6 WHERE id=?`, [emailVerification.authenticatedUser]);

    if (password) {
        try {
            const hash = await argon2.hash(password);
            await global.db.query(`UPDATE AuthenticatedUser SET passwordHash=? WHERE id=?`, [hash, emailVerification.authenticatedUser]);
        } catch (err) {
            console.error("error hashing password", err);
        }
    }

    return res.json(await loginUser(authenticatedUser.id));
    // delete the email login
    // await global.db.query(`DELETE FROM EmailVerification WHERE id=?`, [emailVerification.id]);
    // generate a new token
    // return res.json(await loginUser(authenticatedUser.id));
}

export const route = {
    authenticated: false
}