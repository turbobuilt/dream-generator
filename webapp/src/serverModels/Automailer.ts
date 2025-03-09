import { DbObject } from "./db";

export class Automailer extends DbObject {
    name?: string;
    startTrigger?: string;
}
