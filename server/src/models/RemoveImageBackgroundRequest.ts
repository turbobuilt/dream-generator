
// "create table RemoveImageBackgroundRequest": `CREATE TABLE RemoveImageBackgroundRequest (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT DEFAULT NULL, updated BIGINT DEFAULT NULL, createdBy BIGINT DEFAULT NULL, updatedBy BIGINT DEFAULT NULL, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id), imageGuid VARCHAR(255), status VARCHAR(255), error TEXT)`,

import { DbObject } from "../lib/db";

export class RemoveImageBackgroundRequest extends DbObject {
    authenticatedUser: number;
    imageGuid: string;
    status: string;
    error: string;
}