export class EnvironmentVariableVO {
    id: string;
    name: string;
    value: string;
    processDefinition: string;
}

export class EnvVariableVO {
    processDefinitionId: string;
    envVariableRequestVOList: EnvironmentVariableVO[];
    deletedColumnIDList: any[];
}
