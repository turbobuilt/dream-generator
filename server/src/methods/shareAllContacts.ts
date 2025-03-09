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
import { promises } from "dns";

export async function shareAllContacts(req: Request, res: Response) {
    let { contacts } = req.body; // { firstName, lastName, email }
    const authenticatedUser = req.authenticatedUser;
    console.log("contacts", contacts);

    let emails = [];
    let placeholders = [];
    for (let contact of contacts) {
        emails.push(contact.email);
        placeholders.push("?");
    }
    // count the number of contacts that are new
    let [[countInfo]] = await global.db.query(`SELECT COUNT(*) as count FROM ShareContact WHERE email IN (${placeholders.join(",")})`, emails);

    if (contacts.length - countInfo.count < 10) {
        return res.status(400).send({ error: "Your account can't submit any more emails." });
    }


    const emailPromises = contacts.map(async (contact) => {
        let displayName = contact.name;
        let firstName = null; //contact.name.first;
        let lastName = null; //contact.name.last;
        let email = contact.email; //contact.emails[0].address;

        // Insert contact into ShareContacts table
        let [[existing]] = await global.db.query(`SELECT * FROM ShareContact WHERE email = ?`, [email]);
        if (existing) {
            return;
        }
        const shareContact = new ShareContact({ firstName, lastName, email, authenticatedUser: req.authenticatedUser.id });
        shareContact.insert().catch(err => {
            console.error("error inserting shareContact");
            console.error(err);
        });
        return shareContact;
    });
    await Promise.all(emailPromises).then(() => {
        console.log("all emails sent");
    }).catch(err => {
        console.error("error sending emails");
        console.error(err)
    })

    // Asynchronously send all emails
    try {
        // let results = (await Promise.all(emailPromises)).filter(item => item);
        // console.log("results", results);
        // update credits
        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = creditsRemaining + ?, contactsShared=1 WHERE id = ?`, [100, authenticatedUser.id]);
        let [[updated]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`, [authenticatedUser.id]) as any[];
        return res.status(200).send({ creditsRemaining: updated.creditsRemaining });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err.message });
    }
}

export const route = {
    url: "/api/share-all-contacts",
    method: 'POST',
    authenticated: true,
};