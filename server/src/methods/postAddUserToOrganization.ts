import { Request, Response } from 'express';

export async function postAddUserToOrganization(req: Request, res: Response, data: { user: { email: string, permissions: string[] }, organization: number }) {
    let { user, organization } = data;
    // json agg
    let [[org]] = await global.db.query(`
        SELECT Organization.*, JSON_ARRAYAGG(OrganizationAuthenticatedUserPermission.permission) as permissions
        FROM Organization
        LEFT JOIN OrganizationAuthenticatedUserPermission ON (OrganizationAuthenticatedUserPermission.organization = Organization.id AND OrganizationAuthenticatedUserPermission.authenticatedUser = ${req.authenticatedUser.id})
        WHERE id = ?
        GROUP BY Organization.id
    `, [organization]);
    if (!org) {
        res.status(400).send('Organization not found');
        return;
    }
    if (!org.permissions.includes('manage_users')) {
        res.status(403).send('You do not have permission to add users to this organization');
        return;
    }
}