import { Request, Response } from 'express';
import { currentImageModels, imageModels } from './generateImage';

export async function getImageModels(req: Request, res: Response) {

    // return imageModels;
    res.json(currentImageModels);
}

export const route = {
    authenticated: false
}