import { Request, Response } from "express";
import moment from "moment";
import { EmailLogin } from "../models/EmailLogin";
import { createRandomGuid } from "../lib/db_old";
import { sendEmail } from "../lib/sendEmail";

export default async function (req: Request, res: Response) {
    let { email } = req.query;
    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE email=?`, [email]);
    if (!authenticatedUser) {
        return res.status(404).send({ error: "No user with that email", code: "not_found" });
    }

    // make sure they haven't sent more than 1 email in the last 60 secodns
    let [[count]] = await global.db.query(`SELECT COUNT(*) as count FROM EmailLogin WHERE email=? AND created > ?`, [email, moment().subtract(60, 'seconds').toDate().getTime()]);
    if (count.count > 0) {
        return res.status(429).send({ error: "You can only do one login email per minute", code: "too_many_requests" });
    }
    // ensure only 2 every 5 minutes
    [[count]] = await global.db.query(`SELECT COUNT(*) as count FROM EmailLogin WHERE email=? AND created > ?`, [email, moment().subtract(5, 'minutes').toDate().getTime()]);
    if (count.count > 1) {
        return res.status(429).send({ error: "You can only send 2 login emails per 5 minutes", code: "too_many_requests" });
    }
    // only 4 every 24 hours
    [[count]] = await global.db.query(`SELECT COUNT(*) as count FROM EmailLogin WHERE email=? AND created > ?`, [email, moment().subtract(24, 'hours').toDate().getTime()]);
    if (count.count > 10) {
        return res.status(429).send({ error: "You can only send 10 login emails per day", code: "too_many_requests" });
    }

    let emailLogin = new EmailLogin();
    emailLogin.authenticatedUser = authenticatedUser.id;
    emailLogin.token = (await Promise.all([createRandomGuid(), createRandomGuid()])).join("");
    emailLogin.insecureToken = (await Promise.all([createRandomGuid(), createRandomGuid()])).join("");
    await emailLogin.save();

    let url = process.env.NODE_ENV == "production" ? "https://dreamgenerator.ai/app" : "http://localhost:5173";
    url += `/login?token=${emailLogin.token}`;

    try {
        await sendEmail({
            to: authenticatedUser.email,
            from: "info@dreamgenerator.ai",
            subject: "Login Link",
            htmlFileName: "emailLogin",
            vars: {
                url
            }
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error sending email", code: "email_error" });
    }
    return res.json({ success: true, insecureToken: emailLogin.insecureToken });
}

export const route = {
    authenticated: false
}