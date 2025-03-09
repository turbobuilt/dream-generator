// Planning steps:
// 1. Define the Notification class extending DbObject.
// 2. Add class properties for authenticatedUser and type.
// 3. Implement required DbObject methods.
// 4. Add the typename method.

import { DbObject } from "../lib/db";

export class Notification extends DbObject {
    authenticatedUser: number;
    chatMessage: number;
    authenticatedUserFriend: number;
    eventDateTime: number;

    originatorPictureGuid?: string;
    originatorUserName?: string;

    // Placeholder for other DbObject methods. Uncomment and implement 
    // as necessary according to your application/database needs.

    /*
    save(): Promise<DbObject>;
    static getAll(page?: number, perPage?: number): Promise<{ items: DbObject[] }>;
    get(id: number): Promise<unknown>;
    update(updatedBy?: number): Promise<DbObject>;
    delete(): Promise<any>;
    insert(createdBy?: number): Promise<DbObject>;
    */
        
    typename(): string {
        return 'Notification';
    }
}