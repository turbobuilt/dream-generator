export interface ActiveDirectoryInfo {
    users: User[]
    groups: Group[]
    groupMembers: GroupMember[]
  }
  
  export interface User {
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
    selected: boolean
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
  
  export interface GroupMember {
    users: GroupMemberUserRecord[]
    group: Group2
  }
  
  export interface GroupMemberUserRecord {
    "@odata.type": string
    id: string
    businessPhones: any[]
    displayName: string
    givenName: any
    jobTitle: any
    mail: string
    mobilePhone: any
    officeLocation: any
    preferredLanguage: any
    surname: any
    userPrincipalName: string
  }
  
  export interface Group2 {
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
  