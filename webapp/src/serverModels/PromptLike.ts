import { DbObject } from "./db";

export class PromptLike extends DbObject {
    authenticatedUser?: number;
    prompt?: number;
}
