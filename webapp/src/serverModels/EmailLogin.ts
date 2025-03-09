import { DbObject } from "./db";

export class EmailLogin extends DbObject {
    authenticatedUser?: number;
    token?: string;
    insecureToken?: string;
    verified?: boolean;
}
