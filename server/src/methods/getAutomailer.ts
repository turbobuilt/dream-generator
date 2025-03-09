import { Request, Response } from "express";

export async function getAutomailer(req: Request, res: Response) {
    if (req.authenticatedUser.email != 'support@dreamgenerator.ai') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let [[automailer]] = await db.query('SELECT * FROM Automailer WHERE id = ?', [req.params.id]);
    let [automailerEmails] = await db.query('SELECT * FROM AutomailerEmail WHERE automailer = ?', [req.params.id]);

    return res.json({ item: automailer, emails: automailerEmails });
}

export const route = {
    url: '/api/get-automailer/:id',
}