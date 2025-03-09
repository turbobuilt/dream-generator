import { DbObject } from "./db";

export class AuthenticatedUserFriend extends DbObject {
    authenticatedUser?: number;
    friend?: number;
}
