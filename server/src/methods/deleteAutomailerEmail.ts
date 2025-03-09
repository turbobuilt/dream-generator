import { Request, Response } from 'express';
import { Automailer, AutomailerEmail } from '../models/Automailer';

export default async function (req: Request, res: Response) {
    if (req.authenticatedUser.email != 'support@dreamgenerator.ai') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let { id } = req.query;
    
    console.log("Deleting automailer", id);
    await AutomailerEmail.delete(id);
    console.log("Deleted automailer", id);

    res.json({ deleted: true });
}