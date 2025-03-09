import { Request, Response } from 'express';
import { chatModelInfo } from './postAiChat';

export default async function(req: Request, res: Response) {
    return res.json(chatModelInfo);
}

export const route = {
    authenticated: false
}