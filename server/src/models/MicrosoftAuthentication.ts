import { DbObject } from "../lib/db";

export class MicrosoftAuthentication extends DbObject {
    authenticatedUser: number;
    // organization: number;
    accessToken: string;
    refreshToken: string;
}