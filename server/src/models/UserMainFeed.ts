// Plan:
// 1. Define UserMainFeed class that extends DbObject from global module
// 2. Within this class, declare class properties for id, created, prompt, authenticatedUser, position
// 3. id, created and prompt will be inherited from DbObject
// 4. authenticatedUser and position will be new properties specific to UserMainFeed class

export class UserMainFeed extends global.DbObject {
    authenticatedUser: number; // The authenticated user's unique identifier
    position: number; // The position of the authenticated user
}