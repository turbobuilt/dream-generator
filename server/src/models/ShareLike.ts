import { DbObject } from "../lib/db";

export class ShareLike extends DbObject {
    share: number;
    authenticatedUser: number;
}