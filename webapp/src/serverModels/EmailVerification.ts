import { DbObject } from "./db";

export class EmailVerification extends DbObject {
    authenticatedUser?: number;
    token?: string;
}
