import { Request, Response } from "express";
import { plans } from "./createPaymentIntent";
import Stripe from "stripe";
import moment from "moment";

export async function getChangePlanPricingStripe(req: Request, res: Response, newPlanId: string): Promise<any> {
    // if the selected plan is same as current plan, return
    if (req.authenticatedUser.plan == newPlanId) {
        return res.status(400).json({ error: "You are already on this plan. If this is a mistake, please contact support (support@dreamgenerator.ai), and we will fix it" });
    }
    const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);

    if (!req.authenticatedUser.stripeId) {
        return res.status(401).json({ error: "This user doesn't have a stripe Id. This is an error and means you should contact support (support@dreamgenerator.ai). In the mean time, if you subscribed in the ios or android app, your billing must be managed there for now, as you can't do it on the web. If you are in the app... ok that shouldn't happen contact support!" });
    }
    if (!req.authenticatedUser.plan) {
        return res.status(400).json({ error: "Your account is not currently subscribed. If you think this is an error and means you should contact support at support@dreamgenerator.ai" });
    }

    let desiredPlan = plans.find(plan => plan.stripeId == newPlanId);
    if (!desiredPlan) {
        return res.status(400).json({ error: "The desired plan doesn't exist. This is an error and means you should contact support (support@dreamgenerator.ai). Please forgive us, we are right now a one man team (with help from God lol)! But seriously it was an accident, just contactg support@dreamgenerator.ai and it will get fixed." });
    }
    let currentPlan = plans.find(plan => plan.stripeId == req.authenticatedUser.plan);
    if (!currentPlan) {
        return res.status(400).json({ error: "The current plan you are on wasn't found. Obviously is an error! Please contact support at support@dreamgenerator.ai" });
    }
    if (currentPlan.price > desiredPlan.price) {
        await db.query(`UPDATE AuthenticatedUser SET downgradePlanTo = ? WHERE id = ?`, [newPlanId, req.authenticatedUser.id]);
        return res.json({ success: true })
    } else if (currentPlan.price == desiredPlan.price) {
        await db.query(`UPDATE AuthenticatedUser SET plan = ? WHERE id = ?`, [newPlanId, req.authenticatedUser.id]);
        return res.json({ success: true })
    }

    // // now compute the proration
    // let billingDayOfMonth = req.authenticatedUser.billingDayOfMonth;
    // let daysInCurrentMonth = moment().daysInMonth();
    // let dayOfMonth = moment().date();
    // // calculate days remaining on current plan
    // let daysRemaining = daysInCurrentMonth - dayOfMonth;
    // // if (daysRemaining <= 0) {
    // //     // let setupIntent = await stripe.paymentIntents.create({
    // //     //     amount: desiredPlan.price,
    // //     //     capture_method: 'manual',
    // //     //     currency: 'usd',
    // //     //     customer: req.authenticatedUser.stripeId,
    // //     //     payment_method_types: ['card'],
    // //     //     metadata: {
    // //     //         plan: newPlanId,
    // //     //         user: req.authenticatedUser.id
    // //     //     }
    // //     // });
    // //     return res.json({ authorizeOnly: true });
    // // }
    // let unusedCredit = currentPlan.price * (daysRemaining / daysInCurrentMonth);
    // let newPlanPrice = desiredPlan.price;
    // let totalPrice = newPlanPrice - unusedCredit;

    // create paymentIntent, make it save for off-session
    let paymentIntent = await stripe.paymentIntents.create({
        amount: desiredPlan.price,
        currency: 'usd',
        customer: req.authenticatedUser.stripeId,
        // payment_method_types: ['card'],
        metadata: {
            plan: newPlanId,
            user: req.authenticatedUser.id
        },
        confirm: true,
        setup_future_usage: 'off_session',
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
}