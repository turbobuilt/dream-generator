import { DbObject } from "./db";

export class SharedImage extends DbObject {
    id?: number;
    created?: number;
    updated?: number;
    createdBy?: number;
    updatedBy?: number;
    authenticatedUser?: number;
    path?: string;
    prompt?: number;
    uploaded?: any;
    sensitiveContentResult?: any;
}
