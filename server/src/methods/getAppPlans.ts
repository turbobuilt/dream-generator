import { Request, Response } from "express";
import { applePlans } from "./verifyIosTransaction";

export default async function (req, res) {
    return res.json({ items: applePlans });
}

export const route = {
    authenticated: false
}