import { DbObject } from "../lib/db";
import moment from "moment";
import { CronJob } from 'cron';
import { AutomailerEmailQueue } from "./AutomailerEmailQueue";
import { AutomailerEmail } from "./AutomailerEmail";
import { AuthenticatedUser } from "./AuthenticatedUser";
import { sendEmail } from "../lib/sendEmail";

export class AutomailerSubscription extends DbObject {
    automailer: number;
    authenticatedUser: number;
}
export const startTrialAutomailerCron = new CronJob(
    '0 */30 * * * *', startTrialAutomailer, null, false, 'Asia/Singapore' // timeZone
);
async function startTrialAutomailer() {
    try {
        // get all users who have signed up in last hour and are not on a signup automailer
        let lastHour = moment().subtract(1, 'hour').toDate().getTime();
        let [users] = await db.query(`SELECT * 
            FROM AuthenticatedUser
            WHERE AuthenticatedUser.created > ${lastHour} 
                AND AuthenticatedUser.unsubscribed <> 1
                AND (SELECT COUNT(*) FROM Automailer WHERE startTrigger = 'onStartTrial') > 0
                AND id NOT IN (SELECT authenticatedUser FROM AutomailerSubscription WHERE created > ${lastHour})
    `);
        let [automailers] = await db.query(`SELECT * FROM Automailer WHERE startTrigger = 'onStartTrial'`);
        for (let user of users) {
            for (let automailer of automailers) {
                let subscription = new AutomailerSubscription();
                subscription.automailer = automailer.id;
                subscription.authenticatedUser = user.id;
                await subscription.save();
            }
        }
    } catch (e) {
        console.error("Error with signup", e);
    }
}

export const queueAutomatedEmailsCron = new CronJob(
    '0 */15 * * * *', queueAutomailerEmails, null, false, 'Asia/Singapore' // timeZone
);
async function queueAutomailerEmails() {
    try {
        let [emailsToSend] = await db.query(`SELECT AutomailerEmail.id, AutomailerSubscription.authenticatedUser
        FROM AutomailerSubscription
        JOIN AutomailerEmail on AutomailerSubscription.automailer = AutomailerEmail.automailer
        LEFT JOIN AutomailerEmailQueue on AutomailerEmailQueue.automailerEmail = AutomailerEmail.id
        WHERE AutomailerEmailQueue.id IS NULL
        AND AutomailerEmail.sendAt IS NOT NULL
        AND AutomailerEmail.sendAt + AutomailerSubscription.created < UNIX_TIMESTAMP() * 1000
        `);

        if (emailsToSend.length === 0) {
            return;
        }
        let query = `INSERT INTO AutomailerEmailQueue (created, automailerEmail, authenticatedUser) VALUES `;
        for (let email of emailsToSend) {
            query += `(${moment().toDate().getTime()}, ${email.id}, ${email.authenticatedUser}),`;
        }
        query = query.slice(0, -1);
        await db.query(query);
    } catch (e) {
        console.error("Error with queueAutomailerEmails", e);

    }
}


export const sendQueuedEmailsCron = new CronJob(
    '0 * * * * *', sendQueuedEmails, null, false, 'Asia/Singapore' // timeZone
);
async function sendQueuedEmails() {
    try {
        let [queuedEmails] = await db.query(`SELECT AutomailerEmailQueue.id as queueItemId, AutomailerEmail.subject, AutomailerEmail.html, AuthenticatedUser.email, AuthenticatedUser.name
        FROM AutomailerEmailQueue
        JOIN AutomailerEmail on AutomailerEmailQueue.automailerEmail = AutomailerEmail.id
        JOIN AuthenticatedUser on AutomailerEmailQueue.authenticatedUser = AuthenticatedUser.id
        WHERE AutomailerEmailQueue.sendStarted = 0
        `);
        if (queuedEmails.length === 0) {
            return;
        }
        await db.query(`UPDATE AutomailerEmailQueue SET sendStarted = 1 WHERE id IN (${queuedEmails.map(q => q.queueItemId).join(",")})`);
        for (let emailInfo of queuedEmails) {
            console.log("email", emailInfo);
            // send email
            let emailToSend = {
                to: emailInfo.email,
                from: "Dream Generator AI<connection@dreamgenerator.ai>",
                subject: emailInfo.subject,
                html: emailInfo.html,
                vars: {
                    name: emailInfo.name
                }
            };
            try {
                await sendEmail(emailToSend);
                await db.query(`UPDATE AutomailerEmailQueue SET sent = 1 WHERE id = ${emailInfo.queueItemId}`);
            } catch (e) {
                console.error("Error sending email", e);
                db.query(`UPDATE AutomailerEmailQueue SET error = ? WHERE id = ${emailInfo.queueItemId}`, [e.message]).catch(e => console.error("Error setting error email queue. error:", e));
            }
        }
    } catch (err) {
        console.error("Error with sendQueuedEmails", err);
    } finally {

    }
}