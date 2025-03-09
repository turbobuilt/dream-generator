// Step 1: Define our extended class from global.DbObject
// Step 2: Include the properties name, email, passwordHash and creditsRemaining to this class
// Step 3: Implement our getClientSafeUser method. This will return all properties except passwordHash
// Step 4: Override the get method. This will return the clientSafeUser unless a parameter is passed (includeUnsafeFields)
// Step 5: If includeUnsafeFields is true, it will call and return the result of original get method, otherwise, return the clientSafeUser

import { DbObject } from "../lib/db";


export class AuthenticatedUserProfile extends DbObject {
    authenticatedUser: number;
    bio: string;
    picture: string;
}