import { Request, Response } from 'express';
import { Automailer } from '../models/Automailer';

export default async function (req: Request, res: Response) {
    if (req.authenticatedUser.email != 'support@dreamgenerator.ai') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    let automailer = new Automailer();
    Object.assign(automailer, req.body);
    await automailer.save();

    res.json({automailer});
}