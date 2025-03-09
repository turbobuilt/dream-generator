import { DbObject } from "../lib/db";

export class ImageUpscaleRequest extends DbObject {
    authenticatedUser: number;
    imageGuid: string;
    status: string;
    error: string;
}