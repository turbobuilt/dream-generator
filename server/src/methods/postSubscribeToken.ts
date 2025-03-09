import { Request, Response } from "express";
import { plans } from "./createPaymentIntent";
import Stripe from "stripe";
import { AuthenticatedUser } from "../models/AuthenticatedUser";


const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);



export default async function (req: Request, res: Response) {
    let { stripeToken, planId } = req.body;
    console.log("stripeToken is", stripeToken);
    let plan = plans.find(item => item.id === planId);
    if (!plan) {
        return res.status(400).send({ error: "That plan doesn't exist.  If you are hacking... there are better things to do. Try to get a job or something or at least pray.  If this is a mistake, contact support.  Hallelujah! We are going to fix the bugs, one at a time.  We are happy to serve you.", code: "plan_not_found" });
    }
    let customer: Stripe.Response<Stripe.Customer> = null;
    if (req.authenticatedUser) {
        let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id])
        authenticatedUser = new AuthenticatedUser(authenticatedUser);
        if (authenticatedUser.stripeId) {
            let customerResponse = await stripe.customers.retrieve(authenticatedUser.stripeId, { expand: ['subscriptions'] });
            if (customerResponse.deleted as any) {
                customer = null;
            } else {
                customer = customerResponse as Stripe.Response<Stripe.Customer>;
                // check if they have an active subscription
                let activeSubscriptions = customer.subscriptions.data.filter(item => item.status == "active");
                console.log(customer.subscriptions.data)
                if (activeSubscriptions.length > 0) {
                    return res.status(400).send({ error: "You already have an active subscription.  If you want to change your plan, you must cancel your current subscription first.", code: "already_subscribed" });
                }
            }
        }
    }
    // create customer
    if (customer == null)
        customer = await stripe.customers.create({
            source: stripeToken
        });
    if (req.authenticatedUser) {
        await global.db.query(`UPDATE AuthenticatedUser SET stripeId=? WHERE id=?`, [customer.id, req.authenticatedUser.id]);
    }
    var amount = plan.price;

    if (req.authenticatedUser) {
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{
                price: plan.stripeId,
            }],
            payment_behavior: 'error_if_incomplete',
            expand: ['latest_invoice.payment_intent'],
        });
        await global.db.query(`UPDATE AuthenticatedUser SET stripeId=?, plan=?, creditsRemaining=creditsRemaining+? WHERE id=?`, [customer.id, plan.id, plan.credits, req.authenticatedUser.id]);
        res.send({ message: "success", customerId: customer.id, subscriptionId: subscription.id });
    } else {
        // create hold for amount
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            customer: customer.id,
            off_session: true,
            confirm: true,
            capture_method: 'manual',
            payment_method: customer.default_source as string
        });

        res.send({ message: "success", customerId: customer.id, paymentIntentId: paymentIntent.id });
    }
}

export const route = {
    authenticated: false
}