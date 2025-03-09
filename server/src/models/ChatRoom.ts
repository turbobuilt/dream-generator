import { DbObject } from "../lib/db";

class Chat extends DbObject {
    name: string;
}

class ChatAuthenticatedUser extends DbObject {
    chatId: number;
    userId: number;
}