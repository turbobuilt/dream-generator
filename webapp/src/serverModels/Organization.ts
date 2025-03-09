export class Organization {
    name?: string;
    microsoftId?: string;
    owner?: number;
}

export class OrganizationAuthenticatedUser {
    organization?: number;
    authenticatedUser?: number;
}

export class OrganizationAuthenticatedUserGroup {
    organization?: number;
    user?: number;
    groupId?: number;
}
