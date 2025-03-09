import { Request, Response } from "express";
import { DbObject } from "../lib/db";


class ObjectionableContentReport extends DbObject {
    share: number;
    reason: string;
    authenticatedUser: number;
    description: string;
    constructor(data: any) {
        super(data);
        this.share = data.share;
        this.reason = data.reason;
        this.authenticatedUser = data.authenticatedUser;
        this.description = data.description;
    }
}
export async function reportObjectionableContent(req: Request, res: Response, data: { shareId: number, reason: string }|Function) {
    console.log(data,"was data", req.body)
    let { shareId, reason } = data && typeof data !== "function" ? data : req.body;

    console.log("reportObjectionableContent", shareId, reason)
    let [[share]] = await global.db.query(`SELECT * FROM Share WHERE id = ?`, [shareId]);
    if (!share) {
        return res.status(400).send({ error: "Share not found" });
    }
    let objectionableContentReport = new ObjectionableContentReport({ share: share.id, reason, authenticatedUser: req.authenticatedUser.id });
    await objectionableContentReport.save();
    // remove from UserMainFeed
    await global.db.query(`DELETE FROM UserMainFeed WHERE share = ? AND authenticatedUser = ?`, [share.id, req.authenticatedUser.id]);

    return res.send({ success: true })
}

export const route = { url: '/api/report-objectionable-content', method: 'POST', authenticated: true };