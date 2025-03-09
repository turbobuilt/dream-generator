import { Request, Response } from "express";
import { plans } from "./createPaymentIntent";
import Stripe from "stripe";

export async function changePlanStripe(req: Request, res: Response, newPlanId: string): Promise<any> {
    // if the selected plan is same as current plan, return
    if (req.authenticatedUser.plan == newPlanId) {
        return res.status(400).json({ error: "You are already on this plan. If this is a mistake, please contact support (support@dreamgenerator.ai), and we will fix it" });
    }
    const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);

    if (!req.authenticatedUser.stripeId) {
        return res.status(401).json({ error: "This user doesn't have a stripe Id. This is an error and means you should contact support (support@dreamgenerator.ai). In the mean time, if you subscribed in the ios or android app, your billing must be managed there for now, as you can't do it on the web. If you are in the app... ok that shouldn't happen contact support!" });
    }
    let customer = await stripe.customers.retrieve(req.authenticatedUser.stripeId);
    let desiredPlan = plans.find(plan => plan.stripeId == newPlanId);
    if (!desiredPlan) {
        return res.status(400).json({ error: "The desired plan doesn't exist. This is an error and means you should contact support (support@dreamgenerator.ai). Please forgive us, we are right now a one man team (with help from God lol)! But seriously it was an accident, just contactg support@dreamgenerator.ai and it will get fixed." });
    }
    let subscription = customer.subscriptions.data[0];
    if (subscription.plan.id == newPlanId) {
        return res.status(400).json({ error: "You are already on this plan. If this is a mistake, please contact support (support@dreamgenerator.ai), and we will fix it" });
    }
    await stripe.subscriptions.update(subscription.id, {
        items: [{
            id: subscription.items.data[0].id,
            plan: desiredPlan.stripeId
        }],
        proration_behavior: "always_invoice"
    });
}