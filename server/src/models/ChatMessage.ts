import { DbObject } from "../lib/db";

// "create table ChatMessage": `CREATE TABLE ChatMessage (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, chat BIGINT, FOREIGN KEY (chat) REFERENCES Chat(id), authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id), message TEXT, timestamp BIGINT)`,

export class ChatMessage extends DbObject {
    // chat: number;
    authenticatedUser: number;
    message: string;
}