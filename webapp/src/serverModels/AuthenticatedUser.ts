export class AuthenticatedUser {
    name?: string;
    email?: string;
    passwordHash?: string;
    creditsRemaining?: number;
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
    stripeId?: any;
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

    async get(id: number, includeUnsafeFields: boolean) {
        if(includeUnsafeFields) {
                    return super.get(id);
                }

        await super.get(id);
        return this.getClientSafeUser();
    }
}
