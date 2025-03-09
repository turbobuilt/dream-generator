// Define UserFeedInfo class which extends the global.DbObject class
// The class has three properties: created, authenticatedUser, userMainFeedLocation
// No constructor is needed as it will be inherited from the parent class

import { DbObject } from "global";

export class UserFeedInfo extends DbObject {
    // Property to store the timestamp when the feed info is created
    created: number;

    // Property to store authenticated user object
    authenticatedUser: number;

    // Property to store user's main feed location
    userMainFeedLocation: string;
}