import { callMethod } from "@/lib/callMethod";

export interface MicrosoftAuthGrant {
    authority: string;
    uniqueId: string;
    tenantId: string;
    scopes: string[];
    account: Account;
    idToken: string;
    idTokenClaims: IdTokenClaims2;
    accessToken: string;
    fromCache: boolean;
    expiresOn: string;
    extExpiresOn: string;
    correlationId: string;
    requestId: string;
    familyId: string;
    tokenType: string;
    state: string;
    cloudGraphHostName: string;
    msGraphHost: string;
    fromNativeBroker: boolean;
}

export function postMicrosoftGrant(data: MicrosoftAuthGrant) {
    return callMethod("postMicrosoftGrant", arguments);
}
