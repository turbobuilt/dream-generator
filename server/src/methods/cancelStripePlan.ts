import Stripe from "stripe";


export async function cancelStripePlan(req, res) {
    let [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE id=?`, [req.authenticatedUser.id])
    if (!authenticatedUser?.stripeId) {
        return res.json({ error: "You do not have a stripe id." })
    }
    let isTest = req.query.isTest == "true";

    const stripe = new Stripe(process.env.NODE_ENV === 'production' ? process.env.stripe_secret_live :process.env.stripe_secret_test);

    let customer = await stripe.customers.retrieve(authenticatedUser.stripeId, { expand: ['subscriptions'] });
    // check if they have an active subscription
    let activeSubscriptions = customer.subscriptions.data.filter(item => item.status == "active" && !item.cancel_at_period_end);
    // console.log(customer.subscriptions.data)
    console.log(activeSubscriptions, "was active")
    if (activeSubscriptions.length == 0) {
        return res.json({ error: "You do not have a stripe subscription to cancel." });
    }
    let activeSubscription = activeSubscriptions[0];
    let subscription = await stripe.subscriptions.update(activeSubscription.id, {
        cancel_at_period_end: true,
    });
    // await db.query("UPDATE authenticatedUser SET plan=NULL WHERE id=?", [req.query.id]);
    return res.json({ success: true });
}