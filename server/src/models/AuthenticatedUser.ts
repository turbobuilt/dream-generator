// Step 1: Define our extended class from global.DbObject
// Step 2: Include the properties name, email, passwordHash and creditsRemaining to this class
// Step 3: Implement our getClientSafeUser method. This will return all properties except passwordHash
// Step 4: Override the get method. This will return the clientSafeUser unless a parameter is passed (includeUnsafeFields)
// Step 5: If includeUnsafeFields is true, it will call and return the result of original get method, otherwise, return the clientSafeUser

import { DbObject } from "../lib/db";

export class AuthenticatedUser extends DbObject {
    name: string;
    email: string;
    passwordHash: string;
    creditsRemaining: number;
    signupPlatform?: string;
    city?: string;
    state?: string;
    country?: string;
    provider?: string;
    plan?: string;
    appleIdentifier?: string;
    microsoftId?: string;
    googleId?: string;
    trialDeclined?: boolean;
    stripeId: any;
    expandedContent?: boolean;
    isOnTrial?: boolean;
    trialUsed?: boolean;
    downgradePlanTo?: string;
    callKitPushToken?: string;
    pushToken?: string;

    getClientSafeUser() {
        const { passwordHash, ...clientSafeUser } = this;
        clientSafeUser.trialDeclined = !!clientSafeUser.trialDeclined;
        clientSafeUser.expandedContent = !!clientSafeUser.expandedContent;
        clientSafeUser.isOnTrial = !!clientSafeUser.isOnTrial;
        clientSafeUser.trialUsed = !!clientSafeUser.trialUsed;

        return clientSafeUser;
    }

    async get(id: number, includeUnsafeFields?: boolean) {
        if(includeUnsafeFields) {
            return super.get(id);
        }
        
        await super.get(id);
        return this.getClientSafeUser();
    }
}