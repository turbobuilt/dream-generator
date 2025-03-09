import { Request, Response } from "express";

export default async function(req: Request, res: Response) {
    let { id } = req.query;

    if (!id) {
        return res.status(400).send({ error: "id is required" });
    }
    let [[share]] = await global.db.query(`SELECT id FROM Share WHERE id=?`, [id]);

    return res.json({ exists: !!share });
}