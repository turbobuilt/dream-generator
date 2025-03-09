import { Request, Response } from "express"
import { AuthenticatedUser } from "../models/AuthenticatedUser";
import { creditPacks } from "./getCreditPacksList";
import Stripe from "stripe";



export default async function (req: Request, res: Response) {
    const { creditPackId, isTest } = req.query;
    let creditPack = creditPacks[creditPackId as string];
    console.log(creditPackId, req.query)

    const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);

    let selectedPlan = isTest ? creditPack.testStripeId : creditPack.stripeId;
    if (!selectedPlan) {
        return res.status(400).send({ error: "That plan doesn't exist.  If you are hacking... there are better things to do. Try to get a job or something or at least pray.  If this is a mistake, contact support.  Hallelujah! We are going to fix the bugs, one at a time.  We are happy to serve you." });
    }

    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id])
    authenticatedUser = new AuthenticatedUser(authenticatedUser);
    if (!authenticatedUser.stripeId) {
        const customer = await stripe.customers.create({
            email: authenticatedUser.email,
        });
        authenticatedUser.stripeId = customer.id;
        await authenticatedUser.save();
    }

    console.log("creating payment intent", selectedPlan);
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        customer: authenticatedUser.stripeId,
        amount: creditPack.price,
        currency: 'usd',
        setup_future_usage: 'off_session',
        metadata: {
            authenticatedUser: authenticatedUser.id,
            creditPack: creditPackId
        }
    });
    
    return res.send({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
    });   
}