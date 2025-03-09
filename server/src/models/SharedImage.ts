// Step-by-step plan
// 1. Create a new class that extends DbObject class from global.
// 2. Define class properties according to the request: id, created, updated, createdBy, updatedBy.

import { DbObject } from "../lib/db";

export class SharedImage extends DbObject {
    id: number;
    created: number;
    updated: number;
    createdBy: number;
    updatedBy: number;
    authenticatedUser: number;
    path: string;
    prompt: number;
    uploaded;
    sensitiveContentResult: any;
}