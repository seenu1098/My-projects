export class Permission {
    id: number;
    tenantId: string;
    securityId: number;
    groupId: number;
    createAllowed = false;
    readAllowed = false;
    updateAllowed = false;
    deleteAllowed = false;
    showAllowed = false;
    pageName: string;
    version: string;
}

export class ImageGrid {
    imageGridLabel: string;
    imageGridName: string;
    noOfRows: number;
    noOfColumns: number;
    height: number;
    width: number;
    position: string;
}

export class Card {
    borderColor: string;
    hoverColor: string;
    noOfRows: number;
    noOfColumns: number;
}


export class Security {
    securityId: number;
    deletedIDList: number[] = [];
    permissionsVOList: Permission[];
}

export class Validator {
    type: string;
    value: string;
}

export class HyperLink {
    link: string;
    linkName: string;
}

export class GroupValidation {
    required = false;
    conditionalFields: ConditonFields[];
    requiredFields: ConditonFields[];
}

export class OptionsValue {
    code: any;
    description: string;
}

export class DBData {
    tableName: string[];
    keyColumnName: string;
    descriptionColumnName: string;
    joinClause?: string;
    autoCompleteColumnName: string;
    filters?: Filter[];
    filterValue: any;
    sortBy: SortBy[] = [];
    loadFirstOption: boolean;
}


export class SortBy {
    sortColumnName: string;
    sortType: boolean;
}

export interface Filter {
    columnName: string;
    value: string;
    dataType: string;
    valueType: string;
    fieldName: string;
    operator?: string;
    allowWhenMatched: boolean;
    dateFormat: string;

}
export class LabelType {
    labelName: string;
    labelOption = 'floating';
    labelStyle: string;
    labelSize: string;
    labelPosition: string;
}

export class Select {
    optionType?: string;
    optionsValues: OptionsValue[] = [];
    filter?: DBData;
    filters?: Filter[];
}

export class ConditionalDetails {
    option = false;
    fields: ConditonFields[];
}

export class ConditonFields {
    fieldName: string;
    fieldLabel: string;
    value: string;
    dataType: string;
}
export class Button {
    buttonType?: any;
    screenType: string;
    parameterFieldNames: string[];
    targetPageName: string;
    targetPageId: string;
    targetPageColumnName: string;
    targetPageColumnId: string;
    saveAndCallWorkflow: boolean;
    workflowKey: string;
    workflowVersion: string;
}

export class Grid {
    gridId: string;
    numberOfClicks: number;
    screenType: string;
    targetPageId: string;
}

export class OnSelection {
    onSelectionChange = false;
    fieldType: string;
    loadDataLabel: string;
    targetPageId: string;
    passParameter: string;
    pageType: string;
    version: number;
}

export class TabbedMenu {
    menuId: string;
    menuOrientation: string;
}

export class DateValidation {
    dateValidation: boolean;
    // allowFutureDate = true;
    fromField: string;
    operator: string;
    toField: string;
}

export class NumberFieldValidation {
    numberFieldValidation: boolean;
    fromField: string;
    operator: string;
    toField: string;
}

export class Column {
    headerName: string;
    dataType: string;
    name: string;
}

export class Table {
    headerOrientation: string;
    noOfRows: number;
    isChildTable: boolean;
    tableName: string;
    tableId: string;
    columns: FieldConfig[] = [];
    enableColumnLevelComputation = new TableComputation();
    enableRowLevelComputation = new TableComputation();
    enableSequnceNumber: boolean;
    headerColor: string;
    borderStyle: string;
    computeFields: string[];
    enableRowAddition?= true;
}

export class TableComputation {
    option = false;
    computationFieldName: string;
    computationLabelName: string;
    operatorType: string;
    rowWidth: number;
}

export class Field {
    name?: string;
    defaultValue?: any;
    defaultCode?: any;

    // Button, Grid, Select, DBData
    control: any;
    label = new LabelType();
    // string, float, long, date
    dataType: string;

    fieldWidth?= 0;
    unique = false;
    dateValidation = new DateValidation();
    numberFieldValidation = new NumberFieldValidation();
    allowFutureDate = true;
    allowPastDate = true;
    editable = true;
    sensitive = false;
    enableHyperlink = false;
    dateFormat?: string;

    rows: number;
    cols: number;
    chipSize: any;

    validations?: Validator[] = [];
    conditionalChecks: ConditionalChecks;
    style?: string;
    ariaLabel?: string;
    onSelection: OnSelection;
    required: boolean;
    minLength?: number;
    maxLength?: number;
    rowBackground: string;
    isSelected: boolean;
}

export class ConditionalChecks {
    enable: ConditionalDetails;
    show: ConditionalDetails;
    required: ConditionalDetails;
}

export class FieldConfig {
    // input, button, select, date, radiobutton, checkbox, textarea,
    // multipleselect, grid, chip, paragraph, autocomplete, label, divider
    controlType?: string;
    field = new Field();
}

export class Row {
    row: number;
    rowWidth = 100;
    totalColumns: number;
    layoutDirection = 'row';
    layoutResponsiveDirection = 'column';
    layoutGap = 20;
    columns: FieldConfig[] = [];
    alignment = 'left';
    style?: string;
}

export class ResolvedSecurityForPage {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    show: boolean;
    admin: boolean;
}

export class Section {
    name: string;
    childSection = false;
    width = 100;
    collapsible = false;
    rows: Row[] = [];
    repeatable = false;
    repeatableName: string;
    border = false;
    tableName: string;
    description: string;
    primaryKey: string;
    foreignKey: string[] = [];
    conditionallyApplicable: boolean;
    fieldName: string;
    value: string;
    groupValidation: GroupValidation;
    parentTable: string;
    logicalSectionName: string;
    style?: string;
    security = new Security();
    sections: Section[] = [];
    sectionSecurity = new ResolvedSecurityForPage();
    addRepeatableSectionButtonName: any;
    removeRepeatableSectionButtonName: any;
}



export class PageField {
    fieldId: string;
    fieldName: string;
    datatype: string;
}

export class PasswordFields {
    isConfirmPassword: boolean;
    passwordToConfirm: string;
}

export class Page {
    yorosisPageId: string;
    pageName: string;
    pageId: string;
    applicationId: string;
    applicationName: string;
    description: string[];
    manageFlag = true;
    qualifier: string;
    status: string;
    security = new ResolvedSecurityForPage();
    sections: Section[] = [];
    version: number;
    layoutType: string;
    exportAsPdf: boolean;
}

export class PagePermissionVO {
    userId: any;
    groupId: any[];
    pageId: any;
    version: any;
}

export class ImageKeysVO {
    imageKeys: string[];
}

