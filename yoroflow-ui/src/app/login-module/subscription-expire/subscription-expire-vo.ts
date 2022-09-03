export class SubscriptionExpireVO {
    billingType: string;
    planType: string;
    subscriptionAmount: number;
    customerId: number;
    subscriptionId: string;
    customerPaymentId: string;
    subdomainName: any;
    planId: number;
    quantity: number;
    subscriptionStartDate: any;
    subscriptionEndDate: any;
    isUpgrade: boolean;
    username: string;
    usersIdList: any[] = [];
    teamsIdList: any[] = [];
    workflowsIdList: any[] = [];
    taskboardsIdList: any[] = [];
    documentsIdList: any[] = [];
    workspaceIdList: any[] = [];
    isRandomUser: boolean;
    isRandomTeam: boolean;
    isRandomWorkflow: boolean;
    isRandomTaskboard: boolean;
    isRandomDocument: boolean;
    isRandomWorkspace: boolean;
}