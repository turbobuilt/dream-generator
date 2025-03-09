import { DbObject } from "../lib/db";

export class CreditLog extends DbObject {
    authenticatedUser: number;
    credits: number;
}