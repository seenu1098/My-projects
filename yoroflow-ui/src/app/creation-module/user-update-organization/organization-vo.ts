export class OrganizationVO {
    id: number;
    orgName: string;
    actualDomainName = '';
    allowedDomainNames: string[];
    subdomainName = '';
    logo: FormData;
    themeName: string;
    image: string;
    themeId: string;
    organizationUrl: string;
    backgroundImage: string;
    type: string;
    customerPaymentId: string;
    timezone:string;
}
