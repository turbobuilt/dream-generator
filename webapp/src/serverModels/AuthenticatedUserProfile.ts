import { DbObject } from "./db";

export class AuthenticatedUserProfile extends DbObject {
    authenticatedUser?: number;
    bio?: string;
    picture?: string;
}
