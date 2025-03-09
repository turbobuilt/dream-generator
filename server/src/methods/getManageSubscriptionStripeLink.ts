import { Request, Response, response } from "express";
import { stripe } from "./postSubscribeToken";

export default async function(req: Request, res: Response) {
    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id]);
    if (!authenticatedUser.stripeId) {
        return res.status(400).json({ error: "No Stripe id found" });
    }
    // get billing portal link
    const session = await stripe.billingPortal.sessions.create({
        customer: authenticatedUser.stripeId,
        return_url: process.env.NODE_ENV === 'production' ? 'https://dreamgenerator.ai/app/chat' : 'http://localhost:5173/chat'
    });
    res.json({ url: session.url });
}