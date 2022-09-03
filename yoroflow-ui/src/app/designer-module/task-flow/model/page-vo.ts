import { TableObjectsVO } from "../../../creation-module/table-objects/table-object-vo";


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
    assigneeUser: any;
    assigneeGroup: any[] = [];
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

export class OptionsValue {
    code: string;
    description: string;
}

export class SortBy {
    sortColumnName: string;
    sortType: boolean;
}

export class ApplicationLayoutPage {
    pageId: string;
    version: number;
}

export class DBData {
    tableName: string[];
    keyColumnName: string;
    descriptionColumnName: string;
    joinClause?: string;
    sortBy: SortBy[] = [];
    sortOption: boolean;
    filters?: Filter[];
    loadFirstOption: boolean;
}

export interface Filter {
    columnName: string;
    value: string;
    dataType: string;
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
}

export class GroupValidation {
    required = false;
    conditionalFields: ConditonFields[];
    requiredFields: ConditonFields[];
}

export class HyperLink {
    link: string;
    linkName: string;
}

export class ConditionalDetails {
    option = false;
    fields: ConditonFields[];
}

export class ConditonFields {
    fieldName: string;
    fieldLabel: string;
    value: string;
}

export class FileUpload {
    fileType: string;
}
export class Button {
    buttonType?: any;
    screenType: string;
    parameterFieldNames: string[];
    targetPageName: string;
    targetPageId: string;
    targetPageColumnName: string;
    targetPageColumnId: string;
}

export class TabbedMenu {
    menuId: string;
    menuOrientation: string;
}

export class Grid {
    gridId: string;
    numberOfClicks: number;
    screenType: string;
    targetPageId: string;
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
    editable = true;
    sensitive = false;
    enableHyperlink = false;
    dateFormat?: string;

    rows: number;
    cols: number;

    validations?: Validator[] = [];
    conditionalChecks: ConditionalChecks;
    style?: string;
    ariaLabel?: string;
    required: boolean;
    rowBackground: string;
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
    rowBackground = '#ffffff';
}

export class ResolvedSecurityForPage {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
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
    groupValidation: GroupValidation;
    fieldName: string;
    value: string;
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
    controlType: string;
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
}

export class TableComputation {
    option = false;
    computationFieldName: string;
    computationLabelName: string;
    operatorType: string;
    rowWidth: number;
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
    isWorkflowForm = false;
    layoutType: string;
    version: any;
    saveAndCallWorkflow: boolean;
    workflowKey: string;
    workflowVersion: string;
    exportAsPdf: boolean;
    required: boolean;
    publicAccess: boolean;
    printConfiguration = new PrinterConfiguration();
    printFieldsList = new PrintFieldList();
    tableObjectListVO: TableObjectsVO[] = [];
    taskId: string;
    count = 0;
    type: string;
}


export class FieldName {
    label: string;
    name: string;
}

export class PrinterConfiguration {
    rowOfPrintFields: RowOfPrintFields[] = [];
}

export class PrintFieldList {
    rowOfFields: RowOfFields[] = [];
}

export class RowOfPrintFields {
    repeatableSection: boolean;
    horizontalLine: boolean;
    numberOfNewLines: number;
    printFieldColumns: PrintField[] = [];
}

export class PrintField {
    label: string;
    fieldName: string;
    fontSize: string;
    isBold: boolean;
    alignment: string;
    addNewLine: boolean;
    numberOfNewLines: number;
    repeatableSectionName: string;
    beforeSpace: number;
    afterSpace: number;
    cutPaper: number;
    fieldType: string;
    value: string;
    timeFormat: string;
    dateFormat: string;
    horizontalLine: boolean;
    replaceValue: ReplaceValue[] = [];
    nonPrintedValues: any[] = [];
    matchType: string;
}

export class ReplaceValue {
    replaceValue: string;
    replaceWith: string;
}

export class RowOfFields {
    placeholder: Placeholder[] = [];
    repeatable: boolean;
}

export class Placeholder {
    chip: any;
    fieldType: any;
}

export class ExportPages {
    pageId: string;
    version: number;
    taskId: string;
    taskName: string;
}

export class TableListVO {
    tableList: string[];
}

export class PageIdListVO {
    uuidList: string[] = [];
}
