import { DbObject } from "../lib/db";

export class ChatMessageText extends DbObject {
    chatMessage: number;
    text: string
}