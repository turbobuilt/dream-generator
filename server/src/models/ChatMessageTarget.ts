import { DbObject } from "../lib/db";

export class ChatMessageTarget extends DbObject {
    chatMessage: number;
    authenticatedUser: number;
    viewed: boolean;
}