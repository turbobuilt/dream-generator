
import { Request, Response, response } from "express";
import axios from "axios";
import { ImageGenerationRequest } from "../models/ImageGenerationRequest";
import { getRunpodStatus } from "./getRunpodStatus";
import { getReplicateStatus } from "./getReplicateStatus";

export async function getCreditsRemaining(req: Request, res: Response) {
    let [[userData]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id])
    return res.json({ creditsRemaining: userData.creditsRemaining });
}

export const route = { url: '/api/credits-remaining', method: 'GET', authenticated: true };