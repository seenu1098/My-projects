export class CustomerVO {
    id: number;
    orgName: string;
    actualDomainName = '';
    timezone: string;
    defaultLanguge: string;
    allowedDomainNames: string[];
    subdomainName = '';
    userEmailId = '';
    contactEmailId: string;
    password: string;
    confirmPassword: string;
    firstName = '';
    lastName = '';
    invitationCode = '';
    logo: FormData;
    themeName: string;
    image: string;
    themeId: string;
    organizationUrl: string;
    twoFactor: boolean;
    backgroundImage: string;
    dataSourceName: string;
    serverFarm: string;
    startDate: any;
    endDate: any;
    maximumUsers: any;
    type: string;
    customerPaymentId: string;
    authenticationMethod: string[];
    organizationDiscountList: PricingDiscountVO[];
    orgPlanType: string;
    orgBillingType: string;
    subscriptionEndDate: string;
    subscriptionStartDate: string;
    isPayingCustomer: string;
}
export class discountDetailsVO {
    customerId: Number;
    billingType: string;
    planType: string;
    subscriptionAmount: Number;
    subdomainName: string;
    planId: Number;

}

export class PricingDiscountVO {
    id: number;
    planname: string;
    monthlyPrice: number;
    yearlyPrice: number;
    discountId: number;
    amountPerUserMonthly: number;
    amountPerUserYearly: number;
    basePrice: number;
}

export class customMenuVO {
    customMenuList: CustomMenuList[] = [];
    subdomainName: any;
}

export class CustomMenuList {
    id: string;
    defaultMenu: string;
    customMenuName: string;
    displayName: string;
}

export class OrganizationSMSKeys {
    organizationSmsKeys: SMSKeysVO[] = [];
    deleteKeys: any[] = [];
    subdomainName: any;
}

export class SMSKeysVO {
    id: string;
    providerName: string;
    secretKey: string;
    secretToken: string;
    fromPhoneNumber: string;
    serviceName: string;
}

export class updateCustomerVO {
    id: number;
    orgName: string;
    actualDomainName = '';
    timezone: string;
    defaultLanguge: string;
    allowedDomainNames: string[];
    subdomainName = '';
    themeId: string;
    organizationUrl: string;
    twoFactor: boolean;
    backgroundImage: string;
    logo: FormData;
    authenticationMethod: string[];
    organizationDiscountList: PricingDiscountVO[];
    startDate: any;
    endDate: any;
    orgPlanType: string;
    orgBillingType: string;
}

export class SubscriptionVO {
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
}

export class EmailSettingsVOList {
    orgEmailsettingsArray: EmailSettingsVO[] = [];
    deletedEmailSettingIdList: any[] = [];
    subdomainName: any;
}

export class EmailSettingsVO {
    id: any;
    settingName: string;
    settingData: EmailSettingsDataVO;
}

export class EmailSettingsDataVO {
    hostName: string;
    username: string;
    port: number;
    password: string;
    smtpAuth: boolean;
    starttlsEnable: boolean;
}
