import { AuthenticatedUser } from "./AuthenticatedUser";

export class CallRoom {
    id?: string;
    name?: string;
    uuid?: string;
    originator?: number;
}

export class CallRoomAuthenticatedUser {
    callRoom?: number;
    authenticatedUser?: number;
}
