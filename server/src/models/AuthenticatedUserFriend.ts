// "create table AuthenticatedUserFriend": `CREATE TABLE AuthenticatedUserFriend (id BIGINT PRIMARY KEY AUTO_INCREMENT, created BIGINT, updated BIGINT, createdBy BIGINT, updatedBy BIGINT, authenticatedUser BIGINT, FOREIGN KEY (authenticatedUser) REFERENCES AuthenticatedUser(id) ON DELETE CASCADE, friend BIGINT, FOREIGN KEY (friend) REFERENCES AuthenticatedUser(id) ON DELETE CASCADE)`,

import { DbObject } from "../lib/db";


export class AuthenticatedUserFriend extends DbObject {
    authenticatedUser: number;
    friend: number;
}