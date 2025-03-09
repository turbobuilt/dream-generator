import { Request, Response } from 'express';
import axios from "axios";

export async function postMicrosoftGrant(req: Request, res: Response, data: MicrosoftAuthGrant) {
    let { accessToken } = data;

    try {
        let url = `https://graph.microsoft.com/v1.0/users`;
        let response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        console.log("data is", response.data);
        var users = response.data.value.map(item => { return { selected: true, ...item } });

    } catch (e) {
        console.log("error is", e.response.data);
        return res.status(400).send({ error: "Error getting users - " + e.response.data.error.message });
    }

    try {
        let url = `https://graph.microsoft.com/v1.0/groups`;
        let response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        console.log("data is", response.data);
        var groups = response.data.value;

    } catch (e) {
        console.log("error is", e.response.data);
        return res.status(400).send({ error: "Error getting groups - " + e.response.data.error.message });
    }

    // get group members
    let promises = [];
    for (let group of groups) {
        promises.push((async function () {
            try {
                let result = await axios.get(`https://graph.microsoft.com/v1.0/groups/${group.id}/members`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                return { users: result.data.value, group };
            } catch (e) {
                console.log("error is", e.response.data);
                return { error: "Error getting group members - " + e.response.data.error.message, group };
                // return res.status(400).send({ error: "Error getting group members - " + e.response.data.error.message });
            }
        })());
    }
    let groupMembers = (await Promise.all(promises));
    return res.json({ users, groups, groupMembers });
}




export interface MicrosoftAuthGrant {
    authority: string
    uniqueId: string
    tenantId: string
    scopes: string[]
    account: Account
    idToken: string
    idTokenClaims: IdTokenClaims2
    accessToken: string
    fromCache: boolean
    expiresOn: string
    extExpiresOn: string
    correlationId: string
    requestId: string
    familyId: string
    tokenType: string
    state: string
    cloudGraphHostName: string
    msGraphHost: string
    fromNativeBroker: boolean
}

export interface Account {
    homeAccountId: string
    environment: string
    tenantId: string
    username: string
    localAccountId: string
    name: string
    authorityType: string
    tenantProfiles: TenantProfiles
    idTokenClaims: IdTokenClaims
    idToken: string
}

export interface TenantProfiles { }

export interface IdTokenClaims {
    aud: string
    iss: string
    iat: number
    nbf: number
    exp: number
    email: string
    name: string
    nonce: string
    oid: string
    preferred_username: string
    rh: string
    sub: string
    tid: string
    uti: string
    ver: string
}

export interface IdTokenClaims2 {
    aud: string
    iss: string
    iat: number
    nbf: number
    exp: number
    email: string
    name: string
    nonce: string
    oid: string
    preferred_username: string
    rh: string
    sub: string
    tid: string
    uti: string
    ver: string
}
