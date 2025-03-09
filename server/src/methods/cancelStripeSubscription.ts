// this is the new one
import Stripe from "stripe";


export async function cancelStripeSubscription(req, res) {
    let [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id]);

    await db.query(`UPDATE AuthenticatedUser SET downgradePlanTo='cancel' WHERE id=?`, [req.authenticatedUser.id]);
    
    const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);
    
    // let customer = await stripe.customers.retrieve(authenticatedUser.stripeId, { expand: ['subscriptions'] });
    let paymentMethods = await stripe.paymentMethods.list({
        customer: authenticatedUser.stripeId,
    });
    for (let paymentMethod of paymentMethods.data) {
        await stripe.paymentMethods.detach(paymentMethod.id);
    }

    return res.json({ success: true });
}

export const route = {
    url: "/api/cancel-stripe-subscription",
    method: 'GET',
    authenticated: true
}