import { Request, Response } from "express";
import { sendEmail } from "../lib/sendEmail";
import { EmailVerification } from "../models/EmailVerification";
import { createRandomGuid } from "../lib/db_old";
import { AuthenticatedUser } from "../models/AuthenticatedUser";
import sendEmailVerificationEmail from "./sendEmailVerificationEmail";

export default async function (req: Request, res: Response) {
    let { email } = req.body;
    if (!email || !email.match(/.+@.+\..+/)) {
        res.status(400).json({ error: "Invalid email" })
        return;
    }
    email = email.trim().toLowerCase();
    // get existing
    let [[authenticatedUser]] = await globalThis.db.query("SELECT * FROM AuthenticatedUser WHERE email = ?", [email]);
    if (authenticatedUser) {
        if (authenticatedUser.provider || authenticatedUser.emailVerified) {
            return res.status(400).json({ error: "Email already in use, please log in." });
        }
    } else {
        authenticatedUser = new AuthenticatedUser();
        authenticatedUser.email = email;
        await authenticatedUser.save();
    }

    let result = await sendEmailVerificationEmail(authenticatedUser);
    if (result.error) {
        return res.status(500).json(result);
    }
    return res.json({ success: true });
}

export const authenticated = false;