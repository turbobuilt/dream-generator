import { DbObject } from "../lib/db";

export class Organization extends DbObject {
    name: string;
    microsoftId: string;
    owner: number;
}

export class OrganizationAuthenticatedUser extends DbObject {
    organization: number;
    authenticatedUser: number;
}

export class OrganizationAuthenticatedUserGroup extends DbObject {
    organization: number;
    user: number;
    groupId: number;
}