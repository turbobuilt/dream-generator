import { DbObject } from "../lib/db";


let costs = {
    "gpt-3.5-turbo": 0.0001
}

export class AiChatRequest extends DbObject {
    authenticatedUser: number;
    model: string;
    inputTokenCount: number;
    outputTokenCount: number;
    creditCost: number;

    async save() {
        // this.creditCost = 
        return super.save();
    }
}