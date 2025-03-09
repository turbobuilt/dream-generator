import { DbObject } from "../lib/db";

export class SharedAudio extends DbObject {
    id: number;
    created: number;
    updated: number;
    createdBy: number;
    updatedBy: number;
    authenticatedUser: number;
    path: string;
    size: number;   
    prompt: string;
    // prompt: number;
    model: string;
    uploaded;
    sensitiveContentResult: any;
}