import { DbObject } from "../lib/db";

export class Automailer extends DbObject {
    name: string;
    startTrigger: string;
}