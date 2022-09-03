export class CustomAttributeListVO {
    id: string;
    name: string;
    value: string;
    dataType: string;
    required: boolean;
}

export class CustomAttributeVO {
    customAttributeListVo: CustomAttributeListVO[];
    deletedColumnIDList: any[];
}
