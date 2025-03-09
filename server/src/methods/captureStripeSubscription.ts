import { Request, Response } from "express";
import { plans } from "./createPaymentIntent";
import Stripe from "stripe";


const stripe = new Stripe(
    process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :
        process.env.stripe_secret_test
);


export default async function (req: Request, res: Response) {
    let { stripeToken, planId } = req.body;
    console.log("stripeToken is", stripeToken);
    let plan = plans.find(item => item.id === planId);
    if (!plan) {
        return res.status(400).send({ error: "That plan doesn't exist.  If you are hacking... there are better things to do. Try to get a job or something or at least pray.  If this is a mistake, contact support.  Hallelujah! We are going to fix the bugs, one at a time.  We are happy to serve you.", code: "plan_not_found" });
    }
    // create customer
    const customer = await stripe.customers.create({
        email: req.authenticatedUser.email,
        source: stripeToken
    });
    var amount = plan.price;
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

export const route = {
    authenticated: false
}