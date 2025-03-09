import { Request, Response } from "express";
import { plans } from "./createPaymentIntent";
import Stripe from "stripe";

export async function getStripeStatus(req: Request, res: Response) {
    let isTest = req.query.isTest == "true";
    let [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]);
    
    const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);

    if (!authenticatedUser.plan) {
        return res.json({ plan: null, stripeId: null });
    }
    if (authenticatedUser.stripeId) {
        let customer = await stripe.customers.retrieve(authenticatedUser.stripeId, { expand: ['subscriptions'] });
        // check if they have an active subscription
        let activeSubscriptions = customer.subscriptions.data.filter(item => item.status == "active");
        console.log(customer.subscriptions.data)
        if (activeSubscriptions.length == 0) {
            return res.json({ plan: null, stripeId: true });
        }
        let activeSubscription = activeSubscriptions[0];
        let plan = plans.find(item => item.stripeId == activeSubscriptions[0].plan.id || item.testStripeId == activeSubscriptions[0].plan.id);
        return res.json({ stripePlan: plan.id, plan: authenticatedUser.plan, startDate: activeSubscription.start_date, endDate: activeSubscription.current_period_end, stripeId: authenticatedUser.stripeId, cancellationPending: activeSubscription.cancel_at_period_end });
    }
    return res.json({ plan: null, stripeId: null });
}

export const route = {
    url: "/api/stripe-status",
    method: 'GET',
    authenticated: true
}