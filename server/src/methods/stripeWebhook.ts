import { Request, Response } from "express";
import { platform } from "os"
import { inspect } from "util";
import { plans } from "./createPaymentIntent";

const endpointSecret = process.env.stripe_endpoint_secret;

const stripe = require("stripe")(
    platform() == 'darwin' ?
        process.env.stripe_secret_test :
        process.env.stripe_secret_live
);

export async function stripeWebhook(req: Request, res: Response) {
    try {
        const sig = req.headers['stripe-signature'];
        // var event = stripe.webhooks.constructEvent((req as any).rawBody, sig, endpointSecret);
        var event = await stripe.events.retrieve(req.body.id);
    } catch (err) {
        console.log("webook error", err)
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }


    // Handle the event
    switch (event.type) {
        case 'customer.subscription.updated':
            console.log("subscription updated");
            console.log(inspect(event, null, 10));
            const subscription = event.data.object;
            const planId = subscription.items.data[0].plan.id;
            var [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE stripeId=?`, [subscription.customer]);
            if (!authenticatedUser) {
                return res.status(200).send({ error: `customer not found ${subscription.customer}` });
            }

            let currentPlan = plans.find(item => item.stripeId == planId || item.testStripeId == planId);
            console.log("new plan is ", currentPlan)
            if (!currentPlan) {
                console.log("no matching plan found", planId)
                return res.status(200).send({ error: `plan not found. plan id:${planId}` });
            }
            let credits = currentPlan.credits;

            console.log("setting plan = ", currentPlan.id, "adding credits", currentPlan.credits);
            await db.query("UPDATE AuthenticatedUser SET creditsRemaining=creditsRemaining+?, plan=? WHERE stripeId=?", [credits, currentPlan.id, subscription.customer]);
            return res.send({ success: true });

            break;
        case 'customer.subscription.deleted':
            const customerSubscriptionDeleted = event.data.object;
            console.log("delete inf", customerSubscriptionDeleted);
            return res.status(200).send({ error: "not done" });
            var [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE stripeId=?`, [customerSubscriptionDeleted.customer]);
            if (!authenticatedUser) {
                return res.status(200).send({ error: "customer not found" });
            }
            console.log("Deleted hook")
            await db.query("UPDATE AuthenticatedUser SET plan=NULL WHERE stripeId=?", [customerSubscriptionDeleted.customer]);
            return res.send({ success: true });
            // case 'customer.subscription.updated':
            //     const customerSubscriptionUpdated = event.data.object;
            //     console.log("update inf", customerSubscriptionUpdated);
            //     return res.status(200).send({ error: "not done" });
            //     var [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE stripeId=?`, [customerSubscriptionUpdated.customer]);
            //     if(!authenticatedUser) {
            //         return res.status(200).send({ error: "customer not found" });
            //     }
            //     console.log("Updated hook")
            //     await db.query("UPDATE AuthenticatedUser SET plan=? WHERE stripeId=?",[customerSubscriptionUpdated.items.data[0].plan.id, customerSubscriptionUpdated.customer]);
            //     return res.send({ success: true });


            // case 'invoice.paid':
            //     let invoice = event.data.object;
            //     console.log("invoice information", inspect(invoice, null, 10));
            //     let reason = invoice.billing_reason
            //     var [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE stripeId=?`, [invoice.customer]);
            //     if(!authenticatedUser) {
            //         console.log("customer not found", invoice.customer)
            //         return res.status(200).send({ error: "customer not found" });
            //     }

            //     if (invoice.billing_reason == "subscription_cycle") { // "subscription_update"
            //         let plan = plans.find(item => item.stripeId == invoice.lines.data[0].plan.id || item.testStripeId == invoice.lines.data[0].plan.id);
            //         let credits = plan.credits;
            //         // let maxCredits = plan.credits*1.7
            //         console.log("Current credits remaining", authenticatedUser.creditsRemaining)
            //         // await db.query("UPDATE AuthenticatedUser SET creditsRemaining=LEAST(?, creditsRemaining+?) WHERE stripeId=?",[maxCredits, credits, invoice.customer]);
            //         await db.query("UPDATE AuthenticatedUser SET creditsRemaining=creditsRemaining+? WHERE stripeId=?",[credits, invoice.customer]);
            //         [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE stripeId=?`, [invoice.customer]);
            //         console.log("New credits remaining", authenticatedUser.creditsRemaining)
            //     }

            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
            return res.status(200).send({ success: true, ignored: true });
    }
}

export const route = {
    url: "/api/stripe-webhook",
    method: "POST",
    authenticated: false
}