export class ElementConfigVO {
    id: number;
    label: string;
    fieldName: string;
    fieldType: string;
    controlType: string;
    mandatory: string;
    applicable: string;
    matchQuery: string;
    fallbackQuery1: string;
    fallbackQuery2: string;
    elementLabel: string;
    json: any;
}

export class ElementConfigListVO {
    id: number;
    labelNames: string;
    empty: '';
    fieldName: string;
    fieldType: string;
    isMandatory: string;
    applicable: string;
    matchQuery: string;
    fallbackQuery1: string;
    fallbackQuery2: string;
    elementLabel: string;
    controlType: string;
    json: any;
}
