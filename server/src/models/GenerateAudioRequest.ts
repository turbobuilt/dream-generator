import { DbObject } from "../lib/db"

export class GenerateAudioRequest extends DbObject {
    prompt: string;
    model: string;
    status?: string;
    duration?: number;
    error?: string;
    outputUrl?: string;
}