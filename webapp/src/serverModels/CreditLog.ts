import { DbObject } from "./db";

export class CreditLog extends DbObject {
    authenticatedUser?: number;
    credits?: number;
}
