import { DbObject } from "./db";

export class AiChatRequest extends DbObject {
    authenticatedUser?: number;
    model?: string;
    inputTokenCount?: number;
    outputTokenCount?: number;
    creditCost?: number;

    async save() {
        return super.save();
    }
}
