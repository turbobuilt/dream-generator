import { DbObject } from "../lib/db";
import { AuthenticatedUser } from "./AuthenticatedUser";
import { Organization } from "./Organization";

export class AuthenticatedUserOrganization extends DbObject {
    authenticatedUser: number;
    organization: number;
    accepted: boolean;
}