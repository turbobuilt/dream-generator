import { Request, Response } from "express";

export async function getAutomailers(req: Request, res: Response) {
    if (req.authenticatedUser.email != 'support@dreamgenerator.ai')
        return res.status(401).json({ error: 'Unauthorized' });

    let [automailers] = await db.query('SELECT * FROM Automailer');
    return res.json({ items: automailers });
}

// export const route = { url: "/api/automailers", method: "GET", authenticated: true }