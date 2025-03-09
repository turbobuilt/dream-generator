// Define the UserFeed class which extends global.DbObject
// No constructor, it will be inherited
// Additional fields: id, created, prompt, authenticatedUser, position

// No need to import anything as no additional class is being used

export class UserPopularityFeed extends global.DbObject {
    id: number;
    created: number;
    prompt: string;
    authenticatedUser: number;
    position: number;
}