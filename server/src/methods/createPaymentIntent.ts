import { AuthenticatedUser } from "../models/AuthenticatedUser";
import Stripe from "stripe";

let isProduction = process.env.NODE_ENV === 'production';

export const plans = [{
    id: "biggest_plan",
    name: "Best Plan",
    appleId: "ai.dreamgenerator.app.biggest_plan",
    androidId: "ai.dreamgenerator.apptwo.biggest_plan",
    credits: 1599,
    price: 1599,
    stripeId: isProduction ? "price_1L0ZAmKQlgzQQuyiFt1XAbue" : "price_1L0Ye4KQlgzQQuyivEGKSWkK",
}, {
    id: "normal_plan",
    name: "Small",
    appleId: "ai.dreamgenerator.app.normal_plan",
    androidId: "ai.dreamgenerator.apptwo.normal_plan",
    stripeId: isProduction ? "price_1L0Z9jKQlgzQQuyiJRnIPheQ" : "price_1OFG7RKQlgzQQuyiCvhsGomU",
    credits: 199,
    price: 199
}, {
    id: "big_plan",
    name: "Big",
    appleId: "ai.dreamgenerator.app.big_plan",
    androidId: "ai.dreamgenerator.apptwo.big_plan",
    credits: 399,
    price: 399,
    stripeId: isProduction ? "price_1Kv5t9KQlgzQQuyibbJhfqTZ" : "price_1L0YcpKQlgzQQuyikWtRusER",
}, {
    id: "bigger_plan",
    name: "Bigger",
    appleId: "ai.dreamgenerator.app.bigger_plan",
    androidId: "ai.dreamgenerator.apptwo.bigger_plan",
    credits: 799,
    price: 799,
    stripeId: isProduction ? "price_1KxlNNKQlgzQQuyilq9TUBiQ" : "price_1L0Z76KQlgzQQuyiXB9QCsC0",
}]

export async function createPaymentIntent(req, res) {
    const { stripeToken } = req.body;
    console.log("stripeToken is", stripeToken)
    let selectedLivePlan = plans.find(item => item.stripeId == stripeToken)?.stripeId;
    // let selectedTestPlan = plans.find(item => item.testStripeId == stripeToken)?.testStripeId;
    const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);
    

    let selectedPlan = selectedLivePlan; // || selectedTestPlan;
    if (!selectedPlan) {
        return res.status(400).send({ error: "That plan doesn't exist.  If you are hacking... there are better things to do. Try to get a job or something or at least pray.  If this is a mistake, contact support.  Hallelujah! We are going to fix the bugs, one at a time.  We are happy to serve you." });
    }

    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id])
    authenticatedUser = new AuthenticatedUser(authenticatedUser);
    console.log("authenticatedUser is", authenticatedUser);
    if (!authenticatedUser.stripeId) {
        const customer = await stripe.customers.create({
            email: authenticatedUser.email,
        });
        authenticatedUser.stripeId = customer.id;
        await authenticatedUser.save();
    }

    console.log("creating payment intent", selectedPlan);
    let plan = plans.find(item => item.stripeId == selectedPlan);
    let paymentMethod = undefined;
    if (authenticatedUser.plan) {
        let currentPlan = plans.find(item => item.id == authenticatedUser.plan);
        if (!currentPlan) {
            return res.status(400).send({ error: "The system can't find your current plan, but it says you are on the " + authenticatedUser.plan + " plan.  This is obviously an error!  Please contact support@dreamgenerator.ai and we will fix it!" });
        }
        if (currentPlan.price >= plan.price) {
            // await db.query(`UPDATE AuthenticatedUser SET downgradePlanTo = ? WHERE id = ?`, [plan.id, req.authenticatedUser.id]);
            return res.json({ willDowngrade: true })
        }
        let paymentMethods = await stripe.paymentMethods.list({
            customer: authenticatedUser.stripeId,
            type: 'card',
        });
        paymentMethod = paymentMethods.data?.[0]?.id;
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.price,
        currency: 'usd',
        customer: authenticatedUser.stripeId,
        // payment_method: paymentMethod,
        receipt_email: authenticatedUser.email,
        // off_session: true,
        setup_future_usage: 'off_session',
        metadata: {
            plan: plan.id,
            application: "dreamgenerator.ai"
        }
    });
    return res.send({
        clientSecret: paymentIntent.client_secret,
    });

    // const subscription = await stripe.subscriptions.create({
    //     customer: authenticatedUser.stripeId,
    //     items: [{
    //         price: selectedPlan,
    //     }],
    //     payment_behavior: 'default_incomplete',
    //     payment_settings: { 
    //         save_default_payment_method: 'on_subscription'
    //     },
    //     expand: ['latest_invoice.payment_intent'],
    // });
    // console.log("subscription is", subscription);
    // return res.send({
    //     subscriptionId: subscription.id,
    //     clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    // });
}

export const route = {
    url: "/api/create-payment-intent",
    method: 'POST',
    authenticated: true
};