export class EnvironmentVO {
    environmentId: number;
    environmentName: string;
    targetFolder: String;
    protocol: string;
    host: string;
    port: string;
    logonType: string;
    userName: string;
    password: string;
    pemText: string;
    dbType: string;
    dbHost: string;
    dbPort: string;
    dbName: string;
    dbUsername: string;
    dbPassword: string;
    schemaName: string;
    completionQuery: string;
    tcnQuery: string;
}

export class EnvironmentListVO {
    id: number;
    environmentNames: string;
}



