import { Request, Response } from 'express';
import { Organization as LocalOrganization } from '../models/Organization';
import { AuthenticatedUser } from "../models/AuthenticatedUser";
import { AuthenticatedUserOrganization } from '../models/AuthenticatedUserOrganization';

export async function postCreateOrganization(req: Request, res: Response, data: CreateOrganizationData) {
    // count orgs where the owner is the current user
    let [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM Organization WHERE owner = ?', [req.authenticatedUser.id]);
    if (count > 20) {
        res.status(400).send('You already own too many organizations.');
        return;
    }

    let organization = new LocalOrganization();
    organization.name = data.organization.name;
    organization.owner = req.authenticatedUser.id;
    await organization.save();

    let authenticatedUserOrganization = new AuthenticatedUserOrganization();
    authenticatedUserOrganization.organization = organization.id;
    authenticatedUserOrganization.authenticatedUser = req.authenticatedUser.id;
    authenticatedUserOrganization.accepted = true;
    await authenticatedUserOrganization.save();

    let promises = [];
    for (let microsoftUser of data.microsoftUsers) {
        promises.push((async function () {
            if (!microsoftUser.user.selected)
                return null;

            let [[authenticatedUser]] = await db.query(`SELECT * FROM AuthenticatedUser WHERE email = ?`, [microsoftUser.user.mail.toLowerCase()]) as AuthenticatedUser[][];
            if (!authenticatedUser) {
                authenticatedUser = new AuthenticatedUser();
                authenticatedUser.microsoftId = microsoftUser.user.id;
                authenticatedUser.createdBy = req.authenticatedUser.id;
                authenticatedUser.name = microsoftUser.user.displayName;
                authenticatedUser.email = microsoftUser.user.mail.toLowerCase();
                await authenticatedUser.save();
            }
            if (!authenticatedUser.microsoftId) {
                // authenticatedUser.microsoftId = microsoftUser.user.id;
                // await authenticatedUser.save();
            }
            // check for duplicates
            let [[authenticatedUserOrganization]] = await db.query(`SELECT * FROM AuthenticatedUserOrganization WHERE authenticatedUser = ? AND organization = ?`, [authenticatedUser.id, organization.id]) as AuthenticatedUserOrganization[][];
            if (!authenticatedUserOrganization) {
                authenticatedUserOrganization = new AuthenticatedUserOrganization();
                authenticatedUserOrganization.createdBy = req.authenticatedUser.id;
                authenticatedUserOrganization.authenticatedUser = authenticatedUser.id;
                authenticatedUserOrganization.organization = organization.id;
                authenticatedUserOrganization.accepted = true;
                await authenticatedUserOrganization.save();
            }
            return { authenticatedUser, authenticatedUserOrganization };
        })());
    }
    let results = await Promise.all(promises);
    res.json({ organization, users: results });
}

export interface CreateOrganizationData {
    organization: Organization
    microsoftUsers: MicrosoftUser[]
}

export interface Organization {
    id: any
    name: string
}

export interface MicrosoftUser {
    user: User
    groups: Group[]
}

export interface User {
    selected: boolean
    businessPhones: any[]
    displayName: string
    givenName: any
    jobTitle: any
    mail: string
    mobilePhone: any
    officeLocation: any
    preferredLanguage?: string
    surname: any
    userPrincipalName: string
    id: string
}

export interface Group {
    id: string
    deletedDateTime: any
    classification: any
    createdDateTime: string
    creationOptions: any[]
    description: any
    displayName: string
    expirationDateTime: any
    groupTypes: any[]
    isAssignableToRole: any
    mail: any
    mailEnabled: boolean
    mailNickname: string
    membershipRule: any
    membershipRuleProcessingState: any
    onPremisesDomainName: any
    onPremisesLastSyncDateTime: any
    onPremisesNetBiosName: any
    onPremisesSamAccountName: any
    onPremisesSecurityIdentifier: any
    onPremisesSyncEnabled: any
    preferredDataLocation: any
    preferredLanguage: any
    proxyAddresses: any[]
    renewedDateTime: string
    resourceBehaviorOptions: any[]
    resourceProvisioningOptions: any[]
    securityEnabled: boolean
    securityIdentifier: string
    theme: any
    uniqueName: any
    visibility: any
    onPremisesProvisioningErrors: any[]
    serviceProvisioningErrors: any[]
}
