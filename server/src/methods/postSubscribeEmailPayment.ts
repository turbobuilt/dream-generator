import { Request, Response } from "express";
import { plans } from "./createPaymentIntent";
import Stripe from "stripe";
import { AuthenticatedUser } from "../models/AuthenticatedUser";
import { AuthToken } from "../models/AuthToken";
import { sendEmail } from "../lib/sendEmail";
import { createRandomGuid } from "../lib/db_old";
import { EmailVerification } from "../models/EmailVerification";


const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);



export default async function (req: Request, res: Response) {
    let { email, stripeCustomerId, stripePaymentIntentId, planId } = req.body;
    let plan = plans.find(item => item.id === planId);

    if (!email || !email.match(/.+@.+\..+/)) {
        return res.status(400).send({ error: "Invalid email", code: "invalid_email" });
    }

    let customer = await stripe.customers.retrieve(stripeCustomerId);
    let paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
    // cancel hold
    await stripe.paymentIntents.cancel(stripePaymentIntentId);
    // create subscription
    const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
            price: plan.stripeId,
        }],
        payment_behavior: 'error_if_incomplete',
        expand: ['latest_invoice.payment_intent'],
    });

    if (!req.authenticatedUser) {
        // create account
        let authenticatedUser = new AuthenticatedUser();
        authenticatedUser.email = email;
        authenticatedUser.stripeId = stripeCustomerId;
        authenticatedUser.plan = plan.id;
        authenticatedUser.creditsRemaining = plan.credits;
        await authenticatedUser.save();
        req.authenticatedUser = authenticatedUser;
    }
    else {
        // update account
        await global.db.query(`UPDATE AuthenticatedUser SET stripeId=?, plan=?, creditsRemaining=creditsRemaining+? WHERE id=?`, [stripeCustomerId, plan.id, plan.credits, req.authenticatedUser.id]);
    }

    const authToken = new AuthToken();
    await authToken.generate(req.authenticatedUser.id);

    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id])
    authenticatedUser = new AuthenticatedUser(authenticatedUser);

    let emailVerification = new EmailVerification();
    emailVerification.authenticatedUser = authenticatedUser.id;
    emailVerification.token = (await Promise.all([createRandomGuid(), createRandomGuid()])).join("");
    await emailVerification.save();

    let url = process.env.NODE_ENV == "production" ? "https://dreamgenerator.ai/app" : "http://localhost:5173";
    url += `/verify-email?token=${emailVerification.token}`;

    sendEmail({
        to: email,
        from: "info@dreamgenerator.ai",
        subject: "Verify your email",
        htmlFileName: "verifyEmail",
        vars: {
            url
        }
    });
    res.send({ message: "success", customerId: customer.id, paymentIntentId: paymentIntent.id, authenticatedUser: authenticatedUser.getClientSafeUser(), token: authToken.token });
}

export const route = {
    authenticated: false
}