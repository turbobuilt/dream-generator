import { Request, Response } from 'express';
import { stripe } from './postSubscribeToken';

export default async function (req: Request, res: Response) {
    let [[authenticatedUser]] = await global.db.query('SELECT * FROM AuthenticatedUser WHERE id = ?', [req.authenticatedUser.id]);
    if (!authenticatedUser.stripeId) {
        res.status(400).send('User has not subscribed yet');
        return;
    }
    const session = await stripe.billingPortal.sessions.create({
        customer: authenticatedUser.stripeId,
    });
    res.send({ url: session.url });
}