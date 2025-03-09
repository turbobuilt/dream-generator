import { Request, Response } from "express";
import { plans } from "./createPaymentIntent";

export async function getPlans(req: Request, res: Response) {
    return res.json({ items: plans });
}

export const route = {
    authenticated: false
}