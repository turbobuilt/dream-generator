import { DbObject } from "../lib/db";

export class EmailVerification extends DbObject {
    authenticatedUser: number;
    token: string;
}