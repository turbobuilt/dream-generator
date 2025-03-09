import { DbObject } from "../lib/db";

export class TextToSpeech extends DbObject {
    id: number;
    created: number;
    updated: number;
    createdBy: number;
    updatedBy: number;
    authenticatedUser: number;
    text: string;
    falId: string;
    provider: string;
    model: string;
    status: string;
    duration: number;
    error: string;
    outputUrl: string;
}