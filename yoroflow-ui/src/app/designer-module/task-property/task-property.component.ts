import { Component, OnInit, Inject, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, FormControl, EmailValidator } from '@angular/forms';
import { TaskPropertyService } from './task-property.service';
import { TaskProperty } from './task-property-vo';
import { YoroFlowConfirmationDialogComponent } from '../../designer-module/yoroflow-confirmation-dialog-component/yoroflow-confirmation-dialog-component.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { YoroFLowChipComponent } from '../../designer-module/chip/yoroflow-chip.component';
import { Observable } from 'rxjs';
import { map, startWith, throwIfEmpty } from 'rxjs/operators';
import { CreateFormDialogComponent } from '../create-form-dialog-box/create-form-dialog-box.component';
import { PageFieldVo, PageFieldVO, remainderForm, SMSKeyWorkflowVO, TimeZoneVo } from './page-field-vo';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { UserVO } from './model/user-vo';
import { GroupVO } from './model/group-vo';
import { DatePipe } from '@angular/common';
import cronstrue from 'cronstrue';
import { YoroSecurityComponent } from '../../rendering-module/yoro-security/yoro-security.component';
import { LoaderService } from '../../rendering-module/shared/service/form-service/loader-service';
import { PagePermissionVO } from './model/permission-vo';
import { MatRightSheet } from 'mat-right-sheet';
import { TableCreationDialogBoxComponent } from '../../designer-module/table-creation-dialog-box/table-creation-dialog-box.component';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { SmsKeyGenerationComponent } from '../../creation-module/sms-key-generation/sms-key-generation.component';
import { RemainderDialogComponent } from '../remainder-dialog/remainder-dialog.component';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { stringify } from '@angular/compiler/src/util';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { WorkflowDashboardService } from 'src/app/engine-module/work-flow-dashboard/workflow-dashboard.service';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { ClipboardModule, ClipboardService } from 'ngx-clipboard';
import { TeamListComponent } from '../../workspace-module/team-list/team-list.component';
import { TaskboardOwnerDialogComponent } from '../../taskboard-module/taskboard-owner-dialog/taskboard-owner-dialog.component';
export interface User {
  datatype: string;
  value: any;
}

export interface Placeholder {
  name: any;
}

export class FieldName {
  index: number;
  value: string;
}

export class ArrayFields {
  fieldName: string;
  value: any;
}

@Component({
  selector: 'app-task-property',
  templateUrl: './task-property.component.html',
  styleUrls: ['./task-property.component.scss']
})
export class TaskPropertyComponent implements OnInit {
  error: any;
  getData: any;
  message: any;
  selectedField: any;
  decisionTableRowIndex: any;
  decisionTableColumnIndex: any;
  decisionType: string;
  webServiceTaskRowIndex: number;
  dbTaskColumnIndex: number;
  changedDataType: any;
  smsData: any;
  constructor(private loaderservice: LoaderService,
              public dialogRef: MatDialogRef<TaskPropertyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private taskPropertyService: TaskPropertyService,
              private dialog: MatDialog, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private datePipe: DatePipe,
              private rightSheet: MatRightSheet,
              private workflowDashboardService: WorkflowDashboardService,
              private _clipboardService: ClipboardService
  ) { }
  public config: PerfectScrollbarConfigInterface = {};
  enableLeftVariableTypeConstant = false;
  enableRightVariableTypeConstant = false;
  filteredOptions: Observable<User[]>;
  launchTextAreaEnable: boolean;
  value: any;
  selectEventData: any;
  taskPropertyForm: FormGroup;
  conditionForm: FormGroup;
  pageIdList: any[];
  selectFormEnable = false;
  taskPropertyVO = new TaskProperty();
  taskType = this.data.taskType;
  editFormOptionEnable = false;
  emailTaskFormInfo: any;
  filterDataType = {};
  tableColumnName = {};
  assignmentGroup: any;
  enableEditconstantField = false;
  enableDataType = false;
  setRightOperatorValue: any;
  dataTypeDialog: any;
  fieldsList: PageFieldVO[];
  arrayFields: PageFieldVO[];
  tableFields: PageFieldVO[];
  fieldsListForMapping: PageFieldVO[] = [];
  repeatableFieldsListForMapping: PageFieldVO[] = [];
  repeatableFieldsListFormName: PageFieldVO[] = [];
  initialFieldList: PageFieldVo[];
  initialFieldListForExcel: PageFieldVo[] = [];
  initialFieldListForEmail: PageFieldVo[];
  workflowList: any[] = [];
  workflowWebServiceFieldValues: any[] = [];
  enableFieldMapping = false;
  loadUserTypeApprovelTypeForm = false;
  jsonValue: any;
  jsonSuccessValue: any;
  jsonErrorValue: any;
  columnValues = {};
  columnValuesLength = 0;
  aliasFormEnable = false;
  enableTableColumns = false;
  checkedColumns = false;
  fieldNameValidation = false;
  enableQueryFields = false;
  duplicateFieldName = null;
  duplicateEventId: any;
  duplicateTable = false;
  enableFiltersButton = true;
  enableOrdersButton = true;
  loadTableName: any;
  webServiceFields: any;
  loadTableId: any;
  enableLoadCallWorkflowFieldValues = false;
  enablePageFieldForFilter = false;
  enableConstantForFilter = false;
  enableFilterSortLimit = false;
  duplicateOrderValue = false;
  duplicateFilters = false;
  duplicateFilterValues = false;
  duplicateOrders = false;
  duplicateFields = false;
  aliasFieldEnable = false;
  enableConstantForInsertValue = false;
  enablePageFieldForInsertValue = true;
  workflowName: any;
  removedCondition: any;
  tableName: any;
  tableAndFieldName: any;
  tableAndFilterName: any;
  filterOperatorValue: any;
  whereFilterValue: any;
  whereFilterCondition: any;
  orderFieldValue: any;
  orderCondition: any;
  enableWebServiceForCallAnotherWorkflow = false;
  operator: string;
  disableSetOperator: any;
  page: any;
  pageRendered = false;
  editFormSpinner = false;
  isCustomPage = false;
  showConstantEmails = false;
  showConstantEmailsCC = false;
  showConstantEmailsBCC = false;
  permission = new PagePermissionVO();
  autocompleteInitialFieldList: PageFieldVO[] = [];
  pageName: string;
  errorSelectNumber: number;
  URL: any[] = [];
  publicFormUrl: string;
  publicAccess = false;
  isPublic = false;
  pageFields: User[] = [
    {
      datatype: 'number',
      value: 'noOfDays'
    },
    {
      datatype: 'number',
      value: 'numberFiledTwo'
    },
    {
      datatype: 'text',
      value: 'textFieldOne'
    },
    {
      datatype: 'text',
      value: 'textFieldTwo'
    },
    {
      datatype: 'date',
      value: 'dateFieldOne'
    },
    {
      datatype: 'date',
      value: 'dateFieldTwo'
    },
  ];
  fieldNames: string[] = [];
  fieldNamesValidation: string[] = [];
  fieldNamesForAlias: string[] = [];
  orderFieldNames: string[] = [];
  orderFilterNames: string[] = [];
  tableNames: string[] = [];
  tableIds: string[] = [];
  orderFields: FieldName[] = [];
  filterValues: string[] = [];
  fieldSplitValues: string[] = [];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  cronExpression: string;
  conditionsList: string[] = [];
  variableLists: string[] = [];
  conditionsListCount: number[] = [1];
  enableAddVariables = false;
  disableAddVariable = true;
  enableDecisionCreate = true;
  hide = false;
  updateDbTaskValidation = true;
  isArrayExcel = false;
  arrayMappingDetails: ArrayFields[] = [];
  decisionDataType = '';
  decisionRowIndex: number;
  filterOperator =
    [{ value: '=', description: '=' },
    { value: '!=', description: '!=' },
    { value: 'IN', description: 'IN' },
    { value: 'NOT IN', description: 'NOT IN' },
    { value: 'IS NULL', description: 'IS NULL' },
    { value: 'IS NOT NULL', description: 'IS NOT NULL' },
    ];

  dataType = {
    number: [{ value: 'eq', description: 'equals' },
    { value: 'ne', description: 'not equals' },
    { value: 'gt', description: 'greater than' },
    { value: 'ge', description: 'greater than or equal to' },
    { value: 'lt', description: 'less than' },
    { value: 'le', description: 'less than or equal to' },
    ],
    text: [
      { value: 'eq', description: 'equals' },
      { value: 'ne', description: 'not equals' },
      { value: 'bw', description: 'begins with' },
      { value: 'ew', description: 'ends with' },
      { value: 'cn', description: 'contains' },
    ],
    string: [
      { value: 'eq', description: 'equals' },
      { value: 'ne', description: 'not equals' },
      { value: 'bw', description: 'begins with' },
      { value: 'ew', description: 'ends with' },
      { value: 'cn', description: 'contains' },
    ],
    date: [
      { value: 'eq', description: 'equals' },
      { value: 'gt', description: 'greater than' },
      { value: 'lt', description: 'less than' },
    ],
    boolean: [
      { value: 'eq', description: 'equals' },
      { value: 'ne', description: 'not equals' },
    ]
  };
  emailData: any;
  emailToChip: YoroFLowChipComponent;
  emailBccChip: YoroFLowChipComponent;
  emailCcChip: YoroFLowChipComponent;
  test: boolean;
  userList: UserVO[];
  groupList: GroupVO[];
  jsonPlaceHolder = 'Ex:{"key1":"value1","key2":value2}';
  timezoneVo = new TimeZoneVo();
  SMSProviderNameList: SMSKeyWorkflowVO[];
  enableRemainder = false;
  startIndexNumber: any;
  repeatedEmails: string[];
  repeatedField: string;
  public editor;
  public editorContent = '<h3>Type Something...</h3>';
  public editorOptions = {
    theme: 'snow',
    modules: {
      toolbar: {
        container:
          [
            [{ placeholder: ['[GuestName]', '[HotelName]'] }], // my custom dropdown
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ header: 1 }, { header: 2 }],               // custom button values
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],      // superscript/subscript
            [{ indent: '-1' }, { indent: '+1' }],          // outdent/indent
            [{ direction: 'rtl' }],                         // text direction

            [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ header: [1, 2, 3, 4, 5, 6, false] }],

            [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
            [{ font: [] }],
            [{ align: [] }],

            ['clean']                                    // remove formatting button

          ],
        handlers: {
          placeholder(value) {
            if (value) {
              const cursorPosition = this.quill.getSelection().index;
              this.quill.insertText(cursorPosition, value);
              this.quill.setSelection(cursorPosition + value.length);
            }
          }
        }
      }
    }
  };

  iconList = [
    { type: 'long', icon: 'pin' },
    { type: 'string', icon: 'text_fields' },
    { type: 'float', icon: 'pin' },
    { type: 'date', icon: 'date_range' },
    { type: 'array', icon: 'list_alt' },
    { type: 'time', icon: 'query_builder' },
    { type: 'uuid', icon: 'badge' }
  ];
  fieldList: PageFieldVo[] = [];
  leftAssignmentDataType = 'string';
  roleIndex: any;
  decisionTaskFieldType: string;
  constantValueForm: FormGroup;
  licenseVO = new LicenseVO();
  isScheduleAllowed = false;
  isWebServiceAllowed = false;
  isPublicFormEnabled = true;
  @ViewChild('emailTemplatePosition') emailTemplatePosition: ElementRef;

  @ViewChild('menuTrigger1') mainSectionFieldMenu;
  @ViewChild('menuTrigger2') repeatableNameMenu;
  @ViewChild('menuTrigger3') subSectionFieldsMenu;
  @ViewChild('menuTrigger4') decisionTaskMenu;
  @ViewChild('menuTrigger5') menu;
  @ViewChild('menuTriggerMap') menuMap;
  @ViewChild('menuTrigger10') desicionMenu;

  @Output() emailReset: EventEmitter<any> = new EventEmitter<any>();
  @Output() systemReset: EventEmitter<any> = new EventEmitter<any>();
  @Output() smsReset: EventEmitter<any> = new EventEmitter<any>();

  systemData: any;
  selectedLang: any;
  teamList: any[] = [];
  assigneeUserColorArray = ['#df340e', '#172b4d', '#5244ab', '#0151cc'];
  assignUsersList: any[] = [];
  ngOnInit() {
    this.selectedLang = localStorage.getItem('translate_lang');
    if (this.selectedLang === undefined || this.selectedLang === null || this.selectedLang === 'null' || this.selectedLang === '') {
      this.selectedLang = 'en';
    }
    this.constantValueForm = this.formBuilder.group({
      constantValue: [''],
    });
    this.checkWebServiceWorkflows();
    this.checkScheduleWorkflows();
    this.checkPublicFormEnabled();
    if (this.data.remainder && this.data.remainder === true) {
      this.smsData = this.data.propertyName.mesageBody;
      this.taskType = this.data.taskType;
      this.initialFieldList = this.data.initialFieldList;
      this.initializeForm(this.taskType);
      this.loadAutoCompleteInitialValues(this.taskType);
      if (this.taskType === 'SYSTEM_TASK') {
        this.userList = this.data.userNameList;
        this.groupList = this.data.groupNameList;
        this.systemData = this.data.propertyName.mesageBody;
      }
    }
    else {
      this.taskType = this.data.nodeData.taskType;
      this.loadGroupsList();
      this.loadUsersList();
      this.loadDefaultTimeZone();
      this.initializeForm(this.taskType);
      this.loadInitialValues();
      this.loadWorkflowList();
      this.disableComputeTaskFormControls();
    }
    this.loadProperty();
    this.SMSProviderNameList = this.data.SMSProviderNameList;
    if ((this.SMSProviderNameList === undefined || this.SMSProviderNameList === null || this.SMSProviderNameList.length === 0)
      && this.taskType === 'SMS_TASK') {
      this.loadProviderNames();
    }
    this.setPropertiesForTask();
  }

  checkScheduleWorkflows() {
    this.licenseVO.category = 'workflow_and_automations';
    this.licenseVO.featureName = 'scheduled_workflow';
    this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'Y') {
        this.isScheduleAllowed = true;
      }
    });
  }

  checkWebServiceWorkflows() {
    this.licenseVO.category = 'workflow_and_automations';
    this.licenseVO.featureName = 'web_service_workflow';
    this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'Y') {
        this.isWebServiceAllowed = true;
      }
    });
  }

  checkPublicFormEnabled() {
    this.licenseVO.category = 'form_page_builder';
    this.licenseVO.featureName = 'public_form';
    this.workflowDashboardService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'N') {
        this.isPublicFormEnabled = false;
      }
    });
  }


  loadDefaultTimeZone() {
    const type = this.data.nodeData.taskType;
    if (this.data.workflowStructure !== null && (type === 'COUNTER_TASK')) {
      this.taskPropertyService.getDefaultTimeZone().subscribe(data => {
        if (data) {
          this.timezoneVo = data;
          if (this.taskPropertyForm.get('timeZone').value === null || this.taskPropertyForm.get('timeZone').value === '') {
            this.taskPropertyForm.get('timeZone').setValue(this.timezoneVo.timeZoneCode);
          }
        }
      });
    }
  }

  loadProviderNames() {
    let type = null;
    if (this.data.nodeData) {
      type = this.data.nodeData.taskType;
    } else if (this.data.taskType) {
      type = this.data.taskType;
    }

    if (this.data.workflowStructure !== null && (this.SMSProviderNameList === undefined || this.SMSProviderNameList.length < 0)) {
      this.taskPropertyService.getProviderNames().subscribe(data => {
        if (data && data.length > 0) {
          this.SMSProviderNameList = data;
        } else if (data && data.length === 0) {
          const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
            data: { data: 'no-providers' },
          });
          dialogRef.afterClosed().subscribe(response => {
            if (response === true) {
              const dialogRef = this.dialog.open(SmsKeyGenerationComponent, {
                disableClose: true,
                height: '65%',
                width: '100vw',
                maxWidth: '90vw',
                maxHeight: '100vh',
                panelClass: 'full-screen-modal',
              });
            }
          });
        }
      });
    }
  }

  publicForm($event) {
    if (this.isPublicFormEnabled === false) {
      this.taskPropertyForm.get('publicForm').setValue(false);
      const dialog = this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { message: 'Your current plan doesn\'t support to enable this option, Please upgrade your plan' }
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          this.dialogRef.close();
        }
      });
    } else {
      this.URL = window.location.href.split('.com/', 2);
      this.taskPropertyForm.get('formIdentifier').setValue(null);
      this.taskPropertyForm.get('formVersion').setValue(null);
      this.publicFormUrl = null;
      this.enableFieldMapping = false;
      this.editFormOptionEnable = false;
      if ($event.checked === true) {
        this.taskPropertyForm.get('message').setValue('Your form submitted successfully');
      } else {
        this.taskPropertyForm.get('message').setValue('Do you want to submit this task ?');
      }
    }

  }

  loadWorkflowList() {
    const type = this.data.nodeData.taskType;
    if (type === 'CALL_ANOTHER_WORKFLOW') {
      this.taskPropertyService.getWorkflowList().subscribe(data => {
        data.forEach(field => {
          if (field.status === 'published') {
            this.workflowList.push(field);
          }
        });
      });
    }
  }

  toggleCC($event) {
    if ($event.checked === true) {
      const value = this.taskPropertyForm.value;
      if ((this.emailCcChip === undefined ||
        (this.emailCcChip && this.emailCcChip.placeholder.length === 0) || value.emailCC === null)
        && (this.taskPropertyForm.get('emailCCPageFields').value === null
          || this.taskPropertyForm.get('emailCCPageFields').value === '' ||
          this.taskPropertyForm.get('emailCCPageFields').value === [])) {
        this.taskPropertyForm.get('emailCC').setErrors({ emailCC: true });
      }
    } else {
      this.taskPropertyForm.get('emailCC').setErrors(null);
      this.taskPropertyForm.get('emailCC').setValue(null);
      this.taskPropertyForm.get('emailCCPageFields').setValue(null);
    }
  }

  toggleBCC($event) {
    if ($event.checked === true) {
      const value = this.taskPropertyForm.value;
      if ((this.emailBccChip === undefined ||
        (this.emailBccChip && this.emailBccChip.placeholder.length === 0) || value.emailBCC === null)
        && (this.taskPropertyForm.get('emailBCCPageFields').value === null
          || this.taskPropertyForm.get('emailBCCPageFields').value === '' ||
          this.taskPropertyForm.get('emailBCCPageFields').value === [])) {
        this.taskPropertyForm.get('emailBCC').setErrors({ emailBCC: true });
      }
    } else {
      this.taskPropertyForm.get('emailBCC').setErrors(null);
      this.taskPropertyForm.get('emailBCC').setValue(null);
      this.taskPropertyForm.get('emailBCCPageFields').setValue(null);
    }
  }

  loadInitialValues() {
    if (this.data.nodeData.taskType === 'EXCEL_REPORT') {
      this.addExcelColumnsFormGroup(0);
    }
    if (this.data.workflowStructure !== null) {
      const type = this.data.nodeData.taskType;
      if ((type === 'USER_TASK' || type === 'START_TASK' || type === 'WEB_SERVICE_TASK' || type === 'APPROVAL_TASK' ||
        type === 'DECISION_TASK' || type === 'DB_TASK' || type === 'CALL_ANOTHER_WORKFLOW' || type === 'SMS_TASK' ||
        type === 'EXCEL_REPORT' || type === 'COMPUTE_TASK' || type === 'DECISION_TABLE' || type === 'EMAIL_TASK') &&
        this.data.workflowStructure.startKey) {
        this.taskPropertyService.getInitialFields(this.data.workflowStructure, this.data.key).subscribe(data => {
          this.initialFieldList = data;
          if (type === 'EMAIL_TASK') {
            this.initialFieldListForEmail = this.initialFieldList;
          }
          if (type === 'EXCEL_REPORT') {
            this.initialFieldList.forEach(element => {
              if (element.fieldType === 'Workflow Variables:') {
                this.initialFieldListForExcel.push(element);
              }
            });
          }
          this.enableRemainder = true;
        });
      }

      if (!this.data.workflowStructure.startKey || this.data.workflowStructure.startKey === null) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'StarKey is mandatory'
        });
      }
      this.loadAutoCompleteInitialValues(type);
    }
  }

  loadAutoCompleteInitialValues(type) {
    let valueChangeName = null;
    if (type === 'EMAIL_TASK') {
      valueChangeName = 'emailTemplate';
    } else if (type === 'SMS_TASK') {
      valueChangeName = 'mesageBody';
    } else if (type === 'SYSTEM_TASK') {
      valueChangeName = 'mesageBody';
    } else if (type === 'EXCEL_REPORT') {
      valueChangeName = 'generatedExcelName';
    }
    if (type === 'EMAIL_TASK' || type === 'SYSTEM_TASK' || type === 'EXCEL_REPORT') {
      this.taskPropertyForm.get(valueChangeName).valueChanges.subscribe(data => {
        if (data.includes('${')) {
          const startIndex = this.getIndex('${', data);
          const endIndex = this.getIndex('}', data);
          if (startIndex.length !== endIndex.length) {
            this.taskPropertyService.getInitialFields(this.data.workflowStructure, this.data.key).subscribe(list => {
              if (list) {
                list.forEach(field => {
                  if (field.fieldType === 'Workflow Variables:' || field.fieldType === 'System Variables:'
                    || field.fieldType === 'Environment Variables:' || field.fieldType === 'Custom Attributes:'
                    || field.fieldType === this.repeatedField) {
                    field.fieldVO.forEach(fieldvo => {
                      this.autocompleteInitialFieldList.push(fieldvo);
                    });
                  }
                });
                startIndex.forEach(index => {
                  if (index - 1 === this.startIndexNumber || index + 1 === this.startIndexNumber) {
                    this.startIndexNumber = index;
                  }
                });
              }
            });
          }
        }
        if (valueChangeName === 'emailTemplate') {
          this.taskPropertyForm.get('emailTemplate').setErrors(null);
          this.taskPropertyForm.get('subject').setErrors(null);
          if (this.taskPropertyForm.get('fieldType').value === true) {
            let hasFieldId = false;
            this.repeatedEmails.forEach(fieldId => {
              if (data.includes(fieldId) || this.taskPropertyForm.get('subject').value.includes(fieldId)) {
                hasFieldId = true;
              }
            });
            if (!hasFieldId) {
              this.taskPropertyForm.get('emailTemplate').setErrors({ repeated: true });
            }
          }
        }
      });
      if (type === 'EMAIL_TASK') {
        this.taskPropertyForm.get('subject').valueChanges.subscribe(data => {
          if (data.includes('${')) {
            const startIndex = this.getIndex('${', data);
            const endIndex = this.getIndex('}', data);
            if (startIndex.length !== endIndex.length) {
              this.taskPropertyService.getInitialFields(this.data.workflowStructure, this.data.key).subscribe(list => {
                if (list) {
                  list.forEach(field => {
                    if (field.fieldType === 'Workflow Variables:' || field.fieldType === 'System Variables:'
                      || field.fieldType === 'Environment Variables:' || field.fieldType === 'Custom Attributes:'
                      || field.fieldType === this.repeatedField) {
                      field.fieldVO.forEach(fieldvo => {
                        this.autocompleteInitialFieldList.push(fieldvo);
                      });
                    }
                  });
                  startIndex.forEach(index => {
                    if (index - 1 === this.startIndexNumber || index + 1 === this.startIndexNumber) {
                      this.startIndexNumber = index;
                    }
                  });
                }
              });
            }
          }
          this.taskPropertyForm.get('subject').setErrors(null);
          this.taskPropertyForm.get('emailTemplate').setErrors(null);
          if (this.taskPropertyForm.get('fieldType').value === true) {
            let hasFieldId = false;
            this.repeatedEmails.forEach(fieldId => {
              if (data.includes(fieldId) || this.taskPropertyForm.get(valueChangeName).value.includes(fieldId)) {
                hasFieldId = true;
              }
            });
            if (!hasFieldId) {
              this.taskPropertyForm.get('subject').setErrors({ repeated: true });
            }
          }
        });
      }
    }
  }

  emailSenderValidation() {
    const emailFrom = this.taskPropertyForm.get('emailFrom');
    const senderName = this.taskPropertyForm.get('senderName');
    if (emailFrom.value !== '' && emailFrom.value !== null || senderName.value !== '' && senderName.value !== null) {
      emailFrom.setValidators([Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')]);
      senderName.setValidators([Validators.required]);
      emailFrom.updateValueAndValidity();
      senderName.updateValueAndValidity();
    } else {
      emailFrom.setValidators(null);
      senderName.setValidators(null);
      emailFrom.updateValueAndValidity();
      senderName.updateValueAndValidity();
    }
  }

  addValueForTextAreaAutoComplete(formValue: string, fieldId) {
    let value = '';
    value = formValue.substring(0, this.startIndexNumber);
    value = value + fieldId + '}';
    value = value + formValue.substring(this.startIndexNumber);
    return value;
  }

  removeList($event) {
    if ($event.isUserInput) {
      this.autocompleteInitialFieldList = [];
      this.startIndexNumber = -1;
    }
  }

  openAutocomplete(event) {
    if (event.selectionStart || event.selectionStart === '0') {
      this.startIndexNumber = event.selectionStart;
    }
  }

  setEmailFieldList(event, field) {
    if (event.isUserInput) {
      const repeatedEmails = [];
      const initialFieldListForEmail = [];
      this.repeatedField = field.fieldName + ':';
      this.initialFieldList.forEach(value => {
        if (value.fieldType === 'Workflow Variables:' || value.fieldType === 'System Variables:'
          || value.fieldType === 'Environment Variables:' || value.fieldType === 'Custom Attributes:') {
          initialFieldListForEmail.push(value);
        }
        if (value.fieldType === field.fieldName + ':') {
          initialFieldListForEmail.push(value);
          value.fieldVO.forEach(element => {
            repeatedEmails.push(element.fieldId);
          });
        }
      });
      this.repeatedEmails = repeatedEmails;
      this.initialFieldListForEmail = initialFieldListForEmail;
    }
  }

  arrayToggle(event) {
    if (event.checked === false) {
      this.initialFieldListForEmail = this.initialFieldList;
    }
  }

  addConstantEmails() {
    this.showConstantEmails = true;
  }

  addConstantEmailsCC() {
    this.showConstantEmailsCC = true;
  }
  addConstantEmailsBCC() {
    this.showConstantEmailsBCC = true;
  }

  closeEmails() {
    this.taskPropertyForm.markAsDirty();
    this.showConstantEmails = false;
    const emailTo: any[] = this.taskPropertyForm.get('emailTo').value;
    this.emailToChip.placeholder.forEach(field => {
      const removeIndexDate = emailTo.findIndex(x => x === field.name);
      if (removeIndexDate !== -1) {
        emailTo.splice(removeIndexDate, 1);
      }
    });
    this.taskPropertyForm.get('emailTo').setValue(emailTo);
    this.emailToChip.placeholder = [];
  }

  closeEmailsCC() {
    this.taskPropertyForm.markAsDirty();
    this.showConstantEmailsCC = false;
    const emailCC: any[] = this.taskPropertyForm.get('emailCC').value;
    this.emailCcChip.placeholder.forEach(field => {
      const removeIndexDate = emailCC.findIndex(x => x === field.name);
      if (removeIndexDate !== -1) {
        emailCC.splice(removeIndexDate, 1);
      }
    });
    this.taskPropertyForm.get('emailCC').setValue(emailCC);
  }

  closeEmailsBCC() {
    this.taskPropertyForm.markAsDirty();
    this.showConstantEmailsBCC = false;
    const emailBCC: any[] = this.taskPropertyForm.get('emailBCC').value;
    this.emailBccChip.placeholder.forEach(field => {
      const removeIndexDate = emailBCC.findIndex(x => x === field.name);
      if (removeIndexDate !== -1) {
        emailBCC.splice(removeIndexDate, 1);
      }
    });
    this.taskPropertyForm.get('emailBCC').setValue(emailBCC);
  }


  // tslint:disable-next-line: variable-name
  getIndex(substring, string) {
    let a = [], i = -1;
    // tslint:disable-next-line: no-conditional-assignment
    while ((i = string.indexOf(substring, i + 1)) >= 0) { a.push(i); }
    return a;
  }


  loadUsersList() {
    const type = this.data.nodeData.taskType;
    if (type === 'START_TASK' || type === 'USER_TASK' || type === 'APPROVAL_TASK') {
      this.taskPropertyService.getUsersList().subscribe(data => {
        this.userList = data;
        if (this.data.nodeData && this.data.nodeData.property.propertyValue) {
          const assigneeUser = this.data.nodeData.property.propertyValue.assigneeUser;
          this.userList.forEach(user => {
            if (assigneeUser === user.userId) {
              this.assignUsersList.push({
                firstName: user.firstName,
                lastName: user.lastName,
                id: user.userId
              });
            }
          });
        }
      });
    }
  }

  loadGroupsList() {
    const type = this.data.nodeData.taskType;
    if (type === 'START_TASK' || type === 'USER_TASK' || type === 'APPROVAL_TASK') {

      this.taskPropertyService.getGroupsList().subscribe(data => {
        this.groupList = data;
        if (this.data.nodeData && this.data.nodeData.property.propertyValue) {
          const teams = this.data.nodeData.property.propertyValue.assigneeGroup;
          this.groupList.forEach(groups => {
            teams?.forEach(teams => {
              if (teams === groups.groupId) {
                this.teamList.push({
                  name: groups.groupName,
                  id: groups.groupId
                });
              }
            });
          });
        }

      });
    }
  }

  getArrayFormGroup(fieldName) {
    return this.formBuilder.group({
      leftAssignment: ['', [Validators.required]],
      operator: ['', [Validators.required]],
      rightAssignment: ['', [Validators.required]],
    });
  }

  getToolTip(value, type) {
    let toolTip = '';
    this.initialFieldList?.forEach(fieldVo => {
      fieldVo.fieldVO?.forEach(fieldValues => {
        if (type === 'normalField' && fieldValues.fieldId === value) {
          toolTip = fieldValues.fieldName;
        }
        if (type === 'repeatableField' && fieldValues.repeatableFieldId === value) {
          toolTip = fieldValues.repeatableFieldName;
        }
      });
    });
    return toolTip;
  }

  getPageFields(pageId, version) {
    let versionId = version;
    if (version === undefined) {
      versionId = 1;
    }
    this.taskPropertyService.getPageFields(pageId, versionId).subscribe(fields => {
      const repeatableName: any[] = [];
      const repeatableTableName: any[] = [];
      this.fieldsList = fields.mainSection;
      const fieldsListsForMapping: PageFieldVO[] = [];
      const repeatableFieldsListsForMapping: PageFieldVO[] = [];
      const repaeatableFieldId: any[] = [];
      if (this.getFieldMappingFormGroup()) {
        this.taskPropertyForm.removeControl('fieldMapping');
      }
      if (this.getShowInTaskListFormGroup()) {
        this.taskPropertyForm.removeControl('showInTaskList');
      }
      this.taskPropertyForm.addControl('fieldMapping', this.formBuilder.group({}));
      this.taskPropertyForm.addControl('showInTaskList', this.formBuilder.group({}));
      this.arrayFields = fields.subSection;

      if (this.fieldsList !== undefined && this.fieldsList.length > 0) {
        this.fieldsList.forEach(field => {
          field.color = this.getRandomColor();
          fieldsListsForMapping.push(field);
          this.getFieldMappingFormGroup().addControl(field.fieldId, this.formBuilder.control(null));
          this.getShowInTaskListFormGroup().addControl(field.fieldId, this.formBuilder.group({
            showInTaskListEnable: [false],
            enableWildCard: [{ value: false, disabled: true }],
            name: [''],
            order: [''],
            dataType: [field.datatype]
          }));
        });
        this.enableFieldMapping = true;
      }
      if (this.arrayFields !== undefined && this.arrayFields.length > 0) {
        this.arrayFields.forEach(fieldName => {
          fieldName.color = this.getRandomColor();
          if (!repeatableName.some(filterColumn => filterColumn.repeatableFieldId === fieldName.repeatableFieldId)) {
            repeatableName.push(fieldName);
            fieldsListsForMapping.push(fieldName);
            this.enableFieldMapping = true;
            this.getFieldMappingFormGroup().addControl(fieldName.repeatableFieldId, this.formBuilder.control(null));
            if (this.getRepeatableFieldMappingFormGroup(fieldName.repeatableFieldId + 'ya')) {
              this.getFieldMappingFormGroup().removeControl(fieldName.repeatableFieldId + 'ya');
            }
            repaeatableFieldId.push(fieldName);
            this.getFieldMappingFormGroup().addControl(fieldName.repeatableFieldId + 'ya', this.formBuilder.group({}));
          }
          repeatableFieldsListsForMapping.push(fieldName);
          this.getRepeatableFieldMappingFormGroup(fieldName.repeatableFieldId + 'ya')
            .addControl(fieldName.fieldId, this.formBuilder.control(null));
        });
      }
      this.tableFields = fields.tableControl;
      if (this.tableFields !== undefined && this.tableFields.length > 0) {
        this.tableFields.forEach(fieldName => {
          if (!repeatableTableName.some(filterColumn => filterColumn.repeatableFieldId === fieldName.repeatableFieldId)) {
            repeatableTableName.push(fieldName);
            fieldName.color = this.getRandomColor();
            fieldsListsForMapping.push(fieldName);
            this.enableFieldMapping = true;
            this.getFieldMappingFormGroup().addControl(fieldName.repeatableFieldId, this.formBuilder.control(null));
          }
        });
      }
      this.fieldsListForMapping = fieldsListsForMapping;
      this.repeatableFieldsListForMapping = repeatableFieldsListsForMapping;
      this.repeatableFieldsListFormName = repaeatableFieldId;
      if (this.loadUserTypeApprovelTypeForm === true) {
        const value = this.data.nodeData.property.propertyValue;
        if (value.isCustomForm === false) {
          this.taskPropertyForm.patchValue(value);
          this.fieldsList?.forEach(field => {
            if (this.taskPropertyForm.get('showInTaskList').get(field.fieldId).get('showInTaskListEnable').value === true) {
              this.taskPropertyForm.get('showInTaskList').get(field.fieldId).get('enableWildCard').enable();
            }
          });
          if (this.arrayFields !== undefined && this.arrayFields.length > 0) {
            this.arrayFields.forEach(field => {
              if (this.taskPropertyForm.get('fieldMapping').get(field.repeatableFieldId) !== null) {
                this.arrayMappingDetails.push({
                  fieldName: field.repeatableFieldId,
                  value: this.taskPropertyForm.get('fieldMapping').get(field.repeatableFieldId).value
                });
              }
            });
          }
        }
        this.loadUserTypeApprovelTypeForm = false;
        if (this.taskPropertyForm.get('formVersion').value === null) {
          this.taskPropertyForm.get('formVersion').setValue(versionId);
        }
      } else {
        const value = this.data.nodeData.property.propertyValue;
        if (value.isCustomForm === false) {
        }
      }
    });
  }

  mapAllFields() {
    this.fieldsList?.forEach(field => {
      this.initialFieldList.forEach(initialValues => {
        initialValues.fieldVO.forEach(initialFields => {
          if (field.fieldId === initialFields.fieldId) {
            this.getFieldMappingFormGroup().get(field.fieldId).setValue(field.fieldId);
          }
        });
      });
    });
    if (this.tableFields !== undefined && this.tableFields.length > 0) {
      this.tableFields.forEach(field => {
        this.initialFieldList.forEach(initialValues => {
          initialValues.fieldVO.forEach(initialFields => {
            if (field.repeatableFieldId === initialFields.repeatableFieldId) {
              this.getFieldMappingFormGroup().get(field.repeatableFieldId).setValue(field.repeatableFieldId);
            }
          });
        });
      });
    }
    if (this.arrayFields !== undefined && this.arrayFields.length > 0) {
      this.arrayFields.forEach(fieldName => {
        this.initialFieldList.forEach(initialValues => {
          if (initialValues.fieldType === fieldName.repeatableFieldName + ':') {
            initialValues.fieldVO.forEach(initialFields => {
              if (fieldName.fieldId === initialFields.fieldId) {
                if (fieldName.repeatableFieldId === initialFields.repeatableFieldId) {
                  this.taskPropertyForm.get('fieldMapping').get(fieldName.repeatableFieldId)
                    .setValue(fieldName.repeatableFieldId);
                }
                if (this.taskPropertyForm.get('fieldMapping').get(fieldName.repeatableFieldId + 'ya').get(fieldName.fieldId) !== null) {
                  this.taskPropertyForm.get('fieldMapping').get(fieldName.repeatableFieldId + 'ya').get(fieldName.fieldId)
                    .setValue(fieldName.fieldId);
                }
              }
            });
          }
        });
      });
    }
    this.taskPropertyForm.markAsDirty();
  }

  clearMapping() {
    this.fieldsList?.forEach(field => {
      this.getFieldMappingFormGroup().get(field.fieldId).setValue(null);
    });
    if (this.arrayFields !== undefined && this.arrayFields.length > 0) {
      this.arrayFields.forEach(field => {
        this.getFieldMappingFormGroup().get(field.repeatableFieldId).setValue(null);
      });
    }
    if (this.tableFields !== undefined && this.tableFields.length > 0) {
      this.tableFields.forEach(field => {
        this.getFieldMappingFormGroup().get(field.repeatableFieldId).setValue(null);
      });
    }
    this.taskPropertyForm.markAsDirty();
  }

  setDefaultArrayFields(repeatableField: AbstractControl, field) {
    const fieldValue = repeatableField.value;
    const repeatableFieldId = field.repeatableFieldId;
    this.arrayMappingDetails.forEach(fieldName => {
      if (fieldName.fieldName === repeatableFieldId && fieldName.value !== '') {
        this.arrayFields.forEach(deleteField => {
          if (this.taskPropertyForm.get('fieldMapping').get(repeatableFieldId + 'ya').get(deleteField.fieldId) !== null) {
            this.taskPropertyForm.get('fieldMapping').get(repeatableFieldId + 'ya').get(deleteField.fieldId).setValue(null);
            const removeIndex = this.arrayMappingDetails.findIndex(x => x.fieldName === repeatableFieldId);
            if (removeIndex !== -1) {
              this.arrayMappingDetails.splice(removeIndex, 1);
            }
          }
        });
      }
    });
    this.arrayMappingDetails.push({ fieldName: repeatableFieldId, value: repeatableField.value });
    if (this.arrayFields !== undefined && this.arrayFields.length > 0) {
      if (this.taskPropertyForm.get('fieldMapping').get(repeatableFieldId).value !== null
        && this.taskPropertyForm.get('fieldMapping').get(repeatableFieldId).value !== '' && fieldValue === repeatableFieldId) {
        let isdefaultValueSet = false;
        this.arrayFields.forEach(fieldName => {
          if (fieldName.repeatableFieldId === fieldValue) {
            this.initialFieldList.forEach(initialValues => {
              if (initialValues.fieldType === fieldName.repeatableFieldName + ':') {
                initialValues.fieldVO.forEach(initialFields => {
                  if (fieldName.fieldId === initialFields.fieldId) {
                    if (this.taskPropertyForm.get('fieldMapping').get(fieldName.repeatableFieldId + 'ya').get(fieldName.fieldId) !== null) {
                      this.taskPropertyForm.get('fieldMapping').get(fieldName.repeatableFieldId + 'ya').get(fieldName.fieldId)
                        .setValue(fieldName.fieldId);
                      const removeIndex = this.arrayMappingDetails.findIndex(x => x.fieldName === repeatableFieldId);
                      if (removeIndex !== -1) {
                        isdefaultValueSet = true;
                        this.arrayMappingDetails.splice(removeIndex, 1);
                      }
                      this.arrayMappingDetails.push({ fieldName: repeatableFieldId, value: repeatableField.value });
                    }
                  }
                });
              }
            });
          }
        });
        if (!isdefaultValueSet) {
          this.arrayMappingDetails.forEach(fieldName => {
            if (fieldName.fieldName === repeatableFieldId && fieldName.value !== '') {
              this.arrayFields.forEach(deleteField => {
                if (this.taskPropertyForm.get('fieldMapping').get(repeatableFieldId + 'ya').get(deleteField.fieldId) !== null) {
                  this.taskPropertyForm.get('fieldMapping').get(repeatableFieldId + 'ya').get(deleteField.fieldId).setValue(null);
                  const removeIndex = this.arrayMappingDetails.findIndex(x => x.fieldName === repeatableFieldId);
                  if (removeIndex !== -1) {
                    this.arrayMappingDetails.splice(removeIndex, 1);
                  }
                }
              });
            }
          });
        }
      }
    }
  }

  getFieldlabel(field) {
    return field.repeatableFieldName + ' (' + field.fieldName + ')';
  }

  getformGroupName(repeatableFieldId) {
    return repeatableFieldId + 'ya';
  }

  setFieldNames(event, fieldName, control: AbstractControl, order: AbstractControl, enableWildCard: AbstractControl, i) {
    if (event.checked) {
      control.setValue(fieldName);
      order.setValue(1);
      enableWildCard.enable();
    } else {
      control.setValue(null);
      order.setValue(null);
      enableWildCard.setValue(false);
      enableWildCard.disable();
    }
  }

  getFieldMappingFormGroup() {
    return this.taskPropertyForm.get('fieldMapping') as FormGroup;
  }

  getRepeatableFieldMappingFormGroup(repeatableName) {
    return this.getFieldMappingFormGroup().get(repeatableName) as FormGroup;
  }

  getShowInTaskListFormGroup() {
    return this.taskPropertyForm.get('showInTaskList') as FormGroup;
  }

  setOperators(event, pageField, i) {
    if (event.isUserInput === true) {
      if (pageField.datatype === 'text' || pageField.datatype === 'string' ||
        pageField.datatype === 'STRING' || pageField.datatype === 'String' || pageField.datatype === 'Text') {
        this.filterDataType[i] = 'text';
        this.setRightOperatorValue = 'text';
      } else if (pageField.datatype === 'number' || pageField.datatype === ' NUMBER'
        || pageField.datatype === 'Long' || pageField.datatype === 'Double'
        || pageField.datatype === 'long' || pageField.datatype === 'double') {
        this.filterDataType[i] = 'number';
      } else if (pageField.datatype === 'boolean') {
        this.filterDataType[i] = 'boolean';
      } else {
        this.filterDataType[i] = 'date';
      }
      if (pageField.datatype !== 'long' && pageField.datatype !== 'double') {
        this.getRulesFormArray().get('' + i).get(this.decisionTaskFieldType)
          .get('dataType').setValue(pageField.datatype.charAt(0).toUpperCase() + pageField.datatype.substr(1));
      } else {
        this.getRulesFormArray().get('' + i).get(this.decisionTaskFieldType).get('dataType').setValue('Number');
      }
      this.checkValidation(i);
    }
  }

  setRightDataType(event, pageField, i) {
    if (event.isUserInput === true) {
      if (pageField.datatype !== 'long' && pageField.datatype !== 'double') {
        this.getRulesFormArray().get(i + '').get('rightAssignment')
          .get('dataType').setValue(pageField.datatype.charAt(0).toUpperCase() + pageField.datatype.substr(1));
      } else {
        this.getRulesFormArray().get('' + i).get('leftAssignment').get('dataType').setValue('Number');
      }
      this.checkValidation(i);
    }
  }

  getEmailToChip($event) {
    this.emailToChip = $event;
    if (this.data.nodeData && this.data.nodeData.property.propertyValue) {
      const email = this.data.nodeData.property.propertyValue;
      if (email.emailTo.length > 0) {
        this.emailToChip.placeholder = this.emailToChip.getPlaceholderFromStringArray(email.emailTo);
      }
    } else if (this.data.propertyName) {
      const email = this.data.propertyName;
      if (email.emailTo.length > 0) {
        this.emailToChip.placeholder = this.emailToChip.getPlaceholderFromStringArray(email.emailTo);
      }
    }
  }

  getEmailBccChip($event) {
    this.emailBccChip = $event;
    if (this.data.nodeData && this.data.nodeData.property.propertyValue) {
      const email = this.data.nodeData.property.propertyValue;
      if (email.emailBCC.length > 0) {
        this.emailBccChip.placeholder = this.emailBccChip.getPlaceholderFromStringArray(email.emailBCC);
      }
    } else if (this.data.propertyName) {
      const email = this.data.propertyName;
      if (email.emailBCC.length > 0) {
        this.emailBccChip.placeholder = this.emailBccChip.getPlaceholderFromStringArray(email.emailBCC);
      }
    }
  }

  getEmailCcChip($event) {
    this.emailCcChip = $event;
    if (this.data.nodeData && this.data.nodeData.property.propertyValue) {
      const email = this.data.nodeData.property.propertyValue;
      if (email.emailCC.length > 0) {
        this.emailCcChip.placeholder = this.emailCcChip.getPlaceholderFromStringArray(email.emailCC);
      }
    } else if (this.data.propertyName) {
      const email = this.data.propertyName;
      if (email.emailCC.length > 0) {
        this.emailCcChip.placeholder = this.emailCcChip.getPlaceholderFromStringArray(email.emailCC);
      }
    }
  }

  setFormValues() {
    this.editFormOptionEnable = true;
    this.loadUserTypeApprovelTypeForm = true;
    const pageId = this.data.nodeData.property.propertyValue.formIdentifier;
    const version = this.data.nodeData.property.propertyValue.formVersion;
    const customForm = this.data.nodeData.property.propertyValue.isCustomForm;
    this.isCustomPage = this.data.nodeData.property.propertyValue.isCustomForm;
    if (customForm === false) {
      this.getPageFields(pageId, version);
    } else {
      this.taskPropertyForm.patchValue(this.data.nodeData.property.propertyValue);
      this.editFormOptionEnable = false;
    }
  }

  loadProperty() {
    if (this.data.remainder && this.data.remainder === true && this.data.propertyName) {
      this.taskPropertyForm.patchValue(this.data.propertyName);
      if (this.data.taskType === 'EMAIL_TASK') {
        this.emailData = this.data.propertyName.emailTemplate;

        if (this.taskPropertyForm.get('emailTo').value.length > 0) {
          this.showConstantEmails = true;
        } else {
          this.showConstantEmails = false;
        }

        if (this.taskPropertyForm.get('emailCC').value.length > 0) {
          this.showConstantEmailsCC = true;
        } else {
          this.showConstantEmailsCC = false;
        }

        if (this.taskPropertyForm.get('emailBCC').value.length > 0) {
          this.showConstantEmailsBCC = true;
        } else {
          this.showConstantEmailsBCC = false;
        }
        this.taskPropertyForm.get('emailTo').setValue('');
        this.taskPropertyForm.get('emailCC').setValue('');
        this.taskPropertyForm.get('emailBCC').setValue('');
      }
    } else {
      if (this.data.nodeData && this.data.nodeData.property.propertyValue) {
        if (this.taskType !== 'DECISION_TASK' && this.taskType !== 'USER_TASK' && this.taskType !== 'APPROVAL_TASK'
          && this.taskType !== 'WEB_SERVICE_TASK' && this.taskType !== 'DECISION_TABLE' && this.taskType !== 'EXCEL_REPORT') {
          this.taskPropertyForm.patchValue(this.data.nodeData.property.propertyValue);
        }
        if (this.taskType === 'USER_TASK' || this.taskType === 'APPROVAL_TASK') {
          const teams = this.data.nodeData.property.propertyValue.assigneeGroup;
          this.setFormValues();
        }

        if (this.taskType === 'CALL_ANOTHER_WORKFLOW') {
          if (this.data.nodeData.property.propertyValue.callAnotherWorkflowFields) {
            const json = this.data.nodeData.property.propertyValue;
            this.workflowName = json.workflowName;
            const callAnotherWorkflowFieldsArray: any[] = json.callAnotherWorkflowFields;
            this.enableWebServiceForCallAnotherWorkflow = true;
            for (let i = 0; i < callAnotherWorkflowFieldsArray.length; i++) {
              const index = '' + i;
              if (i > 0) {
                this.getWebServiceFieldValuesFormarray().push(this.webServiceFieldMapping());
              }
              const sortBy = (this.getWebServiceFieldValuesFormarray().get(index) as FormGroup);
              sortBy.setValue(callAnotherWorkflowFieldsArray[i]);
            }
          }
        }

        if (this.taskType === 'EMAIL_TASK') {
          this.emailData = this.data.nodeData.property.propertyValue.emailTemplate;

          if (this.taskPropertyForm.get('emailTo').value.length > 0) {
            this.showConstantEmails = true;
          } else {
            this.showConstantEmails = false;
          }

          if (this.taskPropertyForm.get('emailCC').value.length > 0) {
            this.showConstantEmailsCC = true;
          } else {
            this.showConstantEmailsCC = false;
          }

          if (this.taskPropertyForm.get('emailBCC').value.length > 0) {
            this.showConstantEmailsBCC = true;
          } else {
            this.showConstantEmailsBCC = false;
          }
          this.taskPropertyForm.get('emailTo').setValue('');
          this.taskPropertyForm.get('emailCC').setValue('');
          this.taskPropertyForm.get('emailBCC').setValue('');
        }

        if (this.taskType === 'DB_TASK') {
          this.enableQueryFields = true;
          this.enableFilterSortLimit = true;
          this.enableTableColumns = true;
          const json = this.data.nodeData.property.propertyValue;

          this.tableName = json.tableName;
          this.getTableColumns(json.tableId, json.tableName, 'load');
          if (json.fieldValues) {
            this.taskPropertyForm.removeControl('fieldValues');
            const fieldValueArray: any[] = json.fieldValues;
            this.taskPropertyForm.addControl('fieldValues', this.formBuilder.array([]));
            for (let i = 0; i < fieldValueArray.length; i++) {
              this.queryFieldsFormGroup(json.actionType, 'load');
              const index = '' + i;
              const fieldValue = (this.getDBTaskfieldValuesFormarray().get(index) as FormGroup);
              fieldValue.patchValue(fieldValueArray[i]);
            }
          }
          if (json.whereClause) {
            const whereClauseArray: any[] = json.whereClause;
            if (whereClauseArray && whereClauseArray.values) {
              for (let i = 0; i < whereClauseArray.length; i++) {
                const index = '' + i;
                if (i > 0) {
                  this.addDBTaskWhereClauseFormGroup();
                }
                const whereClause = (this.getDBTaskwhereClauseFormarray().get(index) as FormGroup);
                const whereClauseFilterValuesArray: any[] = json.whereClause[i].filtersInsideCondition;
                if (whereClauseFilterValuesArray.values) {
                  for (let j = 0; j < whereClauseFilterValuesArray.length; j++) {
                    const filterIndex = '' + j;
                    if (j > 0) {
                      this.getDBTaskfiltersInsideConditionFormarray(i).push(this.filterValuesFormGroup());
                    }
                    const filtersInsideCondition = (this.getDBTaskfiltersInsideConditionFormarray(i).get(filterIndex) as FormGroup);
                    filtersInsideCondition.setValue(whereClauseFilterValuesArray[j]);
                    filtersInsideCondition.updateValueAndValidity();
                  }
                }
                whereClause.setValue(whereClauseArray[i]);
              }
            }
          }
          if (json.sortBy) {
            const sortByArray: any[] = json.sortBy;
            if (sortByArray.values) {
              for (let i = 0; i < sortByArray.length; i++) {
                const index = '' + i;
                if (i > 0) {
                  this.getDBTasksortByFormarray().push(this.sortByFormGroup());
                }
                const sortBy = (this.getDBTasksortByFormarray().get(index) as FormGroup);
                sortBy.setValue(sortByArray[i]);
              }
            }
          }
        }

        if (this.taskType === 'START_TASK') {
          const teams = this.data.nodeData.property.propertyValue.assigneeGroup;
          this.radioChange({ value: this.taskPropertyForm.get('propertyType').value });
          if (this.taskPropertyForm.get('propertyType').value === 'manual') {
            this.setFormValues();
            if (this.taskPropertyForm.get('publicForm').value === true) {
              this.taskPropertyForm.get('formIdentifier').setValue(this.data.nodeData.property.propertyValue.formIdentifier);
              this.taskPropertyForm.get('formVersion').setValue(this.data.nodeData.property.propertyValue.formVersion);
              this.taskPropertyForm.get('message').setValue(this.data.nodeData.property.propertyValue.message);
              this.URL = window.location.href.split('.com/', 2);
              this.publicFormUrl = this.URL[0] + '.com/' + this.selectedLang + '/public/' 
              + this.taskPropertyForm.get('formIdentifier').value;
            }
          }
          if (this.taskPropertyForm.get('propertyType').value === 'launch') {
            this.launchTextAreaEnable = true;
            this.enableWebServiceForCallAnotherWorkflow = true;
            this.taskPropertyForm.get('jsonText').setValue(JSON.stringify(this.data.nodeData.property.propertyValue.jsonText));
          }
          if (this.taskPropertyForm.get('propertyType').value === 'scheduled') {
            this.cronExpression = cronstrue.toString(this.taskPropertyForm.get('schedulerExpression').value);
          }
        }

        if (this.taskType === 'WEB_SERVICE_TASK') {
          const auth = this.data.nodeData.property.propertyValue.authorization;
          const json = this.data.nodeData.property.propertyValue;
          if (auth) {
            this.configureAuthorizationFormGroups({ value: auth });
          }
          this.taskPropertyForm.patchValue(this.data.nodeData.property.propertyValue);
          if (this.data.nodeData.property.propertyValue.jsonSuccessText) {
            this.taskPropertyForm.get('jsonSuccessText')
              .setValue(JSON.stringify(this.data.nodeData.property.propertyValue.jsonSuccessText));
          }
          if (this.data.nodeData.property.propertyValue.jsonErrorText) {
            this.taskPropertyForm.get('jsonErrorText').setValue(JSON.stringify(this.data.nodeData.property.propertyValue.jsonErrorText));
          }

          const httpMethod = this.taskPropertyForm.get('httpMethod');
          if (httpMethod.value === 'POST' || httpMethod.value === 'PUT') {
            this.addRequestPayloadFormArray();
            this.launchTextAreaEnable = true;
            const webServiceRequestPayload: any[] = json.webServiceRequestPayload;
            for (let i = 0; i < webServiceRequestPayload.length; i++) {
              const index = '' + i;
              if (i > 0) {
                this.addCustomHeaders('webServiceRequestPayload');
              }
              const group = (this.getCustomHeadersFormArray('webServiceRequestPayload').get(index) as FormGroup);
              group.setValue(webServiceRequestPayload[i]);
            }
          }

          const values: any[] = json.customHeaders;
          for (let i = 0; i < values.length; i++) {
            const index = '' + i;
            if (i > 0) {
              this.addCustomHeaders('customHeaders');
            }
            const group = (this.getCustomHeadersFormArray('customHeaders').get(index) as FormGroup);
            group.setValue(values[i]);
          }

          if (json.queryParams) {
            const queryParamValues: any[] = json.queryParams;
            for (let i = 0; i < queryParamValues.length; i++) {
              const index = '' + i;
              if (i > 0) {
                this.addCustomHeaders('queryParams');
              }
              const group = (this.getCustomHeadersFormArray('queryParams').get(index) as FormGroup);
              group.setValue(queryParamValues[i]);
            }
          }
          if (auth === 'apiKey') {
            const apiKeyValues: any[] = json.apiKey.apiKey;
            for (let i = 0; i < apiKeyValues.length; i++) {
              const index = '' + i;
              if (i > 0) {
                this.getApiKeyFormArray().push(this.getApiFormGroup());
              }
              const group = (this.getApiKeyFormArray().get(index) as FormGroup);
              group.setValue(apiKeyValues[i]);
            }
          }
        }

        if (this.taskType === 'DECISION_TABLE') {
          const json = this.data.nodeData.property.propertyValue;
          this.taskPropertyForm.patchValue(json);
          if (json.conditions) {
            const values: any[] = json.conditions;
            for (let i = 0; i < values.length; i++) {
              const index = '' + i;
              if (i > 0) {
                (this.taskPropertyForm.get('conditions') as FormArray).push(this.getconditionsFormGroup());
              }
              const group = (this.getConditionalsFormarray().get(index) as FormGroup);
              this.conditionsList.push(values[i].name);
              group.patchValue(values[i]);
            }
          }
          if (json.conditionVariableList) {
            const variableList: any[] = json.conditionVariableList;
            for (let i = 0; i < variableList.length; i++) {
              this.addVariables();
              const index = '' + i;
              const array = this.getConditionalValuesFormarray().get(index).get('values') as FormArray;
              if (variableList[i].values.length > 0) {
                for (let j = 0; j < variableList[i].values.length; j++) {
                  const valueIndex = '' + j;
                  (array.get(valueIndex) as FormGroup).patchValue(variableList[i].values[j]);
                }
              }
            }
          }
          if (json.assignToVariableValuesList) {
            const variableList: any[] = json.assignToVariableValuesList;
            for (let i = 0; i < variableList.length; i++) {
              const index = '' + i;
              const array = this.getAssignToVariableValuesFormArray().get(index).get('values') as FormArray;
              if (variableList[i].values.length > 0) {
                for (let j = 0; j < variableList[i].values.length; j++) {
                  const valueIndex = '' + j;
                  (array.get(valueIndex) as FormGroup).patchValue(variableList[i].values[j]);
                }
              }
            }
          }
        }

        if (this.taskType === 'DECISION_TASK') {
          const json = this.data.nodeData.property.propertyValue;
          this.taskPropertyForm.get('ifTargetTask').setValue(json.ifTargetTask);
          this.taskPropertyForm.get('elseTargetTask').setValue(json.elseTargetTask);
          this.taskPropertyForm.get('name').setValue(json.name);
          this.taskPropertyForm.get('restartable').setValue(json.restartable);
          this.taskPropertyForm.get('decisionLogic').get('logicOperator').setValue(json.decisionLogic.logicOperator);
          const roles: any[] = json.decisionLogic.rules;
          for (let i = 0; i < roles.length; i++) {
            const index = '' + i;
            if (i > 0) {
              this.addRules();
            }
            const group = (this.getRulesFormArray().get(index) as FormGroup);
            const dataType = roles[index].leftAssignment.dataType;
            this.disableSetOperator = 'load';
            if (dataType === 'Text' || dataType === 'String') {
              this.filterDataType[i] = 'text';
            } else {
              this.filterDataType[i] = 'number';
            }
            group.setValue(roles[i]);
            group.updateValueAndValidity();
          }
        }

        if (this.taskType === 'COMPUTE_TASK') {
          const json = this.data.nodeData.property.propertyValue;
          const values: any[] = json.rightAssignment;
          for (let i = 0; i < values.length; i++) {
            const index = '' + i;
            if (i > 0) {
              this.addComputeTaskRightAssignmentFormroup();
            }
            const group = (this.getComputeTaskRightAssignmentFormarray().get(index) as FormGroup);
            group.setValue(values[i]);
          }
        }
        if (this.taskType === 'SMS_TASK') {
          const json = this.data.nodeData.property.propertyValue;
          const values: any[] = json.mobileNumbersList;
          for (let i = 0; i < values.length; i++) {
            const index = '' + i;
            if (i > 0) {
              this.addMobileNumbersArray();
            }
            const group = (this.getMobileNumbersFormarray().get(index) as FormGroup);
            group.setValue(values[i]);
          }
        }

        if (this.taskType === 'EXCEL_REPORT') {
          const json = this.data.nodeData.property.propertyValue;
          this.taskPropertyForm.patchValue(json);
          const excelColumns: any[] = json.excelColumns;
          for (let i = 0; i < excelColumns.length; i++) {
            const index = '' + i;
            if (i > 1) {
              this.getExcelColumnsFormarray().push(this.getExcelColumnsGroup());
            }
            const group = (this.getExcelColumnsFormarray().get(index) as FormGroup);
            const excelDetailsArray: any[] = json.excelColumns[i].excelDetails;
            if (excelDetailsArray.values) {
              for (let j = 0; j < excelDetailsArray.length; j++) {
                const filterIndex = '' + j;
                if (j > 0) {
                  this.getExcelDetailsColumnFormarray(i).push(this.getExcelDetailsGroup());
                }
                const excelDetails = (this.getExcelDetailsColumnFormarray(i).get(filterIndex) as FormGroup);
                excelDetails.patchValue(excelDetailsArray[j]);
                excelDetails.updateValueAndValidity();
              }
            }
            group.patchValue(excelColumns[i]);
          }
          if (json.arrayStyles !== undefined) {
            this.isArrayExcel = true;
            this.taskPropertyForm.addControl('arrayStyles', this.formBuilder.array([]));
            const excelArrayDetails: any[] = json.arrayStyles;
            for (let i = 0; i < excelArrayDetails.length; i++) {
              const index = '' + i;
              this.getExcelDetailsArrayFormarrayGroup();
              const group = (this.getExcelDetailsArrayFormarray().get(index) as FormGroup);
              group.patchValue(excelArrayDetails[i]);
            }
          }
        }
      } else {
        if (this.taskType === 'START_TASK') {
          this.taskPropertyForm.get('propertyType').setValue('manual');
          this.radioChange({ value: 'manual' });
        }
        if (this.taskType === 'DECISION_TASK') {
          this.setDefaultValuesLeftRule().get('variableType').setValue('pagefield');
          this.setDefaultValuesLeftRule().get('dataType').setValue('String');
          this.setDefaultValuesRightRule().get('variableType').setValue('pagefield');
          this.setDefaultValuesRightRule().get('dataType').setValue('String');
        }
      }
    }
  }

  getByTableId() {

  }

  setValidationForWebsServiceTask(event) {
    const jsonText = this.taskPropertyForm.get('jsonText');
    if (event.value === 'POST' || event.value === 'PUT') {
      if (!this.getCustomHeadersFormArray('webServiceRequestPayload')) {
        this.addRequestPayloadFormArray();
      }
    } else {
      this.taskPropertyForm.removeControl('webServiceRequestPayload');
    }
  }

  setPropertiesForTask() {
    if (this.taskType === 'EMAIL_TASK') {
      this.emailTaskFormInfo = {
        emailTo: {
          name: 'emailTo',
          label: 'Email To',
          group: this.taskPropertyForm,
          value: null
        },
        emailCC: {
          name: 'emailCC',
          label: 'Email CC',
          group: this.taskPropertyForm,
          value: null
        },
        emailBCC: {
          name: 'emailBCC',
          label: 'Email BCC',
          group: this.taskPropertyForm,
          value: null
        }
      };
    }
    if (this.taskType === 'APPROVAL_TASK') {
      this.taskPropertyForm.addControl('approvalTask', this.formBuilder.control(null));
      this.taskPropertyForm.addControl('rejectedTask', this.formBuilder.control(null));
      this.taskPropertyForm.addControl('sendBackTask', this.formBuilder.control(null));
      this.taskPropertyForm.addControl('isSendBack', this.formBuilder.control(false));
    }
    if (this.taskType === 'USER_TASK' || this.taskType === 'APPROVAL_TASK') {
    }
  }

  initializeForm(taskType) {
    switch (taskType) {
      case 'USER_TASK': {
        return this.initializeUserTaskForm();
      }
      case 'EMAIL_TASK': {
        return this.initializeEmailTaskForm();
      }
      case 'DELAY_TIMER': {
        return this.initializeDelayTimeTaskForm();
      }
      case 'DB_TASK': {
        return this.initializeDBTaskForm();
      }
      case 'DECISION_TASK': {
        return this.initializeDecisionTaskForm();
      }
      case 'START_TASK': {
        return this.initializeStartTaskForm();
      }
      case 'APPROVAL_TASK': {
        return this.initializeUserTaskForm();
      }
      case 'COMPUTE_TASK': {
        return this.initializeComputeTaskForm();
      }
      case 'WEB_SERVICE_TASK': {
        return this.initializeWebServiceTaskForm();
      }
      case 'CALL_ANOTHER_WORKFLOW': {
        return this.initializeCallAnotherWorkflowForm();
      }
      case 'DECISION_TABLE': {
        return this.initializeDecisionTableForm();
      }
      case 'SMS_TASK': {
        return this.initializeSMSTaskForm();
      }
      case 'COUNTER_TASK': {
        return this.initializeCounterTaskForm();
      }
      case 'EXCEL_REPORT': {
        return this.initializeExcelReportForm();
      }
      case 'SYSTEM_TASK': {
        return this.initializeSystemForm();
      }
    }
    this.loadProperty();
  }

  initializeSystemForm() {
    this.taskPropertyForm = this.formBuilder.group({
      assigneeUser: [],
      assigneeGroup: [''],
      mesageBody: ['', [Validators.required]],
    });
  }

  initializeCounterTaskForm() {
    this.taskPropertyForm = this.formBuilder.group({
      restartable: [true],
      name: ['', [Validators.required]],
      counterType: ['global', [Validators.required]],
      countIncreasedBy: ['1', [Validators.required]],
      countStartAt: ['0', [Validators.required]],
      resetAt: [''],
      timeZone: [this.timezoneVo.timeZoneCode, [Validators.required]]
    });
  }

  initializeSMSTaskForm() {
    this.taskPropertyForm = this.formBuilder.group({
      restartable: [true],
      name: ['', [Validators.required]],
      mobileNumbersList: this.formBuilder.array([this.getMobileNumbersFormGroup()]),
      mesageBody: ['', [Validators.required]],
      providerName: ['', [Validators.required]],
    });
  }

  getMobileNumbersFormGroup() {
    return this.formBuilder.group({
      mobileNumber: ['', [Validators.required]],
      variableType: ['pagefield'],
      countryCode: ['+1', [Validators.required]]
    });
  }

  getServiceInfo(placeholder) {
    if (placeholder === 'phoneNumber') {
      return 'From Phone Number *';
    } else if (placeholder === 'serviceName') {
      return 'From Service Name *';
    } else {
      return 'From ? *';
    }
  }

  getMobileNumbersFormarray() {
    return (this.taskPropertyForm.get('mobileNumbersList') as FormArray);
  }

  addMobileNumbersArray() {
    this.getMobileNumbersFormarray().push(this.getMobileNumbersFormGroup());
  }

  removeMobileNumbersArray(i) {
    this.getMobileNumbersFormarray().removeAt(i);
    if (this.getMobileNumbersFormarray().length === 0) {
      this.addMobileNumbersArray();
    }
  }

  initializeExcelReportForm() {
    this.taskPropertyForm = this.formBuilder.group({
      restartable: [true],
      name: ['', Validators.required],
      type: ['internal'],
      generatedExcelName: ['', Validators.required],
      hasArrayFields: [false],
      arrayFieldId: [],
      addCustomColumns: [true],
      excelColumns: this.formBuilder.array([this.getExcelColumnsGroup()]),
    });
  }

  getExcelColumnsGroup() {
    return this.formBuilder.group({
      rowType: ['column', Validators.required],
      excelDetails: this.formBuilder.array([this.getExcelDetailsGroup()]),
    });
  }

  getExcelDetailsGroup() {
    return this.formBuilder.group({
      value: [],
      variableType: ['pageFields'],
      headerWidth: [],
      headerId: [],
      dataType: [],
      dateFormat: []
    });
  }

  getExcelDetailsArrayFieldGroup() {
    return this.formBuilder.group({
      headerName: ['', Validators.required],
      headerId: [],
      dataType: [],
      headerWidth: ['', Validators.required]
    });
  }

  setExcelHeaderNames(headerName: AbstractControl, value: PageFieldVO, event) {
    if (value !== null && event.isUserInput === true) {
      headerName.setValue(value.fieldName);
    }
  }

  setExcelDataType(excel: FormGroup, value: PageFieldVO, event) {
    if (value !== null && event.isUserInput === true) {
      excel.get('dataType').setValue(value.datatype);
      if (excel.get('dataType').value === 'date') {
        excel.get('dateFormat').setValue(value.dateFormat);
      }
    }
  }

  setExcelHeaderName(value: PageFieldVO, event) {
    if (value !== null && event.isUserInput === true) {
      if (this.getExcelDetailsArrayFormarray()) {
        this.taskPropertyForm.removeControl('arrayStyles');
      }
      this.taskPropertyForm.addControl('arrayStyles', this.formBuilder.array([this.getExcelDetailsArrayFieldGroup()]));
      this.isArrayExcel = true;
      const fieldName = value.fieldName + ':';
      this.initialFieldList.forEach(field => {
        if (field.fieldType === fieldName) {
          for (let i = 0; i < field.fieldVO.length; i++) {
            const index = '' + i;
            if (i > 0) {
              this.getExcelDetailsArrayFormarrayGroup();
            }
            const group = (this.getExcelDetailsArrayFormarray().get(index) as FormGroup);
            group.get('headerName').setValue(field.fieldVO[i].fieldName);
            group.get('headerId').setValue(field.fieldVO[i].fieldId);
            group.get('dataType').setValue(field.fieldVO[i].datatype);
          }
        }
      });
    }
  }

  enableArrayField() {
    if (this.taskPropertyForm.get('hasArrayFields').value === false) {
      this.isArrayExcel = false;
      this.taskPropertyForm.removeControl('arrayStyles');
      this.taskPropertyForm.get('arrayFieldId').setValue('');
      if (this.getExcelDetailsFormarray().length === 0) {
        this.addCustomColumns();
      }
    }
  }

  setVariableType(variableType: AbstractControl, variableName) {
    variableType.setValue(variableName);
  }

  getExcelDetailsColumnFormarray(i) {
    return (this.taskPropertyForm.controls.excelColumns as FormArray).at(i).get('excelDetails') as FormArray;
  }

  getExcelColumnsFormarray() {
    return (this.taskPropertyForm.get('excelColumns') as FormArray);
  }

  addExcelColumnsFormGroup(i) {
    this.getExcelColumnsFormarray().insert(i + 1, this.getExcelColumnsGroup());
    this.addMissedColumns(i + 1);
  }

  deleteExcelColumnsFormGroup(i) {
    this.getExcelColumnsFormarray().removeAt(i);
    if (this.getExcelColumnsFormarray().length === 1) {
      this.addExcelColumnsFormGroup(1);
    }
  }

  addMissedColumns(index) {
    if (this.getExcelDetailsColumnFormarray(index).length <
      this.getExcelDetailsColumnFormarray(0).length) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 1; i < this.getExcelDetailsColumnFormarray(0).length; i++) {
        this.getExcelDetailsColumnFormarray(index).push(this.getExcelDetailsGroup());
      }
    }
  }

  addExcelHeaderDetailsFormGroupWhileLoad(length) {
    for (let i = 0; i < length; i++) {
      this.getExcelDetailsColumnFormarray(i).push(this.getExcelDetailsGroup());
    }
  }

  addExcelHeaderDetailsFormGroup(iw) {
    for (let i = 0; i < this.getExcelColumnsFormarray().length; i++) {
      this.getExcelDetailsColumnFormarray(i).insert(iw + 1, this.getExcelDetailsGroup());
    }
  }

  deleteExcelHeaderDetailsFormGroup(iw) {
    for (let i = 0; i < this.getExcelColumnsFormarray().length; i++) {
      this.getExcelDetailsColumnFormarray(i).removeAt(iw);
    }
    if (this.getExcelDetailsColumnFormarray(0).length === 0) {
      this.addExcelHeaderDetailsFormGroup(iw);
    }
  }

  getExcelDetailsFormarray() {
    return (this.taskPropertyForm.get('excelDetails') as FormArray);
  }

  getExcelDetailsArrayFormarray() {
    return (this.taskPropertyForm.get('arrayStyles') as FormArray);
  }

  getExcelDetailsArrayFormarrayGroup() {
    this.getExcelDetailsArrayFormarray().push(this.getExcelDetailsArrayFieldGroup());
  }

  addExcelReportFormGroup() {
    this.getExcelDetailsFormarray().push(this.getExcelDetailsGroup());
  }

  addCustomColumns() {
    this.taskPropertyForm.get('addCustomColumns').setValue(true);
    if (this.getExcelDetailsFormarray().length === 0) {
      this.getExcelDetailsFormarray().push(this.getExcelDetailsGroup());
    }
  }

  removeExcelReportarray(i) {
    this.getExcelDetailsFormarray().removeAt(i);
    if (this.getExcelDetailsFormarray().length === 0 && this.taskPropertyForm.get('hasArrayFields').value === true) {
      this.taskPropertyForm.get('addCustomColumns').setValue(false);
    } else if (this.getExcelDetailsFormarray().length === 0) {
      this.addCustomColumns();
    }
    this.taskPropertyForm.markAsDirty();
  }

  initializeDecisionTableForm() {
    this.taskPropertyForm = this.formBuilder.group({
      restartable: [true],
      name: [],
      operator: ['', Validators.required],
      conditions: this.formBuilder.array([this.getconditionsFormGroup()]),
      assignToVariable: this.getconditionsFormGroup(),
      conditionVariableList: this.formBuilder.array([]),
      assignToVariableValuesList: this.formBuilder.array([])
    });
  }

  getconditionsFormGroup() {
    return this.formBuilder.group({
      name: ['', Validators.required],
      variableName: [],
      variableType: ['pagefield'],
      dataType: [],
      operator: ['eq'],
    });
  }

  addVariableFormGroup() {
    this.getConditionalValuesFormarray().push(this.getVariableFormGroup());
    this.getAssignToVariableValuesFormArray().push(this.getVariableFormGroup());
  }

  getVariableFormGroup() {
    return this.formBuilder.group({
      values: this.formBuilder.array([])
    });
  }

  getValuesFormGroup() {
    return this.formBuilder.group({
      value: ['', Validators.required],
      variableName: [],
      variableType: ['pagefield']
    });
  }

  addNewCondition() {
    (this.taskPropertyForm.get('conditions') as FormArray).push(this.getconditionsFormGroup());
    this.taskPropertyForm.markAsDirty();
  }

  getConditionalsFormarray() {
    return (this.taskPropertyForm.get('conditions') as FormArray);
  }

  getConditionalValuesFormarray() {
    return (this.taskPropertyForm.get('conditionVariableList') as FormArray);
  }

  getAssignToVariableValuesFormArray() {
    return (this.taskPropertyForm.get('assignToVariableValuesList') as FormArray);
  }

  getVariableListsFormarray(variable, i) {
    return (this.taskPropertyForm.controls.conditionVariableList as FormArray).at(i).get(variable) as FormArray;
  }

  enableAdd(i) {
    const varaibleValues = this.getAssignToVariableValuesFormArray().get('' + i)
      .get('values') as FormArray;
    // tslint:disable-next-line:prefer-for-of
    if (varaibleValues.get(0 + '').get('variableName').value) {
      this.disableAddVariable = false;
    }
  }

  variableTypeDecision(i, iw, value) {
    if (value === 'assignTo') {
      const varaibleValues = this.getAssignToVariableValuesFormArray().get('' + i)
        .get('values') as FormArray;
      if (varaibleValues.get(iw + '').get('variableType').valueChanges) {
        varaibleValues.get(iw + '').get('value').setValue('');
      }
    }
    if (value === 'condition') {
      const values = this.getConditionalValuesFormarray().get('' + i)
        .get('values') as FormArray;
      if (values.get(iw + '').get('variableType').valueChanges) {
        values.get(iw + '').get('value').setValue('');
      }
    }
  }

  addVariables() {
    this.disableAddVariable = true;
    if (this.getConditionalValuesFormarray().length === 0 && this.getAssignToVariableValuesFormArray().length === 0
      && this.getConditionalValuesFormarray().length === this.getAssignToVariableValuesFormArray().length) {
      this.addVariableFormGroup();
      const values = this.getConditionalValuesFormarray().get('' + 0).get('values') as FormArray;
      const varaibleValues = this.getAssignToVariableValuesFormArray().get('' + 0).get('values') as FormArray;
      this.conditionsList.forEach(condition => {
        const group = this.getValuesFormGroup();
        group.get('variableName').setValue(condition);
        values.push(group);
      });
      if (this.taskPropertyForm.get('assignToVariable').get('name').value !== '') {
        const group = this.getValuesFormGroup();
        group.get('variableName').setValue(this.taskPropertyForm.get('assignToVariable').get('name').value);
        varaibleValues.push(group);
      }
    } else {
      this.addVariableFormGroup();
      const values = this.getConditionalValuesFormarray().get('' + (this.getConditionalValuesFormarray().length - 1))
        .get('values') as FormArray;
      this.conditionsList.forEach(condition => {
        const group = this.getValuesFormGroup();
        group.get('variableName').setValue(condition);
        values.push(group);
      });
      if (this.taskPropertyForm.get('assignToVariable').get('name').value !== '') {
        const varaibleValues = this.getAssignToVariableValuesFormArray().get('' + (this.getConditionalValuesFormarray().length - 1))
          .get('values') as FormArray;
        const group = this.getValuesFormGroup();
        group.get('variableName').setValue(this.taskPropertyForm.get('assignToVariable').get('name').value);
        varaibleValues.push(group);
      }
    }
    this.enableAddVariables = true;
  }
  addVariableToArray() {
    this.addVariables();
    this.taskPropertyForm.markAsDirty();
  }

  addCondition(event, i) {
    if (event.value !== null) {
      this.taskPropertyForm.get('conditions').get('' + i).get('name').setValue(event.value);
      this.taskPropertyForm.get('conditions').get('' + i).get('dataType').setValue(event.dataType);

      const j = this.conditionsList.length;
      if (!this.conditionsList.some(filterColumn => filterColumn === event.value)) {
        if (this.conditionsList[i]) {
          this.conditionsList.splice(i, 1, event.value);
          for (let l = 0; l < this.getConditionalValuesFormarray().length; l++) {
            const index = l + '';
            const values = this.getConditionalValuesFormarray().get(index).get('values') as FormArray;
            if (values.length === 0 && i === 0) {
              values.get(i + '').get('variableName').setValue(event.value);
            } else {
              // tslint:disable-next-line:prefer-for-of
              for (let k = 0; k < values.length; k++) {
                if (k === i) {
                  values.get(i + '').get('variableName').setValue(event.value);
                }
              }
            }
          }
        } else {
          this.conditionsList.push(event.value);
          for (let i = 0; i < this.getConditionalValuesFormarray().length; i++) {
            const index = i + '';
            const values = this.getConditionalValuesFormarray().get(index).get('values') as FormArray;
            if (values.length === 0) {
              const group = this.getValuesFormGroup();
              group.get('variableName').setValue(event.value);
              values.push(group);
            } else {
              // tslint:disable-next-line:prefer-for-of
              for (let k = 0; k < values.length; k++) {
                if (k === j - 1) {
                  const group = this.getValuesFormGroup();
                  group.get('variableName').setValue(event.value);
                  values.push(group);
                }
              }
            }
          }
        }
        if (this.taskPropertyForm.get('assignToVariable').get('name').value !== '' && this.getConditionalValuesFormarray().length === 0
          && this.conditionsList.length > 0) {
          this.addVariables();
        }
      } else {
        this.snackbarForDBTask('Dupilicate Condition');
        this.getConditionalsFormarray().get('' + i).get('name').setValue(null);
      }
    }
  }

  deleteColumn(event, i) {
    if (this.getConditionalsFormarray().length === 1 && event !== null) {
      this.snackbarForDBTask('Atleast One Condition Is Required');
    }
    if (event !== null && this.getConditionalsFormarray().length > 1) {
      (this.taskPropertyForm.get('conditions') as FormArray).removeAt(i);
      this.conditionsList.splice(i, 1);
      for (let j = 0; j < this.getConditionalValuesFormarray().length; j++) {
        const index = j + '';
        const values = this.getConditionalValuesFormarray().get(index).get('values') as FormArray;
        // tslint:disable-next-line:prefer-for-of
        for (let k = 0; k < values.length; k++) {
          if (k === i) {
            values.removeAt(k);
          }
        }
      }
    }
    this.taskPropertyForm.markAsDirty();
    if (this.getConditionalsFormarray().length === 0) {
      (this.taskPropertyForm.get('conditions') as FormArray).push(this.getconditionsFormGroup());
    }
  }

  addassignToVariable() {
    if (this.conditionsList.some(filterColumn => filterColumn === this.taskPropertyForm.get('assignToVariable').get('name').value)) {
      this.taskPropertyForm.get('assignToVariable').get('name').setValue('');

      this.snackbarForDBTask('Duplicate Assign To Variable');
    }
    if (this.taskPropertyForm.get('assignToVariable').get('name').value !== '' && this.getConditionalValuesFormarray().length === 0
      && this.conditionsList.length > 0) {
      this.addVariables();
    }
    for (let i = 0; i < this.getAssignToVariableValuesFormArray().length; i++) {
      const varaibleValues = this.getAssignToVariableValuesFormArray().get('' + i)
        .get('values') as FormArray;
      // tslint:disable-next-line:prefer-for-of
      varaibleValues.get(0 + '').get('variableName').setValue(this.taskPropertyForm.get('assignToVariable').get('name').value);
    }
  }

  removeVariable(i) {
    if (this.getConditionalValuesFormarray() && this.getAssignToVariableValuesFormArray()) {
      this.getConditionalValuesFormarray().removeAt(i);
      this.getAssignToVariableValuesFormArray().removeAt(i);
      if (this.getConditionalValuesFormarray().length === 0 && this.getAssignToVariableValuesFormArray().length === 0) {
        this.addVariables();
      }
      this.taskPropertyForm.markAsDirty();
    }
  }

  initializeCallAnotherWorkflowForm() {
    this.taskPropertyForm = this.formBuilder.group({
      name: [],
      workflowName: ['', [Validators.required]],
      processDefinitionId: [],
      alias: ['', [Validators.required]],
      workflowKey: [''],
      workflowVersion: [''],
      callAnotherWorkflowFields: this.formBuilder.array([this.webServiceFieldMapping()])
    });
  }




  webServiceFieldMapping() {
    return this.formBuilder.group({
      fieldName: [''],
      fieldValue: [''],
      dataType: [''],
      variableType: ['pagefield']
    });
  }

  getWebServiceFieldValuesFormarray() {
    return (this.taskPropertyForm.get('callAnotherWorkflowFields') as FormArray);
  }

  webServiceCall(event, workflow) {
    if (event.isUserInput === true && workflow && this.workflowName !== event.source.value) {
      this.workflowName = null;
      this.enableLoadCallWorkflowFieldValues = false;
      this.taskPropertyForm.get('workflowKey').setValue(workflow.key);
      this.taskPropertyForm.get('workflowVersion').setValue(workflow.workflowVersion);
      this.taskPropertyForm.get('workflowName').setValue(workflow.processDefinitionName);
      this.taskPropertyForm.get('processDefinitionId').setValue(workflow.processDefinitionId);
      this.webServiceFieldValues(workflow.key, workflow.workflowVersion);
    }
  }

  webServiceFieldValues(key, version) {
    this.taskPropertyService.getWebServiceFieldValues(key, version).subscribe(data => {
      if (data.length > 0) {
        this.workflowWebServiceFieldValues = data;
        if (this.webServiceFieldMapping()) {
          this.taskPropertyForm.removeControl('callAnotherWorkflowFields');
        }
        if (this.workflowWebServiceFieldValues.length > 0) {
          for (let i = 0; i < this.workflowWebServiceFieldValues.length; i++) {
            const index = '' + i;
            this.taskPropertyForm.addControl('callAnotherWorkflowFields', this.formBuilder.array([]));
            this.getWebServiceFieldValuesFormarray().push(this.webServiceFieldMapping());
            const group = (this.getWebServiceFieldValuesFormarray().get(index) as FormGroup);
            group.get('fieldName').setValue(this.workflowWebServiceFieldValues[i].fieldId);
            group.get('dataType').setValue(this.workflowWebServiceFieldValues[i].datatype);
          }
          this.enableWebServiceForCallAnotherWorkflow = true;
        }
      } else {
        if (this.webServiceFieldMapping()) {
          this.taskPropertyForm.removeControl('callAnotherWorkflowFields');
        }
        this.enableWebServiceForCallAnotherWorkflow = false;
      }
    });

  }

  getCallAnotherWorkflowVariableType(roleIndex) {
    return this.getWebServiceFieldValuesFormarray().get(roleIndex + '').get('variableType');
  }

  variableTypeCallWorkflow(event, i) {
    if (event.value === 'constant') {
      this.getCallAnotherWorkflowVariableType(i).setValue('constant');
    } else {
      this.getCallAnotherWorkflowVariableType(i).setValue('pagefield');
    }
  }


  initializeWebServiceTaskForm() {
    this.taskPropertyForm = this.formBuilder.group({
      restartable: [true],
      name: [],
      httpMethod: ['', [Validators.required]],
      remoteUrl: ['', [Validators.required, Validators.pattern('^((\\http:-?))+[a-z0-9._%/+-]{2,200}$')]],
      connectionTimeout: [10],
      readTimeout: [10],
      contentType: ['', [Validators.required]],
      retryCount: [],
      retryTime: [],
      retryUnits: [],
      jsonErrorText: [],
      jsonSuccessText: [],
      authorization: [],
      customHeaders: this.formBuilder.array([this.getCustomHeadersFormGroup()]),
      queryParams: this.formBuilder.array([this.getCustomHeadersFormGroup()])
    });
  }

  setErrorsForDueTime() {
    const userApproval_dueTime = this.taskPropertyForm.get('userapproval_dueTime');
    const dueTimeUnits = this.taskPropertyForm.get('dueTimeUnits');

    if (userApproval_dueTime.value && dueTimeUnits.value) {
      userApproval_dueTime.setErrors(null);
      dueTimeUnits.setErrors(null);
    }

    if (userApproval_dueTime.value && !dueTimeUnits.value) {
      dueTimeUnits.markAsDirty();
    }

  }

  setErrorsForRetryCount() {
    const retryCount = this.taskPropertyForm.get('retryCount');
    const retryTime = this.taskPropertyForm.get('retryTime');
    const retryUnits = this.taskPropertyForm.get('retryUnits');
    if (retryUnits.value && retryTime.value && retryCount.value) {
      retryTime.setErrors(null);
      retryUnits.setErrors(null);
      retryCount.setErrors(null);
    }
    if (!retryUnits.value && !retryTime.value && !retryCount.value) {
      retryTime.setErrors(null);
      retryUnits.setErrors(null);
      retryCount.setErrors(null);
    }
    if (retryUnits.value && !retryTime.value && !retryCount.value) {
      retryTime.setErrors({ retryTimeRequired: true });
      retryCount.setErrors({ retryCountRequired: true });
    }
    if (!retryUnits.value && retryTime.value && !retryCount.value) {
      retryUnits.setErrors({ retryUnitsRequired: true });
      retryCount.setErrors({ retryCountRequired: true });
    }
    if (!retryUnits.value && !retryTime.value && retryCount.value) {
      retryUnits.setErrors({ retryUnitsRequired: true });
      retryTime.setErrors({ retryTimeRequired: true });
    }
    if (retryUnits.value && retryTime.value && !retryCount.value) {
      retryCount.setErrors({ retryCountRequired: true });
    }
    if (!retryUnits.value && retryTime.value && retryCount.value) {
      retryUnits.setErrors({ retryUnitsRequired: true });
    }
    if (retryUnits.value && !retryTime.value && retryCount.value) {
      retryTime.setErrors({ retryTimeRequired: true });
    }
  }

  getApiFormGroup() {
    return this.formBuilder.group({
      key: [''],
      value: [''],
      addTo: ['']
    });
  }

  addApiKeyFormGroupToArray() {
    this.getApiKeyFormArray().push(this.getApiFormGroup());
    this.taskPropertyForm.markAsDirty();
  }

  removeApiKeyFormGroupFromArray(i) {
    this.getApiKeyFormArray().removeAt(i);
    if (this.getApiKeyFormArray().length === 0) {
      this.getApiKeyFormArray().push(this.getApiFormGroup());
    }
    this.taskPropertyForm.markAsDirty();
  }

  getApiKeyFormArray() {
    return this.taskPropertyForm.get('apiKey').get('apiKey') as FormArray;
  }

  addRequestPayloadFormArray() {
    this.taskPropertyForm.addControl('webServiceRequestPayload', this.formBuilder.array([]));
    this.getCustomHeadersFormArray('webServiceRequestPayload').push(this.getCustomHeadersFormGroup());
  }

  getCustomHeadersFormGroup() {
    return this.formBuilder.group({
      key: [''],
      value: [''],
      variableType: ['pagefield']
    });
  }

  getCustomHeadersFormArray(arrayName) {
    return this.taskPropertyForm.get(arrayName) as FormArray;
  }

  addCustomHeaders(arrayName) {
    this.getCustomHeadersFormArray(arrayName).push(this.getCustomHeadersFormGroup());
  }

  addCustomHeadersArray(arrayName) {
    this.getCustomHeadersFormArray(arrayName).push(this.getCustomHeadersFormGroup());
    this.taskPropertyForm.markAsDirty();
  }

  removeCustomHeaders(i, arrayName) {
    this.getCustomHeadersFormArray(arrayName).removeAt(i);
    if (this.getCustomHeadersFormArray(arrayName).length === 0) {
      this.getCustomHeadersFormArray(arrayName).push(this.getCustomHeadersFormGroup());
    }
    this.taskPropertyForm.markAsDirty();
  }

  setErrorsForapiKey(api: FormGroup) {
    const key = api.get('key');
    const value = api.get('value');
    const addTo = api.get('addTo');
    if (key.value === '' && (value.value !== '' || addTo.value !== '')) {
      key.setErrors({ keyReq: true });
    }
    if (value.value === '' && (key.value !== '' || addTo.value !== '')) {
      value.setErrors({ valueReq: true });
    }
    if (addTo.value === '' && (value.value !== '' || key.value !== '')) {
      addTo.setErrors({ addToReq: true });
    }
  }

  setErrorsForValue(header: FormGroup, value: AbstractControl) {
    if (header.get('key').value && !header.get('value').value) {
      value.setErrors({ valueRequired: true });
    }
    if (!header.get('key').value && header.get('value').value) {
      header.get('key').setErrors({ keyRequired: true });
    }
    if (!header.get('value').value && !header.get('key').value) {
      header.get('value').setErrors(null);
      header.get('key').setErrors(null);
    }
  }

  setErrorsForKey(header: FormGroup, key: AbstractControl) {
    if (header.get('value').value && !header.get('key').value) {
      key.setErrors({ keyRequired: true });
    }
    if (!header.get('value').value && header.get('key').value) {
      header.get('value').setErrors({ valueRequired: true });
    }
    if (!header.get('value').value && !header.get('key').value) {
      header.get('value').setErrors(null);
      header.get('key').setErrors(null);
    }
  }

  configureAuthorizationFormGroups($event) {
    const type = $event.value;
    this.removeAuthorizationFormGroups(type);
    if (type !== 'noAuth') {
      this.taskPropertyForm.addControl(type, this.formBuilder.group({}));
      const group = this.taskPropertyForm.get(type) as FormGroup;
      this.addAuthorizationFormControls(group, type);
    }
  }

  removeAuthorizationFormGroups(name) {
    const forms = ['apiKey', 'bearerToken', 'basicAuth'];
    forms.forEach(form => {
      const group = this.taskPropertyForm.get(form) as FormGroup;
      if (group && name !== form) {
        this.taskPropertyForm.removeControl(form);
      }
    });
  }

  addAuthorizationFormControls(formGroup: FormGroup, type: string) {
    switch (type) {
      case 'apiKey': {
        formGroup.addControl('apiKey', this.formBuilder.array([this.getApiFormGroup()]));
      }
                     break;
      case 'bearerToken': {
        formGroup.addControl('token', this.formBuilder.control('', Validators.required));
        formGroup.addControl('variableType', this.formBuilder.control('pagefield', Validators.required));
      }
                          break;
      case 'basicAuth': {
        formGroup.addControl('userName', this.formBuilder.control('', Validators.required));
        formGroup.addControl('password', this.formBuilder.control('', Validators.required));
      }
    }
  }

  initializeStartTaskForm() {
    this.taskPropertyForm = this.formBuilder.group({
      name: [],
      assigneeUser: [],
      assigneeGroup: [''],
      propertyType: [],
      schedulerExpression: [],
      jsonText: [],
      isCustomForm: [false],
      publicForm: [],
      pageName: []
    });
  }

  initializeComputeTaskForm() {
    this.taskPropertyForm = this.formBuilder.group({
      restartable: [true],
      name: [],
      operator: ['', Validators.required],
      dataType: ['', Validators.required],
      leftAssignment: ['', Validators.required],
      rightAssignment: this.formBuilder.array([this.getAssignmentFormGroup()]),
      value: []
    });
  }

  disableComputeTaskFormControls() {
    if (this.data.nodeData.taskType === 'COMPUTE_TASK' && !this.taskPropertyForm.get('dataType').value) {
      this.taskPropertyForm.get('operator').disable();
      this.taskPropertyForm.get('leftAssignment').disable();
      this.getComputeTaskRightAssignmentFormarray().get('0').disable();
    }
  }

  buildValueFromOperator($event) {
    if (this.taskPropertyForm.get('leftAssignment').disabled) {
      this.taskPropertyForm.get('leftAssignment').enable();
    }
    if (this.taskPropertyForm.get('leftAssignment').value) {
      const operator = this.taskPropertyForm.get('operator').value;
      const array = this.getComputeTaskRightAssignmentFormarray();
      const length = array.length;
      if (operator === 'division' || operator === 'modulo') {
        for (let index = 0; index < length; index++) {
          if (index > 0 && length > 2) {
            array.removeAt(index);
          }
          const variableName = array.get('' + index).get('variableName');
          variableName.setValue('');
          variableName.setValidators(Validators.required);
          variableName.updateValueAndValidity();
        }
      }
      this.buidComputeTaskValue();
    }
  }

  computeTaskDataTypeValidation($event) {
    if (this.taskPropertyForm.get('operator').disabled) {
      this.taskPropertyForm.get('operator').enable();
    }
    if (this.getComputeTaskRightAssignmentFormarray().length > 1) {
      this.taskPropertyForm.removeControl('rightAssignment');
      this.taskPropertyForm.addControl('rightAssignment', this.formBuilder.array([]));
      this.addComputeTaskRightAssignmentFormroup();
    }
    if (this.getComputeTaskRightAssignmentFormarray().length === 1) {
      this.addComputeTaskRightAssignmentFormroup();
    }
    this.taskPropertyForm.get('value').setValue('');
    this.taskPropertyForm.get('operator').setValue('');
    this.buidComputeTaskValue();
  }


  buildComputeTaskValueWithAutocomplete($event, i) {
    if ($event.isUserInput === true) {
      this.taskPropertyForm.markAsDirty();
      this.getComputeTaskRightAssignmentFormarray().get('' + i).get('variableName').setValue($event.source.value);
      this.buidComputeTaskValue();
    }
  }

  enableComputetaskFormArrayControls() {
    if (this.taskPropertyForm.get('leftAssignment').value) {
      for (let i = 0; i < this.getComputeTaskRightAssignmentFormarray().length; i++) {
        if (this.getComputeTaskRightAssignmentFormarray().get('' + i).disabled) {
          this.getComputeTaskRightAssignmentFormarray().get('' + i).enable();
        }
      }
    }
  }

  setVariableAsEmpty(rule: FormGroup) {
    rule.get('variableName').setValue(null);
  }

  OnHumanSelected(i) {
    this.getComputeTaskRightAssignmentFormarray().get(i + '').get('variableType').setValue('constant');
    this.buidComputeTaskValue();
  }

  buidComputeTaskValue() {
    this.enableComputetaskFormArrayControls();
    if (this.taskPropertyForm.valid) {
      const formValue: string = this.taskPropertyForm.get('value').value;
      let value = this.taskPropertyForm.get('leftAssignment').value;
      value = value + ' = ';
      const operator = this.getOperator(this.taskPropertyForm.get('operator').value);
      const dataType = this.taskPropertyForm.get('dataType').value;
      for (let i = 0; i < this.getComputeTaskRightAssignmentFormarray().length; i++) {
        const index = i + '';
        const group = this.getComputeTaskRightAssignmentFormarray().get(index);
        let variableName = group.get('variableName').value;
        const variableType = group.get('variableType').value;
        const operatorValue = this.taskPropertyForm.get('operator').value;
        if (variableName) {
          if (dataType === 'date' && operatorValue === 'between') {
            variableName = this.datePipe.transform(variableName, 'MM/dd/yyyy');
          }
          if (i === 0) {
            value = value + '(' + variableName + ')';
          } else {
            value = value + ' ' + operator + ' (' + variableName + ')';
          }
        }
      }
      this.taskPropertyForm.get('value').setValue(value);
    }
  }

  checkUniqueValidationForComputeTask(index) {
    const array: FormArray = this.getComputeTaskRightAssignmentFormarray();
    const validationGroup = array.get('' + index);
    const name = validationGroup.get('variableName');
    name.setValidators(null);
    for (let i = 0; i < array.length; i++) {
      if (array.get('' + i).get('variableName').value === name.value && i !== index) {
        name.markAllAsTouched();
        this.taskPropertyForm.markAsDirty();
      }
    }
    this.buidComputeTaskValue();
  }


  getOperator(type) {
    switch (type) {
      case 'add': {
        return '+';
      }
      case 'subtraction': {
        return '-';
      }
      case 'multiplication': {
        return '*';
      }
      case 'division': {
        return '/';
      }
      case 'modulo': {
        return '%';
      }
      case 'between': {
        return '-';
      }
    }
  }


  getComputeTaskRightAssignmentFormarray() {
    return (this.taskPropertyForm.get('rightAssignment') as FormArray);
  }

  addComputeTaskRightAssignmentFormroup() {
    if (this.computeTaskValidationWithFormArray()) {
      this.getComputeTaskRightAssignmentFormarray().push(this.getAssignmentFormGroup());
      if (!this.taskPropertyForm.get('leftAssignment').value) {
        ((this.getComputeTaskRightAssignmentFormarray()
          .get('' + (this.getComputeTaskRightAssignmentFormarray().length - 1)) as FormGroup)).disable();
      }
      this.buidComputeTaskValue();
    }
  }

  addComputeRightArray() {
    this.addComputeTaskRightAssignmentFormroup();
    this.taskPropertyForm.markAsDirty();
  }


  computeTaskValidationWithFormArray() {
    const dataType = this.taskPropertyForm.get('dataType').value;
    const operator = this.taskPropertyForm.get('operator').value;
    if (this.getComputeTaskRightAssignmentFormarray().length >= 2 && (
      operator === 'division' || operator === 'modulo' || dataType === 'date')) {
      return false;
    } else { return true; }
  }

  removeComputeTaskRightAssignment(i, rule) {
    this.taskPropertyForm.markAsDirty();
    if (this.getComputeTaskRightAssignmentFormarray().length > 2) {
      this.getComputeTaskRightAssignmentFormarray().removeAt(i);
      this.buidComputeTaskValue();
    } else {
      rule.get('variableName').setValue(null);
      rule.get('variableName').setErrors({ req: true });
    }
  }



  initializeDecisionTaskForm() {
    this.taskPropertyForm = this.formBuilder.group({
      restartable: [true],
      name: [''],
      ifTargetTask: [''],
      elseTargetTask: [''],
      decisionLogic: this.formBuilder.group({
        logicOperator: ['', Validators.required],
        rules: this.formBuilder.array([this.addRulesFormGroup()])
      })
    });
  }

  addRulesFormGroup() {
    return this.formBuilder.group({
      leftAssignment: this.getAssignmentFormGroup(),
      operator: ['', [Validators.required]],
      rightAssignment: this.getAssignmentFormGroup(),
    });
  }

  getAssignmentFormGroup() {
    return this.formBuilder.group({
      dataType: [''],
      variableType: ['pagefield', [Validators.required]],
      variableName: ['', [Validators.required]]
    });
  }

  getLeftAssignment(roleIndex) {
    return this.getRulesFormArray().get(roleIndex + '').get('leftAssignment');
  }

  getRightAssignment(roleIndex) {
    return this.getRulesFormArray().get(roleIndex + '').get('rightAssignment');
  }

  checkValidation(roleIndex) {
    if (this.getRightAssignment(roleIndex).get('dataType').value !== this.getLeftAssignment(roleIndex).get('dataType').value) {
      return this.getRightAssignment(roleIndex).get('dataType').setErrors({ validationError: true });
    } else {
      this.getRightAssignment(roleIndex).get('dataType').setErrors(null);
    }
  }

  variableTypeChangeLeft(event, roleIndex) {
    if (event.value === 'constant') {
      this.enableLeftVariableTypeConstant = true;
      this.enableRightVariableTypeConstant = false;
      this.getLeftAssignment(roleIndex).get('variableType').setValue('constant');
      this.getLeftAssignment(roleIndex).get('variableName').setValue('');
      this.getRulesFormArray().get(roleIndex + '').get('operator').setValue('');
      this.assignmentGroup = this.getLeftAssignment(roleIndex).value;
      this.dataTypeDialog = this.openDataTypeDialog();
      this.processDataAfterDataTypeDialogClosed(roleIndex);
    } else {
      this.getLeftAssignment(roleIndex).get('variableName').setValue('');
      this.getRulesFormArray().get(roleIndex + '').get('operator').setValue('');
      this.getLeftAssignment(roleIndex).get('dataType').setValue('String');
    }
    this.checkValidation(roleIndex);
  }

  variableTypeChangeRight(event, roleIndex) {
    if (event.value === 'constant') {
      this.enableRightVariableTypeConstant = true;
      this.enableLeftVariableTypeConstant = false;
      this.getRightAssignment(roleIndex).get('variableType').setValue('constant');
      this.getRightAssignment(roleIndex).get('variableName').setValue('');
      this.assignmentGroup = this.getRightAssignment(roleIndex).value;
      this.dataTypeDialog = this.openDataTypeDialog();
      this.processDataAfterDataTypeDialogClosed(roleIndex);
    } else {
      this.getRightAssignment(roleIndex).get('variableName').setValue('');
      this.getRightAssignment(roleIndex).get('dataType').setValue('String');
    }
    this.checkValidation(roleIndex);
  }

  openDataTypeDialog() {
    return this.dialog.open(YoroFlowConfirmationDialogComponent, {
      width: '280px',
      height: '220px',
      data: { type: 'variableTypeChange', group: this.assignmentGroup }
    });
  }

  processDataAfterDataTypeDialogClosed(roleIndex) {
    this.dataTypeDialog.afterClosed().subscribe(variableType => {
      if (variableType.cancel === false) {
        // tslint:disable-next-line: max-line-length
        if (variableType.type === 'constant' && this.getLeftAssignment(roleIndex).get('dataType').value === '' && this.enableLeftVariableTypeConstant) {
          this.getLeftAssignment(roleIndex).get('variableType').setValue('pagefield');
          this.getLeftAssignment(roleIndex).get('dataType').setValue('Text');
        } else if (this.getRightAssignment(roleIndex).get('dataType').value === '' && this.enableRightVariableTypeConstant) {
          this.getRightAssignment(roleIndex).get('variableType').setValue('pagefield');
          this.getRightAssignment(roleIndex).get('dataType').setValue('Text');
        }
      } else {
        if (variableType !== false && variableType !== undefined) {
          if (variableType.variableType === 'constant' && this.enableLeftVariableTypeConstant) {
            this.getLeftAssignment(roleIndex).setValue(variableType);
            this.getLeftAssignment(roleIndex).get('variableName').setValue('');
            this.checkValidation(roleIndex);
            if (variableType.dataType === 'text' || variableType.dataType === 'Text' || variableType.dataType === 'string' ||
              variableType.dataType === 'STRING' || variableType.dataType === 'String') {
              this.filterDataType[roleIndex] = 'text';
            } else if (variableType.dataType === 'number' || variableType.dataType === 'Number' || variableType.dataType === 'NUMBER'
              || variableType.dataType === 'Long' || variableType.dataType === 'Double') {
              this.filterDataType[roleIndex] = 'number';
            } else if (variableType.dataType === 'Boolean' || variableType.dataType === 'boolean') {
              this.filterDataType[roleIndex] = 'boolean';
            } else {
              this.filterDataType[roleIndex] = 'date';
            }
          }
          if (variableType.variableType === 'constant' && this.enableRightVariableTypeConstant) {
            this.getRightAssignment(roleIndex).setValue(variableType);
            this.getRightAssignment(roleIndex).get('variableName').setValue('');
            this.checkValidation(roleIndex);
          }
        }
      }
    });
  }

  getRulesFormArray() {
    return (this.taskPropertyForm.get('decisionLogic').get('rules') as FormArray);
  }

  setDefaultValuesLeftRule() {
    if (this.getRulesFormArray().length === 1) {
      return this.getRulesFormArray().get('0').get('leftAssignment');
    } else {
      return this.getRulesFormArray().get('' + (this.getRulesFormArray().length - 1))
        .get('leftAssignment');
    }
  }

  setDefaultValuesRightRule() {
    if (this.getRulesFormArray().length === 1) {
      return this.getRulesFormArray().get('0').get('rightAssignment');
    } else {
      return this.getRulesFormArray().get('' + (this.getRulesFormArray().length - 1))
        .get('rightAssignment');
    }
  }

  addRules() {
    this.getRulesFormArray().push(this.addRulesFormGroup());
    this.setDefaultValuesLeftRule().get('variableType').setValue('pagefield');
    this.setDefaultValuesLeftRule().get('dataType').setValue('String');
    this.setDefaultValuesRightRule().get('variableType').setValue('pagefield');
    this.setDefaultValuesRightRule().get('dataType').setValue('String');
  }

  addArray() {
    this.addRules();
    this.taskPropertyForm.markAsDirty();
  }

  removeRules(i) {
    this.getRulesFormArray().removeAt(i);
    this.taskPropertyForm.markAsDirty();
  }

  initializeUserTaskForm() {
    this.taskPropertyForm = this.formBuilder.group({
      formIdentifier: ['', [Validators.required]],
      formVersion: [],
      pageName: [],
      assigneeUser: [],
      assigneeGroup: [''],
      autoAssignUser: [],
      dueTime: [],
      dueTimeUnits: [''],
      userapproval_dueTime: [],
      launchButtonName: ['View Details', [Validators.required]],
      approveButtonName: ['Submit Changes', [Validators.required]],
      isCancellableWorkflow: [false],
      enableSaveAsDraft: [false],
      message: ['Do you want to submit this task ?', [Validators.required]],
      cancelButtonName: ['Cancel'],
      endWorkflowWhenCancelled: [true],
      connectionForCancel: [''],
      connectionNotForCancel: [''],
      name: ['', [Validators.required]],
      reminderTime: [''],
      reminderUnits: [''],
      isApprovalForm: [],
      isCustomForm: [false],
      remainderDetails: []
    });
    if (this.taskType === 'APPROVAL_TASK') {
      this.taskPropertyForm.removeControl('message');
      this.taskPropertyForm.addControl('approveMessage', this.formBuilder.control('Do you want to approve this task ?', [Validators.required]));
      this.taskPropertyForm.addControl('rejectMessage', this.formBuilder.control('Do you want to reject this task ?', [Validators.required]));
      this.taskPropertyForm.addControl('aproveButtonName', this.formBuilder.control('Approve', [Validators.required]));
      this.taskPropertyForm.addControl('rejectButtonName', this.formBuilder.control('Reject', [Validators.required]));
      this.taskPropertyForm.addControl('sendBackButtonName', this.formBuilder.control('Send Back', [Validators.required]));
      this.taskPropertyForm.addControl('printOnScreen', this.formBuilder.control(''));
      this.taskPropertyForm.addControl('enablePrinting', this.formBuilder.control(false));
    }
  }

  addCancelValidation(event) {
    if (event.checked) {
      this.taskPropertyForm.get('cancelButtonName').setValidators(Validators.required);
    } else {
      this.taskPropertyForm.get('cancelButtonName').setValidators(null);
    }
    this.taskPropertyForm.get('cancelButtonName').updateValueAndValidity();
  }


  initializeEmailTaskForm() {
    this.taskPropertyForm = this.formBuilder.group({
      restartable: [true],
      attachFile: [''],
      subject: ['', [Validators.required]],
      name: ['', [Validators.required]],
      emailTemplate: ['', [Validators.required]],
      cc: [],
      bcc: [],
      fieldType: [false],
      repeatableField: [],
      senderName: [],
      emailToPageFields: [],
      emailCCPageFields: [],
      emailBCCPageFields: [],
      emailTo: ['', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')]],
      emailCC: ['', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')]],
      emailBCC: ['', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')]],
      emailFrom: ['', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')]],
    });
  }

  initializeDelayTimeTaskForm() {
    this.taskPropertyForm = this.formBuilder.group({
      assigneeUser: [],
      assigneeGroup: [],
      name: ['', [Validators.required]],
      units: ['', [Validators.required]],
      time: ['', [Validators.required]],
    });
  }

  initializeDBTaskForm() {
    this.taskPropertyForm = this.formBuilder.group({
      restartable: [true],
      name: [],
      tableName: ['', [Validators.required]],
      tableId: [''],
      dbType: ['', [Validators.required]],
      actionType: ['', [Validators.required]],
      query: [''],
      isSingleValue: [false],
      fieldType: [false],
      arrayFieldName: [''],
      arrayFieldId: [''],
      fieldValues: this.formBuilder.array([this.selectFieldsFormGroup()]),
      whereClause: this.formBuilder.array([this.whereClauseFormGroup()]),
      sortBy: this.formBuilder.array([this.sortByFormGroup()]),
      limit: ['', [Validators.min(1), Validators.max(1000)]],
    });
  }

  getDBTaskfieldValuesFormarray() {
    return (this.taskPropertyForm.get('fieldValues') as FormArray);
  }

  selectFieldsFormGroup() {
    return this.formBuilder.group({
      fieldName: [''],
      aliasName: [''],
      insertValue: [''],
      dataType: ['']
    });
  }

  insertFieldsFormGroup() {
    return this.formBuilder.group({
      fieldName: [''],
      insertFieldVariableType: ['pageFields'],
      insertValue: [],
      isRequired: [false],
      dataType: []
    });
  }

  addDBTaskFieldValuesFormGroup(i) {
    const errorNumberList: number[] = [];
    for (let j = 0; j < this.getDBTaskfieldValuesFormarray().length; j++) {
      const field = this.getDBTaskfieldValuesFormarray().get('' + j).get('fieldName');
      if (field.errors && field.errors.unique === true) {
        errorNumberList.push(j);
      }
    }
    if (this.getDBTaskfieldValuesFormarray().length === 0) {
      this.getDBTaskfieldValuesFormarray().push(this.selectFieldsFormGroup());
    } else if (this.getDBTaskfieldValuesFormarray().length === this.columnValuesLength) {
      this.snackbarForDBTask('Added Maximum Fields');
    } else {
      this.getDBTaskfieldValuesFormarray().push(this.selectFieldsFormGroup());
      errorNumberList.forEach(errorNumber => {
        if (errorNumber) {
          this.getDBTaskfieldValuesFormarray().get('' + errorNumber).get('fieldName').setErrors({ unique: true });
        }
      });
    }
    if (this.getDBTasksortByFormarray().length > 0) {
      for (let j = 0; j < this.getDBTasksortByFormarray().length; j++) {
        this.setOrderFieldsError(j);
      }
    }
  }

  // dont delete this
  addDBTaskFieldValuesFormGroups(i) {
    if (this.getDBTaskfieldValuesFormarray().length === 0) {
      this.getDBTaskfieldValuesFormarray().push(this.selectFieldsFormGroup());
    } else {
      const fieldValuesValidation = this.taskPropertyForm.get('fieldValues');
      if (fieldValuesValidation.get(i + '').get('fieldName').value === '') {
        // const fieldName = fieldValuesValidation.get(i + '').get('fieldName');
        // fieldName.markAllAsTouched();
        // fieldName.setErrors({ req: true });
        // this.snackbarForDBTask('Duplicate field name');
      }
      if ((this.taskPropertyForm.get('actionType').value === 'insert'
        || this.taskPropertyForm.get('actionType').value === 'update')) {
        if (fieldValuesValidation.get(i + '').get('insertValue').value === '') {
          // const insertValue = fieldValuesValidation.get(i + '').get('insertValue');
          // insertValue.markAllAsTouched();
          // insertValue.setErrors({ req: true });
        }
        if (fieldValuesValidation.get(i + '').get('fieldName').value !== ''
          && fieldValuesValidation.get(i + '').get('insertValue').value !== '') {
          this.getDBTaskfieldValuesFormarray().push(this.insertFieldsFormGroup());
        }
      }
      if (this.taskPropertyForm.get('actionType').value === 'select') {
        if (fieldValuesValidation.get(i + '').get('fieldName').value !== '') {
          this.getDBTaskfieldValuesFormarray().push(this.selectFieldsFormGroup());
        }
      }
    }
    this.taskPropertyForm.markAsDirty();
  }

  queryFieldsFormGroup(value, type) {
    if (value === 'select') {
      this.getDBTaskfieldValuesFormarray().push(this.selectFieldsFormGroup());
    } else if ((value === 'update' || value === 'insert') && type === 'load') {
      this.getDBTaskfieldValuesFormarray().push(this.insertFieldsFormGroup());
    } else if ((value === 'update' || value === 'insert') && type === 'action') {
      if (this.columnValues[this.tableName]) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.columnValues[this.tableName].length; i++) {
          this.getDBTaskfieldValuesFormarray().push(this.insertFieldsFormGroup());
          this.getDBTaskfieldValuesFormarray().get('' + i).get('fieldName').setValue(this.columnValues[this.tableName][i].columnIdentifier);
          this.getDBTaskfieldValuesFormarray().get('' + i).get('isRequired').setValue(this.columnValues[this.tableName][i].isRequired);
          this.getDBTaskfieldValuesFormarray().get('' + i).get('dataType').setValue(this.columnValues[this.tableName][i].dataType);
          if (this.columnValues[this.tableName][i].isRequired === 'true' && value === 'insert') {
            const fieldValidation = this.taskPropertyForm.get('fieldValues');
            const fieldName = fieldValidation.get(i + '').get('insertValue');
            // fieldName.markAllAsTouched();
            fieldName.setValidators([Validators.required]);
            fieldName.updateValueAndValidity();
          }
        }
      }
    }
  }

  insertQueryFields(data) {
    this.columnValues[this.tableName] = null;
    this.columnValues[this.tableName] = data;
    if (this.columnValues[this.tableName]) {
      this.taskPropertyForm.removeControl('fieldValues');
      this.taskPropertyForm.addControl('fieldValues', this.formBuilder.array([]));
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.columnValues[this.tableName].length; i++) {
        this.getDBTaskfieldValuesFormarray().push(this.insertFieldsFormGroup());
        this.getDBTaskfieldValuesFormarray().get('' + i).get('fieldName').setValue(this.columnValues[this.tableName][i].columnIdentifier);
        this.getDBTaskfieldValuesFormarray().get('' + i).get('isRequired').setValue(this.columnValues[this.tableName][i].isRequired);
        this.getDBTaskfieldValuesFormarray().get('' + i).get('dataType').setValue(this.columnValues[this.tableName][i].dataType);
        if (this.columnValues[this.tableName][i].isRequired === 'true' && this.taskPropertyForm.get('actionType').value === 'insert') {
          const fieldValidation = this.taskPropertyForm.get('fieldValues');
          const fieldName = fieldValidation.get(i + '').get('insertValue');
          // fieldName.markAllAsTouched();
          fieldName.setValidators([Validators.required]);
          fieldName.updateValueAndValidity();
        }
      }
    }
  }

  removeFieldValues(i) {
    this.getDBTaskfieldValuesFormarray().removeAt(i);
    this.fieldNames.splice(i, 1);
    this.buildQuery();
    if (this.getDBTaskfieldValuesFormarray().length === 0 && this.taskPropertyForm.get('actionType').value === 'select') {
      this.getDBTaskfieldValuesFormarray().push(this.selectFieldsFormGroup());
    } else {
      for (let j = 0; j < this.getDBTaskfieldValuesFormarray().length; j++) {
        this.setFieldNameError(j);
      }
    }
    this.taskPropertyForm.markAsDirty();
  }

  removeInsertUpdateFieldValues(i, isRequired) {
    if (this.taskPropertyForm.get('actionType').value === 'insert' && isRequired === 'true') {
      const fieldName = this.taskPropertyForm.get('fieldValues').get(i + '').get('insertValue');
      fieldName.markAsTouched();
      if (fieldName && fieldName.value !== '' && fieldName.value !== null && fieldName.value !== undefined) {
        this.snackbarForDBTask('This is a required field');
      }
    } else {
      const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
        width: '400px',
        height: '130px',
        data: 'confirm-update'
      });
      dialogRef.afterClosed().subscribe(response => {
        if (response === true) {
          this.getDBTaskfieldValuesFormarray().removeAt(i);
          this.fieldNames.splice(i, 1);
          this.buildQuery();
        }
      });
    }
    // if (this.taskPropertyForm.get('actionType').value === 'update')else {
    //   this.getDBTaskfieldValuesFormarray().removeAt(i);
    //   this.fieldNames.splice(i, 1);
    //   this.buildQuery();
    // }
    this.taskPropertyForm.markAsDirty();
  }

  getDBTaskwhereClauseFormarray() {
    return (this.taskPropertyForm.get('whereClause') as FormArray);
  }

  whereClauseFormGroup() {
    return this.formBuilder.group({
      filterCondition: ['AND'],
      filtersInsideCondition: this.formBuilder.array([this.filterValuesFormGroup()]),
    });
  }

  getDBTaskfiltersInsideConditionFormarray(iw) {
    return (this.taskPropertyForm.controls.whereClause as FormArray).at(iw).get('filtersInsideCondition') as FormArray;
  }

  filterValuesFormGroup() {
    return this.formBuilder.group({
      filterName: [''],
      filterOperator: [''],
      filterValue: [''],
      filterFieldVariableType: ['pageFields']
    });
  }

  addDBTaskFiltersInsideConditionFormGroup(i, iw) {
    if (this.getDBTaskfiltersInsideConditionFormarray(iw).length === 0) {
      this.getDBTaskfiltersInsideConditionFormarray(iw).push(this.filterValuesFormGroup());
    } else {
      const filterValidation = this.taskPropertyForm.get('whereClause').get(iw + '').get('filtersInsideCondition');
      if (filterValidation.get(i + '').get('filterName').value === '') {
      }
      if (filterValidation.get(i + '').get('filterOperator').value === '') {

      }
      if (filterValidation.get(i + '').get('filterValue').value === '') {

      }
      if (filterValidation.get(i + '').get('filterName').value !== '' && filterValidation.get(i + '').get('filterOperator').value !== ''
        && filterValidation.get(i + '').get('filterValue').value !== '') {
        this.getDBTaskfiltersInsideConditionFormarray(iw).push(this.filterValuesFormGroup());
      }
    }
  }

  removeFiltersInsideCondition(i, iw) {
    this.getDBTaskfiltersInsideConditionFormarray(iw).removeAt(i);
    this.orderFilterNames.splice(i, 1);
    this.buildQuery();
    if (this.getDBTaskfiltersInsideConditionFormarray(iw).length === 0) {
      this.getDBTaskfiltersInsideConditionFormarray(iw).push(this.filterValuesFormGroup());
    }
  }

  addDBTaskWhereClauseFormGroup() {
    this.getDBTaskwhereClauseFormarray().push(this.whereClauseFormGroup());
  }

  removeWhereClause(i) {
    this.getDBTaskwhereClauseFormarray().removeAt(i);
    this.orderFilterNames.splice(i, 1);
    this.buildQuery();
    if (this.orderFilterNames.length === 0 && i === 0) {
      this.getDBTaskwhereClauseFormarray().push(this.whereClauseFormGroup());
    }
  }

  getDBTasksortByFormarray() {
    return (this.taskPropertyForm.get('sortBy') as FormArray);
  }

  sortByFormGroup() {
    return this.formBuilder.group({
      orderFieldName: [''],
      orderCondition: ['']
    });
  }

  addDBTasksortByFormGroup(i) {
    const errorNumberOrderList: number[] = [];
    for (let j = 0; j < this.getDBTasksortByFormarray().length; j++) {
      const field = this.getDBTasksortByFormarray().get('' + j).get('orderFieldName');
      if (field.errors && field.errors.unique === true) {
        errorNumberOrderList.push(j);
      }
    }
    if (this.getDBTasksortByFormarray().length === 0) {
      this.getDBTasksortByFormarray().push(this.sortByFormGroup());
    }
    const orderValidation = this.taskPropertyForm.get('sortBy');
    if (orderValidation.get(i + '').get('orderFieldName').value === '') {

    }
    if (orderValidation.get(i + '').get('orderCondition').value === '') {

    }
    if (this.getDBTasksortByFormarray().length === this.columnValuesLength) {
      this.snackbarForDBTask('Added Maximum Fields');
    } else if (orderValidation.get(i + '').get('orderFieldName').value !== '' &&
      orderValidation.get(i + '').get('orderCondition').value !== '') {
      this.getDBTasksortByFormarray().push(this.sortByFormGroup());
      errorNumberOrderList.forEach(errorNumber => {
        if (errorNumber) {
          this.getDBTasksortByFormarray().get('' + errorNumber).get('orderFieldName').setErrors({ unique: true });
        }
      });
    }
    if (this.getDBTaskfieldValuesFormarray().length > 0) {
      for (let j = 0; j < this.getDBTaskfieldValuesFormarray().length; j++) {
        this.setFieldNameError(j);
      }
    }
  }

  removeSortBy(i) {
    this.getDBTasksortByFormarray().removeAt(i);
    this.orderFieldNames.splice(i, 1);
    this.buildQuery();
    if (this.getDBTasksortByFormarray().length === 0) {
      this.getDBTasksortByFormarray().push(this.sortByFormGroup());
    } else {
      for (let j = 0; j < this.getDBTasksortByFormarray().length; j++) {
        this.setOrderFieldsError(j);
      }
    }
  }

  getQueryFormControl() {
    return this.taskPropertyForm.get('query') as AbstractControl;
  }

  getFieldListFormControl() {
    return this.taskPropertyForm.get('fieldList') as AbstractControl;
  }

  setTableName($event) {
    const value = $event.source.value;
    if ($event.isUserInput === true && value) {
      this.taskPropertyForm.get('tableName').setValue(value);
      this.buildQuery();
    }
  }

  getFieldNames(): FieldName[] {
    // tslint:disable-next-line: prefer-const
    let fieldNames: FieldName[] = [];
    for (let i = 0; i < this.getDBTaskfieldValuesFormarray().length; i++) {
      const name = this.getDBTaskfieldValuesFormarray().get('' + i).get('fieldName').value;
      if (name !== null && name !== undefined && name !== '') {
        fieldNames.push({ index: i, value: name });
      }
    }
    return fieldNames;
  }

  setFieldNameError(i) {
    const value = this.getDBTaskfieldValuesFormarray().get('' + i).get('fieldName').value;
    const fieldNames: FieldName[] = this.getFieldNames();
    for (let j = 0; j < this.getDBTaskfieldValuesFormarray().length; j++) {
      const field = this.getDBTaskfieldValuesFormarray().get('' + j).get('fieldName');
      if (fieldNames.some(name => (name.index !== i && name.value === value))) {
        this.getDBTaskfieldValuesFormarray().get('' + i).get('fieldName').setErrors({ unique: true });
      }
      if (field.errors && field.errors.unique === true) {
        if (!fieldNames.some(name => (name.value === field.value && name.index !== j))) {
          field.setErrors(null);
        }
      }
      field.markAsTouched({ onlySelf: true });
    }
  }

  setFieldName($event, tableName, i, column) {
    if ($event.isUserInput === true) {
      // this.setFieldNameError(i);
      const fieldNameValue = $event.source.value;
      this.tableAndFieldName = '';
      if (this.duplicateFields) {
        this.getDBTaskfieldValuesFormarray().get('' + i).get('fieldName').setValue('');
        this.snackbarForDBTask('Duplicate field name');
        this.getDBTaskfieldValuesFormarray().get('' + i).get('fieldName').setErrors({ unique: true });
      }
      if (fieldNameValue && !this.duplicateFields) {
        if (this.taskPropertyForm.get('actionType').value === 'select') {
          this.tableAndFieldName = (tableName + '.' + fieldNameValue);
          this.enableFilterSortLimit = true;
          this.getDBTaskfieldValuesFormarray().get('' + i).get('aliasName').setValue(fieldNameValue);
          this.getDBTaskfieldValuesFormarray().get('' + i).get('dataType').setValue(column.dataType);
        } else {
          this.aliasFieldEnable = false;
          this.fieldNames.push(tableName + '.' + fieldNameValue);
          this.buildQuery();
        }
      }
    }
  }


  setAliasName(i) {
    const fieldName = this.tableAndFieldName;
    const aliasName = this.getDBTaskfieldValuesFormarray().get('' + i).get('aliasName') as AbstractControl;
    if (fieldName.value !== '' && aliasName.value) {
      this.fieldNames.splice(+i, 1, fieldName + ' AS ' + aliasName.value);
      this.buildQuery();
    }
  }

  setInsertValue(event, i) {
    const fieldName = this.tableAndFieldName;
    const insertValues = this.getDBTaskfieldValuesFormarray().get('' + i).get('insertValue');

  }

  whereClauseValidation(i, iw) {
    const filterName = this.getDBTaskfiltersInsideConditionFormarray(iw).get('' + i).get('filterName');
    const filterValue = this.getDBTaskfiltersInsideConditionFormarray(iw).get('' + i).get('filterValue');
    const filterOperator = this.getDBTaskfiltersInsideConditionFormarray(iw).get('' + i).get('filterOperator');
    if (filterName.value === '' && (filterValue.value !== '' || filterOperator.value !== '')) {
      filterName.setErrors({ req: true });
    }
    if (filterOperator.value === '' && (filterName.value !== '' || filterValue.value !== '')) {
      filterOperator.setErrors({ req: true });
    }
    if (filterValue.value === '' && (filterName.value !== '' || filterOperator.value !== '')) {
      filterValue.setErrors({ req: true });
    }
    this.taskPropertyForm.markAsDirty();
  }

  orderFilterName($event, dataType, tableName, i, iw, fieldType) {
    this.changedDataType = dataType;
    const value = $event.source.value;
    if ($event.isUserInput === true && value) {
      this.getDBTaskfiltersInsideConditionFormarray(iw).get('' + i).get('filterName').setValue(value);
      this.tableAndFilterName = tableName + '.' + value;
      this.enableFilterButton();
      this.whereClauseValidation(i, iw);
    }
  }

  orderfilterOperator($event, i, iw) {
    const value = $event.source.value;
    if ($event.isUserInput === true && value) {
      this.getDBTaskfiltersInsideConditionFormarray(iw).get('' + i).get('filterOperator').setValue(value);
      this.filterOperatorValue = value;
      this.enableFilterButton();
      this.whereClauseValidation(i, iw);
    }
  }

  orderFilterValue(i, iw) {
    const filterValue = this.getDBTaskfiltersInsideConditionFormarray(iw).get('' + i).get('filterValue') as AbstractControl;
    if (filterValue.value) {
      this.whereFilterValue = filterValue.value;
      this.enableFilterButton();
      this.whereClauseValidation(i, iw);
    }
  }



  filterCondition(event, i) {
    const value = event.source.value;
    if (event.isUserInput === true && value) {
      this.getDBTaskwhereClauseFormarray().get('' + i).get('filterCondition').setValue(value);
      this.whereFilterCondition = value;
      this.enableFilterButton();
    }
  }

  enableFilterButton() {
    if (this.tableAndFilterName && this.filterOperatorValue &&
      this.whereFilterValue) {
      this.enableFiltersButton = false;
    } else {
      this.enableFiltersButton = true;
    }
  }

  addFilterByQueryInfo(i) {
    this.orderFilterNames.forEach(filter => {
      if (filter === this.tableAndFilterName + ' ' + this.filterOperatorValue + ' ' + '\'' + this.whereFilterValue + '\''
        || filter === this.tableAndFilterName + ' ' + this.filterOperatorValue + ' ' + this.whereFilterValue) {
        this.duplicateFilters = true;
      }
    }
    );
    if (this.duplicateFilters) {
      this.snackbarForDBTask('Duplicate filter');
    }
    if (!this.duplicateFilters) {
      this.duplicateFilters = false;
      if (this.enableConstantForFilter) {
        this.orderFilterNames.push(' ' + this.whereFilterCondition + ' ' + this.tableAndFilterName + ' ' +
          this.filterOperatorValue + ' ' + '\'' + this.whereFilterValue + '\'');
        this.buildQuery();
      }
      if (this.enablePageFieldForFilter) {
        this.orderFilterNames.splice(+i, 1, (' ' + this.whereFilterCondition + ' ' +
          this.tableAndFilterName + ' ' + this.filterOperatorValue + ' ' + this.whereFilterValue));
        this.buildQuery();
      }
    }
    this.enableFilterButton();
  }

  getOrderFields(): FieldName[] {
    // tslint:disable-next-line: prefer-const
    let fieldNames: FieldName[] = [];
    for (let i = 0; i < this.getDBTasksortByFormarray().length; i++) {
      const name = this.getDBTasksortByFormarray().get('' + i).get('orderFieldName').value;
      if (name !== null && name !== undefined && name !== '') {
        fieldNames.push({ index: i, value: name });
      }
    }
    return fieldNames;
  }

  setOrderFieldsError(i) {
    const value = this.getDBTasksortByFormarray().get('' + i).get('orderFieldName').value;
    const fieldNames: FieldName[] = this.getOrderFields();
    for (let j = 0; j < this.getDBTasksortByFormarray().length; j++) {
      const field = this.getDBTasksortByFormarray().get('' + j).get('orderFieldName');
      if (fieldNames.some(name => (name.index !== i && name.value === value))) {
        this.getDBTasksortByFormarray().get('' + i).get('orderFieldName').setErrors({ unique: true });
      }
      if (field.errors && field.errors.unique === true) {
        if (!fieldNames.some(name => (name.value === field.value && name.index !== j))) {
          field.setErrors(null);
        }
      }
      field.markAsTouched({ onlySelf: true });
    }
  }

  orderValidation(i) {
    const orderFieldName = this.getDBTasksortByFormarray().get('' + i).get('orderFieldName');
    const orderDirection = this.getDBTasksortByFormarray().get('' + i).get('orderCondition');
    if (orderFieldName.value === '' && orderDirection.value !== '') {
      orderFieldName.setErrors({ req: true });
    }
    if (orderDirection.value === '' && orderFieldName.value !== '') {
      orderDirection.setErrors({ req: true });
    }
    this.taskPropertyForm.markAsDirty();
  }

  orderFieldName($event, tableName, i) {
    const value = $event.source.value;
    if ($event.isUserInput === true && value) {
      this.getDBTasksortByFormarray().get('' + i).get('orderFieldName').setValue(value);
      this.orderFieldValue = tableName + '.' + value;
      this.enableOrderButton();
      this.orderValidation(i);
      this.setOrderFieldsError(i);
    }
  }

  orderDirection($event, i) {
    const value = $event.source.value;
    if ($event.isUserInput === true && value) {
      this.getDBTasksortByFormarray().get('' + i).get('orderCondition').setValue(value);
      this.orderCondition = value;
      this.enableOrderButton();
      this.orderValidation(i);
    }
  }

  addOrderByQueryInfo(i) {
    this.orderFieldNames.forEach(filterValue => {
      if (filterValue === this.orderFieldValue + ' ' + this.orderCondition) {
        this.duplicateOrders = true;
      }
    }
    );
    if (this.duplicateOrders) {
      this.snackbarForDBTask('Duplicate order');
    }
    if (!this.duplicateOrders) {
      this.duplicateOrders = false;
      this.orderFieldNames.splice(+i, 1, (this.orderFieldValue + ' ' + this.orderCondition));
      this.buildQuery();
    }
    this.enableOrderButton();
  }

  enableOrderButton() {
    if (this.orderFieldValue && this.orderCondition) {
      this.enableOrdersButton = false;
    } else {
      this.enableOrdersButton = true;
    }
  }

  setQueryLimit() {
    const limit = this.taskPropertyForm.get('limit') as AbstractControl;
    if (limit.value) {
      this.buildQuery();
    }
  }

  buildQuery() {
    this.getQueryFormControl().setValue('');
    if ((this.taskPropertyForm.get('actionType').value && this.fieldNames.length > 0 && this.taskPropertyForm.get('tableName').value)
      || (this.taskPropertyForm.get('actionType').value === 'delete')) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.tableName + '');
      this.enableFilterSortLimit = true;
    }

    if (this.enableFilterSortLimit && this.orderFilterNames.length > 0) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.tableName + ' WHERE ' + this.orderFilterNames.join('') + '');
    }

    if (this.enableFilterSortLimit && this.orderFieldNames.length > 0) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.tableName + ' ORDER BY ' + this.orderFieldNames.join(',') + '');
    }

    if (this.enableFilterSortLimit && this.orderFilterNames.length > 0 && this.orderFieldNames.length > 0) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.tableName + ' WHERE ' + this.orderFilterNames.join('') +
        ' ORDER BY ' + this.orderFieldNames.join(',') + '');
    }

    if (this.enableFilterSortLimit && this.orderFilterNames.length > 0 && this.taskPropertyForm.get('limit').value) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.tableName + ' WHERE ' + this.orderFilterNames.join('') + ' LIMIT ' + this.taskPropertyForm.get('limit').value
        + '');
    }

    if (this.enableFilterSortLimit && this.orderFilterNames.length > 0 && this.orderFieldNames.length > 0
      && this.taskPropertyForm.get('limit').value) {
      this.getQueryFormControl().setValue(this.taskPropertyForm.get('actionType').value + ' ' + this.fieldNames.join(',') + ' from' + ' ' +
        this.tableName + ' WHERE ' + this.orderFilterNames.join('') + ' ORDER BY ' +
        this.orderFieldNames.join(',') + ' LIMIT ' + this.taskPropertyForm.get('limit').value + '');
    }
  }

  snackbarForDBTask(data) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data
    });
  }



  radioChange(event) {
    if (event.value === 'launch') {
      this.launchTextAreaEnable = true;
    } else {
      this.taskPropertyForm.get('jsonText').setValue('');
    }
    if (event.value === 'manual') {
      this.launchTextAreaEnable = false;
      this.enableFieldMapping = false;
      this.arrayFields = [];
      this.tableFields = [];
      this.fieldsList = [];
      this.editFormOptionEnable = false;
      this.taskPropertyForm.addControl('formIdentifier', this.formBuilder.control('', [Validators.required]));
      this.taskPropertyForm.addControl('formVersion', this.formBuilder.control(''));
      this.taskPropertyForm.addControl('isCustomForm', this.formBuilder.control(false));
      this.taskPropertyForm.addControl('launchButtonName', this.formBuilder.control('View Details', [Validators.required]));
      this.taskPropertyForm.addControl('approveButtonName', this.formBuilder.control('Submit Changes', [Validators.required]));
      this.taskPropertyForm.addControl('isCancellableWorkflow', this.formBuilder.control(''));
      this.taskPropertyForm.addControl('cancelButtonName', this.formBuilder.control('Cancel'));
      this.taskPropertyForm.addControl('endWorkflowWhenCancelled', this.formBuilder.control(true));
      this.taskPropertyForm.addControl('reminderTime', this.formBuilder.control(''));
      this.taskPropertyForm.addControl('reminderUnits', this.formBuilder.control(''));
      this.taskPropertyForm.addControl('dueDate', this.formBuilder.control(''));
      this.taskPropertyForm.addControl('enableSaveAsDraft', this.formBuilder.control(true));
      this.taskPropertyForm.addControl('message', this.formBuilder.control('Do you want to submit this task ?', [Validators.required]));
      this.taskPropertyForm.addControl('initialLaunchButton', this.formBuilder.control('Launch', [Validators.required]));
    } else {
      this.taskPropertyForm.removeControl('formIdentifier');
      this.taskPropertyForm.removeControl('formVersion');
      this.taskPropertyForm.removeControl('isCustomForm');
      this.taskPropertyForm.removeControl('launchButtonName');
      this.taskPropertyForm.removeControl('approveButtonName');
      this.taskPropertyForm.removeControl('isCancellableWorkflow');
      this.taskPropertyForm.removeControl('cancelButtonName');
      this.taskPropertyForm.removeControl('endWorkflowWhenCancelled');
      this.taskPropertyForm.removeControl('reminderTime');
      this.taskPropertyForm.removeControl('reminderUnits');
      this.taskPropertyForm.removeControl('dueDate');
      this.taskPropertyForm.removeControl('enableSaveAsDraft');
      this.taskPropertyForm.removeControl('message');
      this.taskPropertyForm.removeControl('initialLaunchButton');
      if (this.getFieldMappingFormGroup()) {
        this.taskPropertyForm.removeControl('fieldMapping');
      }
      if (this.getShowInTaskListFormGroup()) {
        this.taskPropertyForm.removeControl('showInTaskList');
      }
    }
    if (event.value === 'scheduled') {
      this.launchTextAreaEnable = false;
      this.taskPropertyForm.get('schedulerExpression').setValidators([Validators.required]);
    } else {
      this.taskPropertyForm.get('schedulerExpression').clearValidators();
      this.taskPropertyForm.get('schedulerExpression').setValue('');
      this.taskPropertyForm.get('schedulerExpression').updateValueAndValidity();
      this.cronExpression = null;
    }
  }

  showCronExpression() {
    this.cronExpression = cronstrue.toString(this.taskPropertyForm.get('schedulerExpression').value);
  }


  getJsonText() {
    const json = this.taskPropertyForm.get('jsonText');
    if (json.value) {
      try {
        JSON.parse(json.value);
        this.jsonValue = JSON.parse(json.value);
      } catch (e) {
        json.setErrors({ validationError: true });
      }
    }
  }

  getJsonSuccessText() {
    const json = this.taskPropertyForm.get('jsonSuccessText');
    if (json.value) {
      try {
        JSON.parse(json.value);
        this.jsonSuccessValue = JSON.parse(json.value);
      } catch (e) {
        json.setErrors({ validationError: true });
      }
    }
  }

  getJsonErrorText() {
    const json = this.taskPropertyForm.get('jsonErrorText');
    if (json.value) {
      try {
        JSON.parse(json.value);
        this.jsonErrorValue = JSON.parse(json.value);
      } catch (e) {
        json.setErrors({ validationError: true });
      }
    }
  }

  jsonTextValidator(json: AbstractControl) {
    if (json.value) {
      try {
        JSON.parse(json.value);
        this.jsonValue = JSON.parse(json.value);
      } catch (e) {
        json.setErrors({ validationError: true });
      }
    }

  }

  checkAutoAssignUser() {
    let hasAutoAssign = true;
    if (this.taskType === 'USER_TASK' ||
      this.taskType === 'APPROVAL_TASK') {
      const autoassign = this.taskPropertyForm.get('autoAssignUser');
      if (autoassign.value === null || autoassign.value === '') {
        hasAutoAssign = true;
      } else {
        hasAutoAssign = false;
      }
    }
    return hasAutoAssign;
  }

  checkAssigneeUserAndGroupValidation() {
    if (this.taskType === 'USER_TASK' ||
      this.taskType === 'APPROVAL_TASK' || this.taskType === 'SYSTEM_TASK' ||
      (this.taskType === 'START_TASK' && this.taskPropertyForm.get('propertyType').value === 'manual'
        && this.taskPropertyForm.get('publicForm').value !== true)) {
      const user = this.taskPropertyForm.get('assigneeUser');
      const group = this.taskPropertyForm.get('assigneeGroup');
      if ((user.value === null || user.value === '') && this.checkAutoAssignUser() &&
        (group.value === null || group.value[0] === null || group.value[0] === '' || group.value[0] === undefined)) {
        this.taskPropertyForm.setErrors({ validation: true });
      } else {
        this.taskPropertyForm.setErrors(null);
      }
    }
  }

  reset(userForm) {
    if (this.taskType === 'SMS_TASK') {
      this.smsReset.emit(true);
    }
    if (this.taskType === 'SYSTEM_TASK') {
      this.systemReset.emit(true);
    }
    this.emailReset.emit(this.emailData);
    this.taskPropertyForm.reset();
    this.initializeForm(this.taskType);
    if (this.taskType === 'DECISION_TABLE') {
      this.variableLists = [];
      this.conditionsList = [];
    }
    if (!this.data.nodeData.property.propertyValue) {
      if (this.taskType === 'DB_TASK') {
        this.actionTypeRead({ value: null });
        this.columnValues[this.tableName] = null;
        this.enableQueryFields = false;
      }
      if (this.taskType === 'APPROVAL_TASK' || this.taskType === 'USER_TASK') {
        this.enableFieldMapping = false;
      }
      if (this.taskType === 'CALL_ANOTHER_WORKFLOW') {
        this.enableWebServiceForCallAnotherWorkflow = false;
      }
      if (this.taskType === 'COMPUTE_TASK') {
        this.disableComputeTaskFormControls();
        this.taskPropertyForm.get('rightAssignment').setErrors(null);
        this.taskPropertyForm.get('rightAssignment').setValidators(null);
      }
      if (this.taskType === 'EMAIL_TASK') {
        this.showConstantEmails = false;
        this.showConstantEmailsCC = false;
        this.showConstantEmailsBCC = false;
      }
    }
    this.loadProperty();
  }


  save() {
    this.taskPropertyVO.propertyName = this.data.propertyName;
    if (this.taskType === 'START_TASK') {
      this.getJsonText();
      if (this.taskPropertyForm.get('message') && this.taskPropertyForm.get('message').value !== null && this.taskPropertyForm.get('publicForm').value === true) {
        this.message = this.taskPropertyForm.get('message').value;
      }
    }
    if (this.taskType === 'WEB_SERVICE_TASK') {
      this.getJsonSuccessText();
      this.getJsonErrorText();
    }
    if (this.taskType === 'EMAIL_TASK') {
      this.emailSenderValidation();
      const value = this.taskPropertyForm.value;
      if ((this.emailToChip === undefined ||
        (this.emailToChip && this.emailToChip.placeholder.length === 0) || value.emailTo === null)
        && (this.taskPropertyForm.get('emailToPageFields').value === null
          || this.taskPropertyForm.get('emailToPageFields').value === '' ||
          this.taskPropertyForm.get('emailToPageFields').value === [])) {
        this.taskPropertyForm.get('emailTo').setErrors({ chip: true });
      } else {
        this.taskPropertyForm.get('emailTo').setErrors(null);
      }

      if (value.bcc === true) {
        if ((this.emailBccChip === undefined ||
          (this.emailBccChip && this.emailBccChip.placeholder.length === 0) || value.emailBCC === null)
          && (this.taskPropertyForm.get('emailBCCPageFields').value === null
            || this.taskPropertyForm.get('emailBCCPageFields').value === '' ||
            this.taskPropertyForm.get('emailBCCPageFields').value === [])) {
          this.taskPropertyForm.get('emailBCC').setErrors({ emailBCC: true });
        } else {
          this.taskPropertyForm.get('emailBCC').setErrors(null);
        }
      }

      if (value.cc === true) {
        if ((this.emailCcChip === undefined ||
          (this.emailCcChip && this.emailCcChip.placeholder.length === 0) || value.emailCC === null)
          && (this.taskPropertyForm.get('emailCCPageFields').value === null
            || this.taskPropertyForm.get('emailCCPageFields').value === '' ||
            this.taskPropertyForm.get('emailCCPageFields').value === [])) {
          this.taskPropertyForm.get('emailCC').setErrors({ emailCC: true });
        } else {
          this.taskPropertyForm.get('emailCC').setErrors(null);
        }
      }

      if (this.emailToChip !== undefined) {
        value.emailTo = this.emailToChip.getListFromPlaceHolder(this.emailToChip.placeholder);
      }

      if (this.emailCcChip !== undefined) {
        value.emailCC = this.emailCcChip.getListFromPlaceHolder(this.emailCcChip.placeholder);
      }
      if (this.emailBccChip !== undefined) {
        value.emailBCC = this.emailBccChip.getListFromPlaceHolder(this.emailBccChip.placeholder);
      }

      if (!this.showConstantEmails) {
        value.emailTo = [];
      }
      if (!this.showConstantEmailsCC) {
        value.emailCC = [];
      }
      if (!this.showConstantEmailsBCC) {
        value.emailBCC = [];
      }
      this.taskPropertyVO.propertyValue = value;
    }
    if (this.taskType === 'DELAY_TIMER') {
      const time = this.taskPropertyForm.get('time');
      const units = this.taskPropertyForm.get('units').value;
      if (time.value) {
        if (units === 'minutes') {
          if (time.value < 10) {
            time.setErrors({ minTime: true });
          }
        } else {
          time.setErrors(null);
        }
      }
    }

    if (this.taskType === 'DECISION_TABLE') {
      if (this.taskPropertyForm.get('assignToVariable').value === ''
        && this.getConditionalsFormarray().get('0').get('name').value === null) {
        this.snackbarForDBTask('Atleast One Condition And Assign To Variable Is Required');
        this.enableDecisionCreate = false;
      } else if (this.taskPropertyForm.get('assignToVariable').value === ''
        && this.getConditionalsFormarray().get('0').get('name').value !== null) {
        this.snackbarForDBTask('Assign To Variable Is Required');
        this.enableDecisionCreate = false;
      } else if (this.taskPropertyForm.get('assignToVariable').value !== ''
        && this.getConditionalsFormarray().get('0').get('name').value === null) {
        this.snackbarForDBTask('Atleast One Condition Is Required');
        this.enableDecisionCreate = false;
      } else {
        this.enableDecisionCreate = true;
      }
    }

    if (this.taskType === 'DB_TASK') {
      this.updateDbTaskValidation = true;
      if (this.taskPropertyForm.get('actionType').value === 'update') {
        let updateValidation = false;
        for (let i = 0; i < this.getDBTaskfieldValuesFormarray().length; i++) {
          if (this.getDBTaskfieldValuesFormarray().get('' + i).get('insertValue').value === null) {
            updateValidation = true;
          }
        }
        if (updateValidation) {
          this.snackbarForDBTask('Update Values Or Remove Fields');
          this.updateDbTaskValidation = false;
        }
      }
    }

    if (this.taskType === 'APPROVAL_TASK') {
      this.taskPropertyForm.get('approveButtonName').setValidators(null);
      this.taskPropertyForm.get('approveButtonName').updateValueAndValidity();
    }

    if (this.taskType === 'USER_TASK' || this.taskType === 'APPROVAL_TASK') {
      const userapproval_dueTime = this.taskPropertyForm.get('userapproval_dueTime');
      const dueUnits = this.taskPropertyForm.get('dueTimeUnits');
      userapproval_dueTime.setErrors(null);
      dueUnits.setErrors(null);
      if (userapproval_dueTime.value) {
        if (dueUnits.value === 'minutes') {
          if (userapproval_dueTime.value < 10) {
            userapproval_dueTime.setErrors({ mindueTime: true });
          }
        }
      }
      if (!userapproval_dueTime.value && dueUnits.value) {
        userapproval_dueTime.setErrors({ userapproval_dueTime: true });
      }
      if (!dueUnits.value && userapproval_dueTime.value) {
        dueUnits.setErrors({ dueUnits: true });
      }
    }

    if (this.taskType === 'USER_TASK' || this.taskType === 'APPROVAL_TASK' ||
      (this.taskType === 'START_TASK' && this.taskPropertyForm.get('propertyType').value === 'manual')) {
      const time = this.taskPropertyForm.get('reminderTime');
      const units = this.taskPropertyForm.get('reminderUnits');
      time.setErrors(null);
      units.setErrors(null);
      if (time.value) {
        if (units.value === 'minutes') {
          if (time.value < 10) {
            time.setErrors({ minTime: true });
          }
        }
      }
      if (!time.value && units.value !== '') {
        time.setErrors({ time: true });
      }
      if (units.value === '' && time.value) {
        units.setErrors({ units: true });
      }
    }
    this.checkAssigneeUserAndGroupValidation();
    if (this.taskPropertyForm.valid && this.enableDecisionCreate && this.updateDbTaskValidation) {

      if (this.getShowInTaskListFormGroup()) {
        Object.keys(this.getShowInTaskListFormGroup().controls).forEach(field => {
          if (this.getShowInTaskListFormGroup().get(field).get('showInTaskListEnable').value === false) {
            this.getShowInTaskListFormGroup().removeControl(field);
          }
        });
      }

      if (this.taskType === 'USER_TASK') {
        const value = this.taskPropertyForm.value;
        value.isApprovalForm = false;
        this.isCustomPage = this.isCustomPage;


        this.taskPropertyVO.propertyValue = value;
      }
      if (this.taskType === 'APPROVAL_TASK') {
        const value = this.taskPropertyForm.value;
        value.isApprovalForm = true;
        this.taskPropertyVO.propertyValue = value;
      }
      if (this.taskType === 'APPROVAL_TASK' || this.taskType === 'USER_TASK'
        || (this.taskType === 'START_TASK' && this.taskPropertyForm.get('propertyType').value === 'manual' && this.taskPropertyForm.get('publicForm').value !== true)) {
        if (this.taskPropertyForm.get('assigneeUser').value) {
          this.permission.userId = this.taskPropertyForm.get('assigneeUser').value;
        } else {
          this.permission.userId = null;
        }
        if (this.taskPropertyForm.get('assigneeGroup').value) {
          this.permission.groupId = this.taskPropertyForm.get('assigneeGroup').value;
        } else {
          this.permission.groupId = null;
        }
        this.permission.pageId = this.taskPropertyForm.get('formIdentifier').value;
        this.permission.version = this.taskPropertyForm.get('formVersion').value;
        this.pageName = this.taskPropertyForm.get('pageName').value;
        if (this.permission.pageId && this.permission.version) {
          if (this.isCustomPage === false) {
            this.taskPropertyService.getPagePermission(this.permission).subscribe(response => {
              if (response) {
                if (response.response.includes('have no permission')) {
                  const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
                    data: { data: 'permission', response: response.response },
                  });
                  dialogRef.afterClosed().subscribe(data => {
                    if (data === true) {
                      const pagePermissionsSheet = this.rightSheet.open(YoroSecurityComponent, {
                        disableClose: true,
                        data: {
                          id: response.responseId, securityType: 'page',
                          formId: this.pageName, version: this.permission.version
                        },
                        panelClass: 'dynamic-right-sheet-container',
                      });
                      pagePermissionsSheet.afterDismissed().subscribe(data => {
                      });
                    } else if (data === 'no') {
                      if (this.taskPropertyForm.get('assigneeUser').value) {
                        const userId = (this.taskPropertyForm.get('assigneeUser').value);
                        const removeIndex = response.groupNameList.findIndex(x => x === userId);
                        if (removeIndex !== -1) {
                          response.groupNameList.splice(removeIndex, 1);
                          this.taskPropertyForm.get('assigneeUser').setValue(null);
                        }
                      }
                      if ((this.taskPropertyForm.get('assigneeGroup').value)) {
                        const groupIdArrayList = this.taskPropertyForm.get('assigneeGroup').value;
                        response.groupNameList.forEach(groupId => {
                          const removeIndex = groupIdArrayList.findIndex(x => x === groupId);
                          if (removeIndex !== -1) {
                            groupIdArrayList.splice(removeIndex, 1);
                          }
                        });
                        this.taskPropertyForm.get('assigneeGroup').setValue(groupIdArrayList);
                      }
                      this.save();
                    }
                  });
                } else {
                  if (this.taskPropertyForm.dirty && this.taskPropertyForm.valid) {
                    this.dialogRef.close(this.taskPropertyVO);
                  }
                }
              }
            });
          } else {
            if (this.taskPropertyForm.dirty && this.taskPropertyForm.valid) {
              this.dialogRef.close(this.taskPropertyVO);
            }
          }
        }
      }

      if (this.taskType === 'START_TASK') {
        this.taskPropertyVO.propertyValue = this.taskPropertyForm.value;
        this.taskPropertyVO.propertyValue.jsonText = this.jsonValue;
        if (this.jsonValue !== null) {
          this.enableWebServiceForCallAnotherWorkflow = true;
        }
      }

      if (this.taskType === 'DB_TASK') {
        this.aliasFieldEnable = false;
        if (this.taskPropertyForm.valid) {
          Object.keys(this.taskPropertyForm.controls).forEach(field => {
            if (this.taskPropertyForm.get(field).value === '') {
              this.taskPropertyForm.removeControl(field);
            }
          });
          if (this.taskPropertyForm.get('actionType').value === 'select' &&
            this.taskPropertyForm.get('fieldValues') && this.taskPropertyForm.get('fieldValues').get('0')
              .get('fieldName').value === '') {
            this.taskPropertyForm.removeControl('fieldValues');
          }
          if (this.taskPropertyForm.get('actionType').value !== 'update' &&
            this.taskPropertyForm.get('whereClause') && this.taskPropertyForm.get('whereClause').get('0')
              .get('filtersInsideCondition').get('0').get('filterName').value === '') {
            this.taskPropertyForm.removeControl('whereClause');
          }
          if (this.taskPropertyForm.get('sortBy') && this.taskPropertyForm.get('sortBy').get('0')
            .get('orderFieldName').value === '') {
            this.taskPropertyForm.removeControl('sortBy');
          }
          this.taskPropertyVO.propertyValue = this.taskPropertyForm.value;
          if (this.taskPropertyForm.get('actionType').value === 'update' &&
            this.taskPropertyForm.get('whereClause') && this.taskPropertyForm.get('whereClause').get('0')
              .get('filtersInsideCondition').get('0').get('filterName').value === '') {
            const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
              width: '400px',
              height: '130px',
              data: 'where-clause-update'
            });
            dialogRef.afterClosed().subscribe(response => {
              if (response === true) {
                this.taskPropertyForm.removeControl('whereClause');
                if (this.taskPropertyForm.dirty && this.taskPropertyForm.valid) {
                  this.dialogRef.close(this.taskPropertyVO);
                }
              }
            });
          } else if (this.taskPropertyForm.dirty && this.taskPropertyForm.valid) {
            this.dialogRef.close(this.taskPropertyVO);
          }
        }
      }

      if (this.taskType === 'WEB_SERVICE_TASK') {
        this.taskPropertyVO.propertyValue = this.taskPropertyForm.value;
        this.taskPropertyVO.propertyValue.jsonSuccessText = this.jsonSuccessValue;
        this.taskPropertyVO.propertyValue.jsonErrorText = this.jsonErrorValue;
      } else {
        this.taskPropertyVO.propertyValue = this.taskPropertyForm.value;
      }





      if (this.taskPropertyForm.valid && this.taskPropertyForm.dirty) {
        if (this.taskType !== 'USER_TASK' && this.taskType !== 'APPROVAL_TASK' && this.taskType !== 'DB_TASK' && this.taskType !== 'START_TASK') {
          this.dialogRef.close(this.taskPropertyVO);
        } else if ((this.taskType === 'START_TASK' && this.taskPropertyForm.get('propertyType').value !== 'manual')) {
          this.dialogRef.close(this.taskPropertyVO);
        } else if ((this.taskType === 'START_TASK' && this.taskPropertyForm.get('propertyType').value === 'manual'
          && this.taskPropertyForm.get('publicForm').value === true)) {
          this.dialogRef.close(this.taskPropertyVO);
        }
      }
    }
  }
  cancel() {
    this.dialogRef.close();
  }

  clickEvent() {
    let isWorkflowName = false;
    if (this.taskType === 'START_TASK') {
      this.publicAccess = this.taskPropertyForm.get('publicForm').value;
      if (this.taskPropertyForm.get('publicForm').value === true) {
        if (this.data.workflowName !== null && this.data.workflowName !== '' && this.data.workflowName !== undefined) {
          isWorkflowName = true;
        }
      } else {
        isWorkflowName = true;
      }
    } else {
      isWorkflowName = true;
    }
    if (isWorkflowName === true) {
      this.openForm(null, null).afterClosed().subscribe(pageId => {
        if (pageId) {
          this.taskPropertyForm.get('formIdentifier').setValue(pageId.responseId);
          this.taskPropertyForm.get('formVersion').setValue(pageId.version);
          this.taskPropertyForm.get('pageName').setValue(pageId.pageName);
          this.editFormOptionEnable = true;
          if (this.taskType === 'START_TASK') {
            this.URL = window.location.href.split('.com/', 2);
            this.publicFormUrl = this.URL[0] + '.com/' + this.selectedLang + '/public/' + this.taskPropertyForm.get('formIdentifier').value;
          }
          this.getPageFields(pageId.responseId, pageId.version);
        }
      });
    } else {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '400px',
        data: 'isWorkflowName'
      });
      dialog.afterClosed().subscribe(data => {
        this.taskPropertyForm.get('publicForm').setValue(false);
      });
    }
  }

  createTable() {
    const dialogRef = this.dialog.open(TableCreationDialogBoxComponent, {
      disableClose: true,
      height: '65%',
      width: '100vw',
      maxWidth: '90vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-modal',
      data: { id: null },
    });
    dialogRef.afterClosed().subscribe(data => {
      if ((data !== false) && (data !== undefined) && (this.taskType === 'DB_TASK')) {
        if (data.tableName) {
          this.enableQueryFields = true;
          this.tableName = data.tableName;
          this.taskPropertyForm.get('tableId').setValue(data.tableId);
          this.taskPropertyForm.get('tableName').setValue(data.tableName);
          this.getTableColumns(data.tableId, data.tableName, 'initial');
          this.enableTableColumns = true;
          this.buildQuery();
          this.taskPropertyForm.markAsDirty();
        }
      }
    });
  }
  editTable() {
    const dialogRef = this.dialog.open(TableCreationDialogBoxComponent, {
      disableClose: true,
      height: '65%',
      width: '100vw',
      maxWidth: '90vw',
      panelClass: 'full-screen-modal',
      data: { id: this.taskPropertyForm.get('tableId').value },
    });
    dialogRef.afterClosed().subscribe(data => {
      if ((data !== false) && (data !== undefined) && (this.taskType === 'DB_TASK')) {
        if (data.tableName) {
          this.enableQueryFields = true;
          this.tableName = data.tableName;
          this.taskPropertyForm.get('tableId').setValue(data.tableId);
          this.taskPropertyForm.get('tableName').setValue(data.tableName);
          this.getTableColumns(data.tableId, data.tableName, 'initial');
          this.enableTableColumns = true;
          this.buildQuery();
          this.taskPropertyForm.markAsDirty();
        }
      }
    });
  }

  openForm(pageId, version) {
    return this.dialog.open(CreateFormDialogComponent, {
      disableClose: true,
      height: '97%',
      width: '100vw',
      maxWidth: '90vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-modal',
      data: { id: pageId, versionId: version, publicform: this.publicAccess, workflowName: this.data.workflowName, key: this.data.workflowKey },
    });
  }

  editForm() {
    let layoutType: any;
    if (this.taskType === 'START_TASK' && this.taskPropertyForm.get('publicForm').value
      && this.taskPropertyForm.get('publicForm').value === true) {
      layoutType = true;
    } else {
      layoutType = false;
    }
    if (this.editFormOptionEnable === true && this.taskPropertyForm.get('formIdentifier').value) {
      this.editFormSpinner = true;
      this.pageRendered = false;
      const dialog = this.dialog.open(YoroFlowConfirmationDialogComponent, {
        data: { type: 'spinner', formId: this.taskPropertyForm.get('formIdentifier').value, layout: layoutType }
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          this.pageRendered = true;
          if (this.taskPropertyForm.get('formVersion').value !== data[0].version) {
            const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
              width: '400px',
              data: 'editable'
            });
            dialogRef.afterClosed().subscribe(data => {
              this.editFormSpinner = false;
              if (data === true) {
                this.openFormWithVersion(this.taskPropertyForm.get('formIdentifier').value, this.taskPropertyForm.get('formVersion').value);
              } else if (data === 'loadLatestVersion') {
                this.taskPropertyService.getPageVersion(this.taskPropertyForm.get('formIdentifier').value, layoutType).subscribe(data => {
                  if (data) {
                    this.openFormWithVersion(this.taskPropertyForm.get('formIdentifier').value, data[0].version);
                  }
                });
              }
            });
          } else {
            this.openFormWithVersion(this.taskPropertyForm.get('formIdentifier').value, this.taskPropertyForm.get('formVersion').value);
          }
        }
      }, err => {
        this.pageRendered = true;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Internal server error',
        });
      }
      );
    }
  }
  openFormWithVersion(formId, version) {
    let isWorkflowName = false;
    if (this.taskType === 'START_TASK') {
      this.publicAccess = this.taskPropertyForm.get('publicForm').value;
      if (this.taskPropertyForm.get('publicForm').value === true) {
        if (this.data.workflowName !== null && this.data.workflowName !== '' && this.data.workflowName !== undefined) {
          isWorkflowName = true;
        }
      } else {
        isWorkflowName = true;
      }
    } else {
      isWorkflowName = true;
    }
    if (isWorkflowName === true) {
      this.openForm(formId, version).afterClosed().subscribe(pageId => {
        if (pageId) {
          this.taskPropertyForm.get('formIdentifier').setValue(pageId.responseId);
          this.taskPropertyForm.get('formVersion').setValue(pageId.version);
          this.taskPropertyForm.get('pageName').setValue(pageId.pageName);
          if (this.taskType === 'START_TASK' && this.publicFormUrl !== null && this.publicFormUrl !== undefined && this.publicFormUrl !== '') {
            this.URL = window.location.href.split('.com/', 2);
            this.publicFormUrl = this.URL[0] + '.com/' + this.selectedLang + '/public/' + this.taskPropertyForm.get('formIdentifier').value;
          }
          this.taskPropertyForm.markAsDirty();
          this.editFormOptionEnable = true;
          this.getPageFields(pageId.responseId, pageId.version);
        }
      });
    } else {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '400px',
        data: 'isWorkflowName'
      });
      dialog.afterClosed().subscribe(data => {
        this.taskPropertyForm.get('publicForm').setValue(false);
      });
    }
  }

  actionTypeRead($event) {
    this.taskPropertyForm.get('fieldType').setValue(false);
    this.taskPropertyForm.removeControl('fieldValues');
    if ($event.value !== 'delete') {
      this.taskPropertyForm.addControl('fieldValues', this.formBuilder.array([]));
      this.queryFieldsFormGroup($event.value, 'action');
    }
    this.taskPropertyForm.removeControl('whereClause');
    this.taskPropertyForm.removeControl('sortBy');
    this.taskPropertyForm.get('limit').setValue('');
    if ($event.value === 'update' || $event.value === 'select' || $event.value === 'delete') {
      this.taskPropertyForm.addControl('whereClause', this.formBuilder.array([]));
      this.getDBTaskwhereClauseFormarray().push(this.whereClauseFormGroup());
    }
    if ($event.value === 'select') {
      this.taskPropertyForm.addControl('sortBy', this.formBuilder.array([]));
      this.getDBTasksortByFormarray().push(this.sortByFormGroup());
    }
    this.taskPropertyForm.get('actionType').setValue($event.value);
    this.taskPropertyForm.get('query').setValue($event.value);
    this.buildQuery();

  }

  selectEvent() {
    if (this.taskType === 'DB_TASK') {
      if (this.tableNames.length >= 1) {
        this.snackbarForDBTask('Table already selected');
      } else if (!this.taskPropertyForm.get('actionType').value) {
        this.snackbarForDBTask('Select SQL type first');
      } else {
        this.selectEventData = 'selectTable';
      }
    } else if (this.taskType !== 'DB_TASK') {
      this.selectEventData = 'selectForm';
    }
    if (this.taskType === 'START_TASK' && this.taskPropertyForm.get('publicForm') && this.taskPropertyForm.get('publicForm').value === true) {
      this.isPublic = true;
    } else {
      this.isPublic = false;
    }
    if (this.selectEventData) {
      const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
        width: '600px',
        height: '185px',
        data: { data: this.selectEventData, type: this.isPublic }
      });
      dialogRef.afterClosed().subscribe(pageId => {
        this.selectEventData = '';
        if ((pageId !== false) && (pageId !== undefined) && (this.taskType === 'DB_TASK')) {
          if (pageId.tableName) {
            this.enableQueryFields = true;
            this.tableName = pageId.tableName;
            this.taskPropertyForm.get('tableId').setValue(pageId.tableId);
            this.taskPropertyForm.get('tableName').setValue(pageId.tableName);
            this.getTableColumns(pageId.tableId, pageId.tableName, 'initial');
            this.enableTableColumns = true;
            this.buildQuery();
            this.taskPropertyForm.markAsDirty();
          }
        } else if ((pageId !== false) && (pageId !== undefined)) {
          this.taskPropertyForm.get('formIdentifier').setValue(pageId.formId);
          this.taskPropertyForm.get('formVersion').setValue(pageId.version);
          this.taskPropertyForm.get('pageName').setValue(pageId.formName);
          this.taskPropertyForm.markAsDirty();
          this.editFormOptionEnable = true;
          this.isCustomPage = false;
          if (this.taskType === 'START_TASK') {
            this.URL = window.location.href.split('.com/', 2);
            this.publicFormUrl = this.URL[0] + '.com/' + this.selectedLang + '/public/' + this.taskPropertyForm.get('formIdentifier').value;
          }
          this.taskPropertyForm.get('isCustomForm').setValue(false);
          this.getPageFields(pageId.formId, pageId.version);
        }
      });
    }
  }

  selectCustomForm() {
    const dialogRef = this.dialog.open(YoroFlowConfirmationDialogComponent, {
      width: '400px',
      height: '185px',
      data: 'custom-form'
    });
    dialogRef.afterClosed().subscribe(pageId => {
      if ((pageId !== false) && (pageId !== undefined)) {
        this.taskPropertyForm.get('formIdentifier').setValue(pageId.formId);
        this.taskPropertyForm.get('formVersion').setValue(pageId.version);
        this.editFormOptionEnable = false;
        this.enableFieldMapping = false;
        this.isCustomPage = true;
        this.taskPropertyForm.get('isCustomForm').setValue(true);
        this.taskPropertyForm.markAsDirty();
      }
    });
  }

  addRemainder() {
    const dialogRef = this.dialog.open(RemainderDialogComponent, {
      disableClose: true,
      width: '55%',
      panelClass: 'task-property-dialogBox',
      autoFocus: false,
      data: {
        nodeData: this.data.nodeData, propertyName: this.data.propertyName, SMSProviderNameList: this.SMSProviderNameList,
        workflowStructure: this.data.workflowStructure, initialFieldList: this.initialFieldList,
        remainderDetails: this.taskPropertyForm.get('remainderDetails').value, groupNameList: this.groupList,
        userNameList: this.userList
      },
    });
    dialogRef.afterClosed().subscribe(remainder => {
      if (remainder.data === true) {
        this.taskPropertyForm.get('remainderDetails').setValue(remainder.remainder);
        this.taskPropertyForm.markAsDirty();
      }
    });
  }

  getTableColumns(tableId, tableName, type) {
    this.taskPropertyService.getTableColumns(tableId).subscribe(data => {
      this.columnValues[this.tableName] = null;
      this.columnValues[tableName] = data;
      this.columnValuesLength = this.columnValues[tableName].length;
      if ((this.taskPropertyForm.get('actionType').value === 'insert' || this.taskPropertyForm.get('actionType').value === 'update')
        && type === 'initial') {
        this.insertQueryFields(this.columnValues[tableName]);
      }
    });
  }

  getValue(controlValue: any): string {
    let value: string = controlValue;
    if (controlValue) {
      this.initialFieldList?.forEach(type => {
        type.fieldVO?.forEach(field => {
          if (field.fieldId === controlValue) {
            value = field.fieldName;
          }
        });
      });
    }
    return value;
  }

  repeatableFieldMousedown(field: any): void {
    this.selectedField = field;
    this.fieldList = this.initialFieldList;
    this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
    this.initialFieldList.forEach(type => {
      const fieldList = this.fieldList.find(field => field.fieldType === type.fieldType);
      fieldList.fieldVO = [];
      type.fieldVO.forEach(field => {
        field.color = this.getRandomColor();
        if (this.selectedField.datatype === 'string') {
          if (field.datatype !== 'date' && field.datatype !== 'array') {
            fieldList.fieldVO.push(field);
          }
        } else if (this.selectedField.datatype === field.datatype) {
          fieldList.fieldVO.push(field);
        }
      });
    });
  }

  mousedown(field: any): void {
    this.selectedField = field;
    this.fieldList = this.initialFieldList;
    this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
    this.initialFieldList.forEach(type => {
      const fieldList = this.fieldList.find(field => field.fieldType === type.fieldType);
      fieldList.fieldVO = [];
      type.fieldVO.forEach(field => {
        field.color = this.getRandomColor();
        if (this.selectedField.datatype === 'string') {
          if (field.datatype !== 'date' && field.datatype !== 'array') {
            fieldList.fieldVO.push(field);
          }
        } else if (this.selectedField.datatype === field.datatype) {
          fieldList.fieldVO.push(field);
        }
      });
    });
  }

  getIcon(field: any): string {
    let icon = '';
    this.iconList.forEach(data => {
      if (data.type === field.datatype) {
        icon = data.icon;
      }
    });
    return icon;
  }

  setPageFieldValue(value: any): void {
    this.taskPropertyForm.get('fieldMapping').get(this.selectedField.fieldId).setValue(value);
    this.taskPropertyForm.markAsDirty();
    this.mainSectionFieldMenu.closeMenu();
  }

  setRepeatableFieldValue(value: any): void {
    this.taskPropertyForm.get('fieldMapping').get(this.selectedField.repeatableFieldId).setValue(value);
    this.taskPropertyForm.markAsDirty();
    this.repeatableNameMenu.closeMenu();
    this.setDefaultArrayFields(this.taskPropertyForm.get('fieldMapping').get(this.selectedField.repeatableFieldId), this.selectedField);
  }

  setRepeatablePageFieldValue(value: any): void {
    this.taskPropertyForm.get('fieldMapping').get(this.selectedField.repeatableFieldId + 'ya').get(this.selectedField.fieldId).setValue(value);
    this.taskPropertyForm.markAsDirty();
    this.subSectionFieldsMenu.closeMenu();
  }

  getRandomColor(): string {
    return '#' + ('000000' + Math.floor(Math.random() * 16777216).toString(16)).substr(-6);
  }

  getRepeatableFieldValue(control: AbstractControl): string {
    let value = '';
    if (control.value) {
      this.initialFieldList.forEach(type => {
        type.fieldVO.forEach(field => {
          if (field.fieldId === control.value) {
            value = field.fieldName;
          }
        });
      });
    }
    return value;
  }

  openDecisionTaskDataTypeDialog() {
    this.dataTypeDialog = this.dialog.open(YoroFlowConfirmationDialogComponent, {
      width: '280px',
      height: '220px',
      data: { type: 'variableTypeChange', group: this.assignmentGroup }
    });
    this.processDataAfterDataTypeDialogClosed(this.roleIndex);
  }

  setRoleIndex(roleIndex: number, field: string): void {
    this.roleIndex = roleIndex;
    this.decisionTaskFieldType = field;
    this.selectedField = this.taskPropertyForm.get('decisionLogic').get('rules').get('' + this.roleIndex).get(field).value;
    this.fieldList = this.initialFieldList;
    this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
    this.initialFieldList.forEach(type => {
      const fieldList = this.fieldList.find(field => field.fieldType === type.fieldType);
      fieldList.fieldVO = [];
      type.fieldVO.forEach(field => {
        field.color = this.getRandomColor();
        fieldList.fieldVO.push(field);
        // if (this.selectedField.dataType === 'String') {
        //   if (field.datatype !== 'date' && field.datatype !== 'array') {

        //   }
        // } else if (this.selectedField.dataType === field.datatype) {
        //   fieldList.fieldVO.push(field);
        // }
      });
    });
  }

  setDecisionTableFieldValue(value: string, field: any): void {
    if (this.decisionType === 'conditionVariable') {
      this.taskPropertyForm.get('conditions').get('' + this.decisionTableRowIndex).get('name').setValue(value);
      if (value !== '') {
        this.setOperators({ isUserInput: true }, field, this.decisionTableRowIndex);
      }
    } else if (this.decisionType === 'assignedToVariable') {
      this.taskPropertyForm.get('assignToVariable').setValue(value);
      if (value !== '') {
        this.setOperators({ isUserInput: true }, field, '');
      }
    }
    this.menu.closeMenu();

  }

  setDecisionTaskPageFieldValue(value: string, field: any): void {
    this.taskPropertyForm.get('decisionLogic').get('rules')
      .get('' + this.roleIndex).get(this.decisionTaskFieldType).get('variableName').setValue(value);
    // this.taskPropertyForm.get('decisionLogic').get('rules')
    //   .get('' + this.roleIndex).get(this.decisionTaskFieldType).get('dataType').setValue(value);
    this.taskPropertyForm.markAsDirty();
    if (value !== '') {
      this.setOperators({ isUserInput: true }, field, this.roleIndex);
    }
    this.decisionTaskMenu.closeMenu();

  }

  getFieldType(): string {
    let value = 'String';
    if (this.roleIndex !== undefined && this.roleIndex !== null && this.roleIndex !== '') {
      const dataType = (this.taskPropertyForm.get('fieldValues') as FormArray).get('' + this.webServiceTaskRowIndex).get('insertValue').get('dataType').value;
      if (dataType === 'text' || dataType === 'Text' || dataType === 'string' ||
        dataType === 'STRING' || dataType === 'String') {
        value = 'text';
      } else if (dataType === 'number' || dataType === 'Number' || dataType === 'NUMBER'
        || dataType === 'Long' || dataType === 'Double') {
        value = 'number';
      } else if (dataType === 'Boolean' || dataType === 'boolean') {
        value = 'boolean';
      } else {
        value = 'date';
      }
    }
    return value;
  }

  getFieldTypeIcon(): string {
    let value = 'text_fields';
    if (this.roleIndex !== undefined && this.roleIndex !== null && this.roleIndex !== '') {
      const dataType = this.taskPropertyForm.get('decisionLogic').get('rules').get('' + this.roleIndex).get('leftAssignment').get('dataType').value;
      if (dataType === 'text' || dataType === 'Text' || dataType === 'string' ||
        dataType === 'STRING' || dataType === 'String') {
        value = 'text_fields';
      } else if (dataType === 'number' || dataType === 'Number' || dataType === 'NUMBER'
        || dataType === 'Long' || dataType === 'Double') {
        value = 'pin';
      } else if (dataType === 'Boolean' || dataType === 'boolean') {
        value = 'flaky';
      } else {
        value = 'date_range';
      }
    }
    return value;
  }

  getDecisionColor(operator) {
    let color = '#FFFFFF';
    const opValue = this.taskPropertyForm.get('conditions').get('' + this.decisionRowIndex).get('operator').value;
    if (operator === opValue) {
      color = '#97F88E';
    }
    return color;
  }

  setDecisionTableConditionPageFieldValue(operator) {
    this.taskPropertyForm.get('conditions').get('' + this.decisionRowIndex).get('operator').setValue(operator);
    this.desicionMenu.closeMenu();
  }

  mousedownDecisionEvent(rowIndex: number, dataType: string) {
    this.decisionDataType = dataType;
    this.decisionRowIndex = rowIndex;
  }

  mousedownEvent(group: any, rowIndex: number, columnIndex: number, type: string): void {
    this.selectedField = '';
    if (this.taskType === 'DECISION_TABLE') {
      this.selectedField = { dataType: 'string' };
      if (type === 'conditionVariableList') {
        const json = { dataType: this.taskPropertyForm.get('conditions').get('' + columnIndex).get('dataType').value };
        this.selectedField = json;
      }
      this.decisionTableRowIndex = rowIndex;
      this.decisionTableColumnIndex = columnIndex;
      this.decisionType = type;
    } else if (this.taskType === 'WEB_SERVICE_TASK') {
      this.selectedField = '';
      this.webServiceTaskRowIndex = rowIndex;
      this.decisionType = type;
    } else if (this.taskType === 'EMAIL_TASK') {
      this.selectedField = '';
      this.webServiceTaskRowIndex = rowIndex;
      this.decisionType = type;
    } else if (this.taskType === 'CALL_ANOTHER_WORKFLOW') {
      this.selectedField = '';
      this.webServiceTaskRowIndex = rowIndex;
      this.decisionType = type;
    } else if (this.taskType === 'DB_TASK') {
      this.selectedField = group;
      this.webServiceTaskRowIndex = rowIndex;
      this.dbTaskColumnIndex = columnIndex;
      this.decisionType = type;

      this.fieldList = this.initialFieldList;
      this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
      this.initialFieldList.forEach(fieldtype => {
        const fieldList = this.fieldList.find(field => field.fieldType === fieldtype.fieldType);
        fieldList.fieldVO = [];
        fieldtype.fieldVO.forEach(field => {
          field.color = this.getRandomColor();
          if (this.decisionType === '') {
            fieldList.fieldVO.push(field);
          }
          else {
            if (this.decisionType === 'dbTaskInsertValue') {
              if (this.selectedField.dataType === 'string') {
                if (field.datatype !== 'date' && field.datatype !== 'array') {
                  fieldList.fieldVO.push(field);
                }
              } else if (this.selectedField.dataType === field.datatype) {
                fieldList.fieldVO.push(field);
              }
            } else {
              this.selectedField = this.changedDataType;
              if (this.selectedField === 'string') {
                if (field.datatype !== 'date' && field.datatype !== 'array') {
                  fieldList.fieldVO.push(field);
                }
              } else if (this.selectedField === field.datatype) {
                fieldList.fieldVO.push(field);
              }
            }

          }
        });
      });
    } else if (this.taskType === 'SMS_TASK') {
      this.webServiceTaskRowIndex = rowIndex;
      this.decisionType = type;
    } else if (this.taskType === 'EXCEL_REPORT') {
      this.selectedField = { dataType: 'string' };
      this.webServiceTaskRowIndex = rowIndex;
      this.dbTaskColumnIndex = columnIndex;
      this.decisionType = type;
    } else if (this.taskType === 'COMPUTE_TASK') {
      this.selectedField = group;
      this.webServiceTaskRowIndex = rowIndex;
      this.decisionType = type;

      this.fieldList = this.initialFieldList;
      this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
      this.initialFieldList.forEach(type => {
        const fieldList = this.fieldList.find(field => field.fieldType === type.fieldType);
        fieldList.fieldVO = [];
        type.fieldVO.forEach(field => {
          field.color = this.getRandomColor();
          if (this.decisionType === 'dbTaskFilterValue') {
            fieldList.fieldVO.push(field);
          }
          else {
            if (this.selectedField === 'string') {
              if (field.datatype !== 'date' && field.datatype !== 'array') {
                fieldList.fieldVO.push(field);
              }
            } else if (this.selectedField === field.datatype) {
              fieldList.fieldVO.push(field);
            }
          }
        });
      });
    }
    if (this.taskType !== 'DB_TASK') {
      this.fieldList = this.initialFieldList;
      this.initialFieldList = JSON.parse(JSON.stringify(this.initialFieldList));
      this.initialFieldList.forEach(fieldtype => {
        const fieldList = this.fieldList.find(field => field.fieldType === fieldtype.fieldType);
        fieldList.fieldVO = [];
        fieldtype.fieldVO.forEach(field => {
          field.color = this.getRandomColor();
          fieldList.fieldVO.push(field);
        });
      });
    }

  }

  setSelectedPageFieldValue(value: string, i): void {
    if (this.taskType === 'DECISION_TABLE') {
      if (this.decisionType === 'conditionVariableList') {
        (this.taskPropertyForm.get('conditionVariableList') as FormArray).get('' + this.decisionTableRowIndex)
          .get('values').get('' + this.decisionTableColumnIndex).get('variableType').setValue('pagefield');
        (this.taskPropertyForm.get('conditionVariableList') as FormArray).get('' + this.decisionTableRowIndex).get('values')
          .get('' + this.decisionTableColumnIndex).get('value').setValue(value);

      } else if (this.decisionType === 'assignToVariableValuesList') {
        (this.taskPropertyForm.get('assignToVariableValuesList') as FormArray).get('' + this.decisionTableRowIndex)
          .get('values').get('' + this.decisionTableColumnIndex).get('variableType').setValue('pagefield');
        (this.taskPropertyForm.get('assignToVariableValuesList') as FormArray).get('' + this.decisionTableRowIndex).get('values')
          .get('' + this.decisionTableColumnIndex).get('value').setValue(value);

      } else if (this.decisionType === 'conditionVariable') {
        this.addCondition({ value, dataType: i.datatype }, this.decisionTableRowIndex);

      } else if (this.decisionType === 'assignedToVariable') {
        this.taskPropertyForm.get('assignToVariable').get('name').setValue(value);
        this.taskPropertyForm.get('assignToVariable').get('variableType').setValue('pagefield');
        this.taskPropertyForm.get('assignToVariable').get('dataType').setValue(i.datatype);
        this.addassignToVariable();

      }
    } else if (this.taskType === 'WEB_SERVICE_TASK') {
      if (this.decisionType === 'apiKey') {
        (this.taskPropertyForm.get('apiKey').get('apiKey') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('value').setValue(value);
      } else if (this.decisionType === 'bearerToken') {
        this.taskPropertyForm.get('bearerToken').get('variableType').setValue('pagefield');
        this.taskPropertyForm.get('bearerToken').get('token').setValue(value);
      } else if (this.decisionType === 'customHeaders') {
        (this.taskPropertyForm.get('customHeaders') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableType').setValue('pagefield');
        (this.taskPropertyForm.get('customHeaders') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('value').setValue(value);
      } else if (this.decisionType === 'queryParams') {
        (this.taskPropertyForm.get('queryParams') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableType').setValue('pagefield');
        (this.taskPropertyForm.get('queryParams') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('value').setValue(value);
      } else if (this.decisionType === 'httpMethod') {
        (this.taskPropertyForm.get('webServiceRequestPayload') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('value').setValue(value);
      }

    } else if (this.taskType === 'EMAIL_TASK') {
      if (this.decisionType === 'emailToPageFields') {
        this.taskPropertyForm.get('emailToPageFields').setValue(value);
      } else if (this.decisionType === 'emailCCPageFields') {
        this.taskPropertyForm.get('emailCCPageFields').setValue(value);
      } else if (this.decisionType === 'emailBCCPageFields') {
        this.taskPropertyForm.get('emailBCCPageFields').setValue(value);
      }
    } else if (this.taskType === 'CALL_ANOTHER_WORKFLOW') {
      if (this.decisionType === 'callAnotherWorkflowFields') {
        (this.taskPropertyForm.get('callAnotherWorkflowFields') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableType').setValue('pagefield');
        (this.taskPropertyForm.get('callAnotherWorkflowFields') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('fieldValue').setValue(value);
      }
    } else if (this.taskType === 'DB_TASK') {
      if (this.decisionType === 'dbTaskFilterValue') {
        (((this.taskPropertyForm.get('whereClause') as FormArray).get('' + this.dbTaskColumnIndex))
          .get('filtersInsideCondition') as FormArray).get('' + this.webServiceTaskRowIndex).get('filterFieldVariableType').setValue('pageFields');
        (((this.taskPropertyForm.get('whereClause') as FormArray).get('' + this.dbTaskColumnIndex))
          .get('filtersInsideCondition') as FormArray).get('' + this.webServiceTaskRowIndex).get('filterValue').setValue(value);
      } else if (this.decisionType === 'dbTaskInsertValue') {
        (this.taskPropertyForm.get('fieldValues') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('insertFieldVariableType').setValue('pageFields');
        (this.taskPropertyForm.get('fieldValues') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('insertValue').setValue(value);
      }
    } else if (this.taskType === 'SMS_TASK') {
      if (this.decisionType === 'smsTaskMobileNumber') {
        (this.taskPropertyForm.get('mobileNumbersList') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableType').setValue('pagefield');
        (this.taskPropertyForm.get('mobileNumbersList') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('mobileNumber').setValue(value);
      }
    } else if (this.taskType === 'EXCEL_REPORT') {
      if (this.decisionType === 'excelReportValue') {
        (((this.taskPropertyForm.get('excelColumns') as FormArray).get('' + this.dbTaskColumnIndex))
          .get('excelDetails') as FormArray).get('' + this.webServiceTaskRowIndex).get('variableType').setValue('pageFields');
        (((this.taskPropertyForm.get('excelColumns') as FormArray).get('' + this.dbTaskColumnIndex))
          .get('excelDetails') as FormArray).get('' + this.webServiceTaskRowIndex).get('value').setValue(value);
      }
    }

    else if (this.taskType === 'COMPUTE_TASK') {
      if (this.decisionType === 'computeTaskVariable') {
        (this.taskPropertyForm.get('rightAssignment') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableType').setValue('pagefield');
        (this.taskPropertyForm.get('rightAssignment') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableName').setValue(value);
        this.buidComputeTaskValue();

      }
    }

    this.taskPropertyForm.markAsDirty();
    this.menu.closeMenu();

  }

  saveConstantValue(): void {
    const value = this.constantValueForm.get('constantValue').value;

    if (this.taskType === 'DECISION_TABLE') {
      if (this.decisionType === 'conditionVariable') {
        (this.taskPropertyForm.get('conditions') as FormArray).get('' + this.decisionTableRowIndex)
          .get('variableType').setValue('constant');
        (this.taskPropertyForm.get('conditions') as FormArray).get('' + this.decisionTableRowIndex)
          .get('name').setValue(value);
      } else if (this.decisionType === 'assignedToVariable') {
        this.taskPropertyForm.get('assignToVariable').get('variableType').setValue('constant');
        this.taskPropertyForm.get('assignToVariable').get('name').setValue(value);
      } else if (this.decisionType === 'conditionVariableList') {
        (this.taskPropertyForm.get('conditionVariableList') as FormArray).get('' + this.decisionTableRowIndex)
          .get('values').get('' + this.decisionTableColumnIndex).get('variableType').setValue('constant');
        (this.taskPropertyForm.get('conditionVariableList') as FormArray).get('' + this.decisionTableRowIndex).get('values')
          .get('' + this.decisionTableColumnIndex).get('value').setValue(value);
      } else {
        (this.taskPropertyForm.get('assignToVariableValuesList') as FormArray).get('' + this.decisionTableRowIndex)
          .get('values').get('' + this.decisionTableColumnIndex).get('variableType').setValue('constant');
        (this.taskPropertyForm.get('assignToVariableValuesList') as FormArray).get('' + this.decisionTableRowIndex).get('values')
          .get('' + this.decisionTableColumnIndex).get('value').setValue(value);
      }
    }
    if (this.taskType === 'WEB_SERVICE_TASK') {
      if (this.decisionType === 'apiKey') {
        (this.taskPropertyForm.get('apiKey').get('apiKey') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('value').setValue(value);
      } else if (this.decisionType === 'bearerToken') {
        this.taskPropertyForm.get('bearerToken').get('variableType').setValue('constant');
        this.taskPropertyForm.get('bearerToken').get('token').setValue(value);
      } else if (this.decisionType === 'customHeaders') {
        (this.taskPropertyForm.get('customHeaders') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableType').setValue('constant');
        (this.taskPropertyForm.get('customHeaders') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('value').setValue(value);
      } else if (this.decisionType === 'queryParams') {
        (this.taskPropertyForm.get('queryParams') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableType').setValue('constant');
        (this.taskPropertyForm.get('queryParams') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('value').setValue(value);
      } else if (this.decisionType === 'httpMethod') {
        (this.taskPropertyForm.get('webServiceRequestPayload') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('value').setValue(value);
      }
    }

    if (this.taskType === 'CALL_ANOTHER_WORKFLOW') {
      if (this.decisionType === 'callAnotherWorkflowFields') {
        (this.taskPropertyForm.get('callAnotherWorkflowFields') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableType').setValue('constant');
        (this.taskPropertyForm.get('callAnotherWorkflowFields') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('fieldValue').setValue(value);
      }
    }

    if (this.taskType === 'DB_TASK') {
      if (this.decisionType === 'dbTaskFilterValue') {
        (((this.taskPropertyForm.get('whereClause') as FormArray).get('' + this.dbTaskColumnIndex))
          .get('filtersInsideCondition') as FormArray).get('' + this.webServiceTaskRowIndex).get('filterFieldVariableType').setValue('constants');
        (((this.taskPropertyForm.get('whereClause') as FormArray).get('' + this.dbTaskColumnIndex))
          .get('filtersInsideCondition') as FormArray).get('' + this.webServiceTaskRowIndex).get('filterValue').setValue(value);
      } else if (this.decisionType === 'dbTaskInsertValue') {
        (this.taskPropertyForm.get('fieldValues') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('insertFieldVariableType').setValue('constants');
        (this.taskPropertyForm.get('fieldValues') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('insertValue').setValue(value);
      }
    }

    else if (this.taskType === 'SMS_TASK') {
      if (this.decisionType === 'smsTaskMobileNumber') {
        (this.taskPropertyForm.get('mobileNumbersList') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableType').setValue('constant');
        (this.taskPropertyForm.get('mobileNumbersList') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('mobileNumber').setValue(value);
      }
    }

    else if (this.taskType === 'EXCEL_REPORT') {
      if (this.decisionType === 'excelReportValue') {
        (((this.taskPropertyForm.get('excelColumns') as FormArray).get('' + this.dbTaskColumnIndex))
          .get('excelDetails') as FormArray).get('' + this.webServiceTaskRowIndex).get('value').setValue('constants');
        (((this.taskPropertyForm.get('excelColumns') as FormArray).get('' + this.dbTaskColumnIndex))
          .get('excelDetails') as FormArray).get('' + this.webServiceTaskRowIndex).get('value').setValue(value);
      }
    }

    else if (this.taskType === 'COMPUTE_TASK') {
      if (this.decisionType === 'computeTaskVariable') {
        (this.taskPropertyForm.get('rightAssignment') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableType').setValue('constant');
        (this.taskPropertyForm.get('rightAssignment') as FormArray).get('' + this.webServiceTaskRowIndex)
          .get('variableName').setValue(value);
        this.buidComputeTaskValue();
      }
    }
    this.menu.closeMenu();
    this.constantValueForm.get('constantValue').setValue('');
    this.taskPropertyForm.markAsDirty();
  }

  changeInsertValue(datatype, value, variableType) {
    if (datatype.dataType === 'date' && variableType === 'constants') {
      let dateString;
      const date1 = new Date(value);
      dateString = this.datePipe.transform(date1, 'dd-MM-yyyy');
      return dateString;
    } else {
      return value;
    }
  }


  changeDatatypeValue(datatype, value, variableType) {
    if (value !== '') {
      if (datatype === 'date' && variableType === 'constant') {
        let dateString;
        const date1 = new Date(value);
        dateString = this.datePipe.transform(date1, 'dd-MM-yyyy');
        return dateString;
      } else {
        return value;
      }
    }
  }


  setConstant(group: any): void {
    if (group.get('variableType').value === 'constant') {
      this.constantValueForm.get('constantValue').setValue(group.get('value').value);
    } else {
      this.constantValueForm.get('constantValue').setValue('');
    }

  }
  getTemplate(event: any, userForm): void {
    this.taskPropertyForm.get('emailTemplate').setValue(event);
    this.taskPropertyForm.get('emailTemplate').markAsDirty();

  }
  getSystemTemplate(event: any) {
    this.taskPropertyForm.get('mesageBody').setValue(event);
    this.taskPropertyForm.get('mesageBody').markAsDirty();

  }
  getValueSms(event: any) {
    this.taskPropertyForm.get('mesageBody').setValue(event);
    this.taskPropertyForm.get('mesageBody').markAsDirty();
  }

  copyToClipboard() {
    if (this.publicFormUrl !== '' && this.publicFormUrl !== undefined && this.publicFormUrl !== null) {
      this._clipboardService.copy(this.publicFormUrl);
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Copied to Clipboard',
      });
    }
  }

  openInNewTab(publicFormUrl) {
    if (publicFormUrl !== '' && publicFormUrl !== undefined && publicFormUrl !== null) {
      window.open(publicFormUrl, '_blank');
    }
  }

  openTeamsDialog() {
    const dialog = this.dialog.open(
      TeamListComponent,
      {
        disableClose: true,
        width: '50%',
        // maxWidth: '50%',
        height: '70%',
        panelClass: 'config-dialog',
        data: {
          type: 'team-list',
          data: this.teamList,
          pageName: 'workflow',
        },
      });
    dialog.afterClosed().subscribe(assignTeamVO => {
      if (assignTeamVO) {
        this.taskPropertyForm.markAsDirty();
        this.teamList = assignTeamVO.selectedTeam;
        const id = [];
        if (assignTeamVO.deletedTeamID.length !== 0) {
          assignTeamVO.deletedTeamID.forEach(deletedID => {
            const index = this.teamList.findIndex(x => x.id === deletedID);
            this.teamList.splice(index, 1);
          });
        }
        if (assignTeamVO.selectedTeam.length !== 0) {
          assignTeamVO.selectedTeam.forEach(team => {
            id.push(team.id);
          });
        }
        this.taskPropertyForm.get('assigneeGroup').setValue(id);
      }
    });
  }

  openTaskOwnerDialog() {
    const assigneeUser = [];
    if (this.taskPropertyForm.get('assigneeUser').value !== null && this.taskPropertyForm.get('assigneeUser').value !== undefined
      && this.taskPropertyForm.get('assigneeUser').value !== '') {
      assigneeUser.push(this.taskPropertyForm.get('assigneeUser').value);
    }
    const dialog = this.dialog.open(TaskboardOwnerDialogComponent, {
      disableClose: true,
      width: '50%',
      height: '70%',
      data: {
        taskboardOwnerList: assigneeUser,
        usersList: this.userList,
        type: 'workflow-users'
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.taskPropertyForm.markAsDirty();
        this.assignUsersList = data.assignOwnerList;
        if (this.assignUsersList.length !== 0) {
          this.taskPropertyForm.get('assigneeUser').setValue(this.assignUsersList[0].userId);
        } else {
          this.taskPropertyForm.get('assigneeUser').setValue(null);
        }
      }
    });
  }

  setUserProfilename(user) {
    return user.firstName.charAt(0).toUpperCase();
  }

  getUserFirstAndLastNamePrefix(task) {
    let name = '';
    const array = task.split(' ');
    if (array[0]) {
      name = array[0].charAt(0).toUpperCase();
    }
    return name;
  }
  getRemainingAssigneeUserCount(teams: string[]) {
    return teams.length;
  }
  getUserName(user) {
    const index = this.teamList.findIndex((users) => users.id === user.id);
    // return ("Assigned To " + this.teamList[index].id);
  }
}

