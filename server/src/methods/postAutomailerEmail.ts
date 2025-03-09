import { Request, Response } from 'express';
import { AutomailerEmail } from '../models/AutomailerEmail';

export default async function (req: Request, res: Response) {
    if (req.authenticatedUser.email != 'support@dreamgenerator.ai') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    let automailerEmail = new AutomailerEmail();
    Object.assign(automailerEmail, req.body);
    await automailerEmail.save();

    res.json({automailer: automailerEmail});
}