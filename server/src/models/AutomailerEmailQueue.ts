import { DbObject } from "../lib/db";


export class AutomailerEmailQueue extends DbObject {
    authenticatedUser: number;
    automailerEmail: number;
    sendStarted?: number;
    sent?: number;
}