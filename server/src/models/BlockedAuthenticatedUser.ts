import { DbObject } from "../lib/db";

export class AuthenticatedUserProfile extends DbObject {
    blockingAuthenticatedUser: number;
    blockedAuthenticatedUser: number;
}