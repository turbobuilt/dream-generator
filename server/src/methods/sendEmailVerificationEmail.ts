import { createRandomGuid } from "../lib/db_old";
import { sendEmail } from "../lib/sendEmail";
import { EmailVerification } from "../models/EmailVerification";

export default async function sendEmailVerificationEmail(authenticatedUser) {
    let [emailsInLast10Minutes] = await global.db.query(`SELECT COUNT(*) as count FROM EmailVerification WHERE authenticatedUser=? AND created > ?`, [authenticatedUser.id, new Date(Date.now() - 10 * 60 * 1000)]);
    if (emailsInLast10Minutes[0].count > 0) {
        return { error: "You can only send one email every 10 minutes", code: "too_many_requests" }
    }
    let [emailsInLast24Hours] = await global.db.query(`SELECT COUNT(*) as count FROM EmailVerification WHERE authenticatedUser=? AND created > ?`, [authenticatedUser.id, new Date(Date.now() - 24 * 60 * 60 * 1000)]);
    if (emailsInLast24Hours[0].count > 2) {
        return { error: "You can only send 2 emails per day", code: "too_many_requests" }
    }

    let emailVerification = new EmailVerification();
    emailVerification.authenticatedUser = authenticatedUser.id;
    emailVerification.token = (await Promise.all([createRandomGuid(), createRandomGuid()])).join("");
    await emailVerification.save();

    let url = process.env.NODE_ENV == "production" ? "https://dreamgenerator.ai/app" : "http://localhost:5173";
    url += `/verify-email?token=${emailVerification.token}`;

    try {
        await sendEmail({
            to: authenticatedUser.email,
            from: "info@dreamgenerator.ai",
            subject: "Verify your email",
            htmlFileName: "verifyEmail",
            vars: {
                url
            }
        });
    } catch (e) {
        console.error(e);
        return { error: "Error sending email " + e, code: "email_error" }
    }
    return { success: true }
}