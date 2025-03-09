import { Request, Response } from "express";

export async function getAutomailerEmail(req: Request, res: Response) {
    if (req.authenticatedUser.email != 'support@dreamgenerator.ai') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let [[automailerEmail]] = await db.query('SELECT * FROM AutomailerEmail WHERE id = ?', [req.params.id]);

    return res.json({ item: automailerEmail });
}

export const route = {
    url: '/api/get-automailer-email/:id',
}