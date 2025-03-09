// typescript

// The overall flow of the function is as follows:
// 1. Destructure the contacts from the req.body.
// 2. Create a constant named authenticatedUser from req.
// 3. Iterate over the contacts and insert each one into the ShareContacts table.
// 4. Use Promise.all to send emails to all the contacts asynchronously.
// 5. As soon as an email is sent, update the corresponding entry in the ShareContacts table setting invited: true.

// Here is the implementation:

import { ShareContact } from "../models/ShareContact";
import * as nodemailer from "nodemailer";
import { Request, Response } from "express";
import { readFile } from "node:fs/promises";

export async function sendShareEmail(req: Request, res: Response) {
    let { contacts } = req.body; // { firstName, lastName, email }
    const authenticatedUser = req.authenticatedUser;
    console.log("contacts", contacts);

    // [Contact(id=F57C8277-585D-4327-88A6-B5689FF69DFE, displayName=Anna Haro, thumbnail=null, photo=null, isStarred=false, name=Name(first=Anna, last=Haro, middle=, prefix=, suffix=, nickname=Annie, firstPhonetic=, lastPhonetic=, middlePhonetic=), phones=[Phone(number=555-522-8243, normalizedNumber=, label=PhoneLabel.home, customLabel=, isPrimary=false)], emails=[Email(address=anna-haro@mac.com, label=EmailLabel.home, customLabel=, isPrimary=false)], addresses=[Address(address=1001 Leavenworth Street Sausalito CA 94965

    // USA, label=AddressLabel.home, customLabel=, street=1001 Leavenworth Street, pobox=, neighborhood=, city=Sausalito, state=CA, postalCode=94965, country=USA, isoCountry=us, subAdminArea=, subLocality=)], organizations=[], websites=[], socialMedias=[], events=[Event(year=1985, month=8, day=29, label=EventLabel.birthday, customLabel=), Event(year=2002, month=2, day=15, label=EventLabel.anniversary, customLabel=)], notes=[], accounts=[], groups=[]), Contact(id=AB211C5F-9EC9-429F<…>

    // count how many they have already sent today. if more than 10, return error
    let [[count]] = await global.db.query(`SELECT COUNT(*) as count FROM ShareContact WHERE authenticatedUser = ? AND created > ?`, [authenticatedUser.id, Date.now() - 86400000]);
    // if (count.count >= 10) {
    //     return res.status(400).send({ error: "You can only send 10 invites per day" });
    // }
    // if (contacts.length > 10) {
    //     return res.status(400).send({ error: "You can only send 10 invites at a time" });
    // }

    const emailPromises = contacts.map(async (contact) => {
        let displayName = contact.displayName;
        let firstName = contact.name.first;
        let lastName = contact.name.last;
        let email = contact.emails[0].address;

        // Insert contact into ShareContacts table
        let [[existing]] = await global.db.query(`SELECT * FROM ShareContact WHERE email = ?`, [email]);
        if (existing) {
            return;
        }
        const shareContact = new ShareContact({ firstName, lastName, email, authenticatedUser: req.authenticatedUser.id });
        await shareContact.insert();
        return shareContact;

        // // Send invitation email // email-smtp.us-west-2.amazonaws.com 
        //arn:aws:ses:us-west-2:102057772970:identity/dreamgenerator.ai
        const transporter = nodemailer.createTransport({
            service: 'smtp',
            host: "email-smtp.us-west-1.amazonaws.com",
            auth: {
                user: processBody.env.sesUser, 
                pass: processBody.env.sesPassword
            }
        });

        const mailOptions = {
            from: "sharing@dreamgenerator.ai",
            to: email,
            subject: 'Invitation to try DreamGenerator.ai',
            html: `
            <style>* { font-family: sans-serif; }</style>
            <div style="padding: 8px">
                Hello ${displayName}!
                <br>
                ${authenticatedUser.name} has invited you to try out DreamGenerator.ai.  Make amazing background or cool images ASAP!  
                <br>
                It's free to get started, and you can browse, comment and share all you want. Credits to make images are cheap, and you don't even have to buy them.  
                <br>
                In the meantime, please try out the app, you will be astounded at how fun it is to talk with your friends and family about the app!
                <br>
                <br>
                Sincerely,
                <br>
                Hans Truelson
                <br>
                <div style="text-align: center;">
                    <a href="https://play.google.com/store/apps/details?id=ai.dreamgenerator.app" style="display: inline-block">
                        <img src="https://dreamgenerator.ai/assets/download-app-store.png" alt="Download iOS App" style="width: 400px;"/>
                    </a>
                    <br>
                    <a href="https://play.google.com/store/apps/details?id=ai.dreamgenerator.app" style="display: inline-block">
                        <img src="https://dreamgenerator.ai/assets/google-play-badge-cropped.png" alt="Download Google Play App"  style="width: 400px;"/>
                    </a>
                </div>
                <br>
                <br>
                <div style="text-align: center;">
                    <a style="color: black; font-size: 14px" href="{{amazonSESUnsubscribeUrl}}">Don't send me any more messages!</a>
                </div>
                <br>
                <div style="text-align:center;">Thank you for using this app, it was made in heaven by your friend Yeshua.</div>
            </div>
            `
        };
        console.log("Sent email", email);
        console.log(mailOptions);

        const sendmail = require('sendmail')({
            logger: {
                debug: console.log,
                info: console.info,
                warn: console.warn,
                error: console.error
            },
            silent: false,
            dkim: { // Default: False
                privateKey: await readFile("dkim_private.key", "utf8"),
                keySelector: 'sendmail'
            },
            // devPort: 1025, // Default: False
            // devHost: 'localhost', // Default: localhost
            smtpPort: 25, // Default: 25
            // smtpHost: "localhost" // 'email-smtp.us-west-2.amazonaws.com' // Default: -1 - extra smtp host after resolveMX
        });

        let result = await new Promise((resolve, reject) => {
            sendmail({
                from: 'sharing@dreamgenerator.ai',
                to: email,
                subject: mailOptions.subject,
                html: mailOptions.html
            }, function (err, reply) {
                console.log(err, reply);
                if (err) {
                    console.error(err && err.stack);
                    reject(err);
                }
                resolve(reply);
            });
        });

        console.log("result is", result);

        // let result = await transporter.sendMail(mailOptions);
        // console.log("RESULT IS", result);
        // Updating the contact as invited
        shareContact.sent = true;
        await shareContact.update(authenticatedUser.id);
    });

    // Asynchronously send all emails
    try {
        let results = (await Promise.all(emailPromises)).filter(item => item);
        console.log("results", results);
        // update credits
        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = creditsRemaining + ? WHERE id = ?`, [results.length, authenticatedUser.id]);
        let [[updated]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`, [authenticatedUser.id]) as any[];
        return res.status(200).send({ creditsRemaining: updated.creditsRemaining });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err.message });
    }
}

export const route = {
    url: "/api/send-share-email",
    method: 'POST',
    authenticated: true,
};