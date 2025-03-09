import { DbObject } from "./db";

export class AuthenticatedUserProfile extends DbObject {
    blockingAuthenticatedUser?: number;
    blockedAuthenticatedUser?: number;
}
