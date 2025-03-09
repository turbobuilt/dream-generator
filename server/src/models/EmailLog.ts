import { DbObject } from "../lib/db";

export class EmailLog extends DbObject {
    automailerEmail: number;
    authenticatedUser: number;
    email: string;
    subject: string;
    body: string;
    status: string;
}