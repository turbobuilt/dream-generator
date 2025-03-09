// Plan
// 1. Create an Like class that extends global.DbObject
// 2. Define the properties authenticatedUser and prompt
// 3. authenticatedUser will track the id of the user who pressed like.
// 4. prompt will track the id of the liked content.

import { DbObject } from "../lib/db";

export class PromptLike extends DbObject {
    authenticatedUser: number;
    prompt: number;
}