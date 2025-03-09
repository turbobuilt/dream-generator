import { Request, Response } from "express";
import { imageModels } from "./generateImage";

export default async function getCreateImageModels(req: Request, res: Response) {
    return res.json({ models: imageModels });
}

export const route = {
    authenticated: false
}