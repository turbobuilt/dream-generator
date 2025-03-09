import { DbObject } from "../lib/db";

export class CallRoom extends DbObject {
    name: string;
    uuid: string;
    originator: number;
}

export class CallRoomAuthenticatedUser extends DbObject {
    callRoom: number;
    authenticatedUser: number;
}