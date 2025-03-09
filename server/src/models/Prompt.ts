// Step 1: Declare the Prompt class which extends global.DbObject
// Step 2: Define the properties: id, created, updated, authenticatedUser, prompt, style, title

import { DbObject } from "../lib/db";

export class Prompt extends DbObject {
    promptCategory: number;
    authenticatedUser: number;
    prompt: string;
    style: string;
    title: string;

    audio: boolean;
}