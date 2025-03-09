import { DbObject } from "../lib/db";

export class AnimateVideoRequest extends DbObject {
    uploadKey: string;
    authenticatedUser: number;
    status: string;
    error: string;
    outputUrl: string;
    duration: number;
    model: string;
}