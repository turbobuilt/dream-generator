import { callMethod } from "@/lib/callMethod";

export interface CreateOrganizationData {
    organization: Organization;
    microsoftUsers: MicrosoftUser[];
}

export function postCreateOrganization(data: CreateOrganizationData): Promise<void> {
    return callMethod("postCreateOrganization", arguments);
}
