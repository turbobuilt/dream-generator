import { Request, Response } from "express";

export async function getOrganization(req: Request, res: Response, id: any) {
    let [[organization]] = await db.query(`SELECT Organization.* 
        FROM Organization
        JOIN AuthenticatedUserOrganization ON Organization.id = AuthenticatedUserOrganization.organization
        WHERE AuthenticatedUserOrganization.authenticatedUser = ${req.authenticatedUser.id}`);
    if (!organization) {
        return res.json({ error: "That organization was not found, or you are not authorized to view it." })
    }
    return res.json(organization);
}