import {
  Component,
  OnInit,
  Inject,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackbarComponent } from "../../shared-module/snackbar/snackbar.component";
import { TaskPropertyService } from "../../designer-module/task-property/task-property.service";

// import { TaskPropertyService } from "../task-property/task-property.service";

// import { LoaderService } from 'yoroapps-rendering-lib';
import { LoaderService } from "../../rendering-module/shared/service/form-service/loader-service";
import { C } from "@angular/cdk/keycodes";
import { DatePipe } from "@angular/common";
import { Security } from "src/app/creation-module/global-permission/security-vo";
import { UserVO } from "src/app/designer-module/task-property/model/user-vo";
import { GroupVO } from "src/app/designer-module/task-property/model/group-vo";
import { timeStamp } from "console";
import { SubStatusVO } from "../taskboard-configuration/taskboard.model";
import { TaskBoardService } from "../taskboard-configuration/taskboard.service";
import { TaskboardTaskVO } from "../taskboard-form-details/taskboard-task-vo";
import { LicenseVO } from "src/app/shared-module/vo/license-vo";
import { WorkflowDashboardService } from "src/app/engine-module/work-flow-dashboard/workflow-dashboard.service";
import { AlertmessageComponent } from "src/app/shared-module/alert-message/alert-message.component";

@Component({
  selector: "confirmation-dialog-component",
  templateUrl: "./yoroflow-confirmation-dialog-component.component.html",
  styleUrls: ["./yoroflow-confirmation-dialog-component.component.css"],
})
export class ConfirmationDialogComponent implements OnInit {
  // tslint:disable-next-line: max-line-length

  @Input() selectedForm: string;
  @Input() version: boolean;
  @Input() type: any;
  @Input() newlyBuildSelectMenu: any;
  @Output() sendSelectedPageId = new EventEmitter();
  @Output() sendPublicForm = new EventEmitter(false);
  @Output() publicForm = new EventEmitter(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    private dialog: MatDialog,
    // tslint:disable-next-line: align
    // tslint:disable-next-line: max-line-length
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private taskPropertyService: TaskPropertyService,
    private loaderservice: LoaderService,
    private datePipe: DatePipe,
    private taskService: TaskBoardService,
    private workflowDashboardService: WorkflowDashboardService
  ) { }


  pageIdList: any;
  tableList: any;
  tableId: any;
  formIdForm: FormGroup;
  tableIdForm: FormGroup;
  assignmentTypeForm: FormGroup;
  pageVersionList: any;
  pageRendered = false;
  spinner = true;
  showVersion: boolean = true;
  isPublicForm = false;
  date: string;
  selectedDate: any;
  isChecked: boolean = false;
  userList: UserVO[];
  groupList: GroupVO[];
  subStatusForm: FormGroup;
  deleteIdList: string[] = [];
  selectedSubStatusIndex: any;
  showType: any;
  subStatusColorArray1: string[] = ['red', 'green', 'yellow'];
  subStatusColorArray2: string[] = ['blue', 'violet', 'orange'];
  licenseVO = new LicenseVO();
  isPublicFormEnabled = true;
  docType:boolean=false;
  ngOnInit() {
    this.checkPublicFormEnabled();
    if (
      this.data.data === "selectForm" ||
      this.data === "custom-form" ||
      this.selectedForm === "selectForm"
    ) {
      this.formIdForm = this.formBuilder.group({
        formId: ["", [Validators.required]],
        version: ["", [Validators.required]],
        formName: [""],
        isPublicForm: [""],
      });
      if (this.type === true) {
        this.isChecked = true;
        this.isPublicForm = true;
      }
      if (
        this.data.data === "selectForm" ||
        this.selectedForm === "selectForm"
      ) {
        this.loadPageIdentifiers();
      }

      if (this.data === "custom-form") {
        this.loadCustomForms();
      }
    }
    if (this.data.type === 'taskDelete') {
      if (this.data.taskDetails.subTasks.length !== 0 && this.data.taskDetails.subTasks.some(ele => ele.status !== 'Done')) {
        this.showType = 'subtask';
      }
    }
    if (this.data.type === 'taskArchive') {
      if (this.data.taskDetails.subTasks.length !== 0 && this.data.taskDetails.subTasks.some(ele => ele.status !== 'Done')) {
        this.showType = 'subtask';
      }
    }
    if (this.data.version || this.version) {
      this.showVersion = false;
    }
    if (this.data.type === "spinner") {
      this.taskPropertyService
        .getPageVersion(this.data.formId, this.data.layout)
        .subscribe((data) => {
          if (data) {
            this.dialogRef.close(data);
            this.spinner = false;
          } else {
            this.dialogRef.close();
            this.spinner = false;
          }
        });
    }
    if(this.data.type === 'documentDelete'){
    if(this.data.value.yoroDocumentsVo.length === 0){
     this.docType=true;
    }
    else{
      this.docType=false;

    }
    }
    if (this.data.data === "selectTable") {
      this.tableIdForm = this.formBuilder.group({
        tableName: [""],
        tableId: [""],
      });
      this.loadTables();
    }
    if (this.data.type === "variableTypeChange") {
      this.assignmentTypeForm = this.formBuilder.group({
        dataType: ["", [Validators.required]],
        variableName: [""],
        variableType: [""],
      });
    }

    if (
      this.data === "linkProperty" ||
      this.data === "cancelWorkflow" ||
      this.data === "approveTaskProperty"
    ) {
      this.assignmentTypeForm = this.formBuilder.group({
        taskType: ["", [Validators.required]],
      });
    }
    this.assignmentDataType();
    if (this.data.type === 'template') {
      this.loadGroupsList();
      this.loadUsersList();
    }
  }

  assignmentDataType() {
    if (this.data.type === "variableTypeChange") {
      if (this.data.group !== undefined) {
        this.assignmentTypeForm.patchValue(this.data.group);
      }
    }
  }

  saveLink() {
    if (this.assignmentTypeForm.valid) {
      this.dialogRef.close(this.assignmentTypeForm.get("taskType").value);
    }
  }

  onNoClickTask() {
    this.dialogRef.close({
      cancel: false,
      type: this.assignmentTypeForm.get("variableType").value,
    });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  isPageRendered(data) {
    if (data === "editable") {
      this.pageRendered = true;
    }
  }

  selectedPageId() {
    if (this.formIdForm.valid) {
      this.loadCustomFormVersion();
      this.sendSelectedPageId.emit(this.formIdForm.value);
      if (this.selectedForm === undefined) {
        this.dialogRef.close(this.formIdForm.value);
      }
    }
  }

  getVersion(version) {
    if (version) {
      this.formIdForm.get("version").setValue(version);
    }
  }

  selectedTable() {
    this.dialogRef.close(this.tableIdForm.value);
  }

  setTableId(tableObjectId) {
    this.tableIdForm.get("tableId").setValue(tableObjectId);
  }

  constantValue() {
    if (this.assignmentTypeForm.valid) {
      this.dialogRef.close(this.assignmentTypeForm.value);
    }
  }

  loadCustomForms() {
    this.taskPropertyService.loadCustomPage().subscribe((data) => {
      this.pageIdList = data;
      if (this.loaderservice.showLoader) {
        this.dialogRef.close();
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

  openPublicform(event) {
    if (this.isPublicFormEnabled === false) {
      this.formIdForm.get('isPublicForm').setValue(false);
      const dialog = this.dialog.open(AlertmessageComponent, {
        width: '450px',
        data: { message: "Your current plan doesn't support to enable this option, Please upgrade your plan" }
      });
      dialog.afterClosed().subscribe(data => {
        if (data) {
          this.dialogRef.close();
        }
      });
    } else {
      if (event.checked === true) {
        this.formIdForm.get('isPublicForm').setValue(true);
        this.isPublicForm = true;
        this.taskPropertyService.getPageId("true").subscribe((data) => {
          this.pageIdList = data;
          this.formIdForm.get("formId").setValue("");
          if (this.loaderservice.showLoader) {
            this.dialogRef.close();
          }
        });
      } else {
        this.type = 'workflowForms';
        this.isPublicForm = false;
        this.taskPropertyService.getPageId(this.type).subscribe((data) => {
          this.pageIdList = data;
          this.formIdForm.get("formId").setValue("");
          if (this.loaderservice.showLoader) {
            this.dialogRef.close();
          }
        });
      }
      this.publicForm.emit(this.isPublicForm);
    }
  }

  loadPageIdentifiers() {
    const types = this.data.type !== undefined ? this.data.type : this.type;
    this.taskPropertyService.getPageId(types).subscribe((data) => {
      this.pageIdList = data;

      if (this.loaderservice.showLoader) {
        this.dialogRef.close();
      }

    });
  }
  loadVersion(newFormId?: string, types?: string) {

    const pageId = this.formIdForm.get("formId").value;
    if (pageId !== "") {
      this.taskPropertyService
        .getPageVersion(pageId, this.isPublicForm)
        .subscribe((data) => {
          this.pageVersionList = data;
          this.formIdForm
            .get("version")
            .setValue(this.pageVersionList[0].version);
          this.formIdForm
            .get("formName")
            .setValue(this.pageVersionList[0].pageName);
          this.sendSelectedPageId.emit(this.formIdForm.value);
        }),
        (err) => {
        };
    }
    if (this.isPublicForm) {
      this.sendPublicForm.emit(pageId);
    }
  }

  loadCustomFormVersion() {
    if (this.data === "custom-form") {
      this.pageIdList.forEach((element) => {
        if (element.pageId === this.formIdForm.get("formId").value) {
          this.formIdForm.get("version").setValue(element.version);
        }
      });
    }
  }

  loadTables() {
    this.taskPropertyService.getTables().subscribe((data) => {
      this.tableList = data;
      if (this.loaderservice.showLoader) {
        this.dialogRef.close();
      }
    });
  }

  deleteConnection() {
    this.dialogRef.close(true);
  }

  closeDialog() {
    this.dialogRef.close(true);
  }

  confirmClose() {
    this.dialogRef.close(true);
  }

  loadLatestVersion() {
    this.dialogRef.close("loadLatestVersion");
  }

  getPermission() {
    this.dialogRef.close(true);
  }

  close() {
    // this.dialogRef.close('no');
    this.dialogRef.close("no");
  }

  UpdateAll() {
    this.dialogRef.close(true);
  }

  addProviders() {
    this.dialogRef.close(true);
  }

  onSelect(event) {
    this.selectedDate = event;
    this.date = this.datePipe.transform(event, 'dd-MMM-yyyy')
  }

  saveDate() {
    if (this.date !== undefined && this.date !== null && this.date !== '') {
      this.dialogRef.close(this.date);
    }
  }

  loadUsersList() {
    this.taskPropertyService.getUsersList().subscribe(data => {
      this.userList = data;
    });
  }

  loadGroupsList() {
    this.taskPropertyService.getGroupsList().subscribe(data => {
      this.groupList = data;
    });
  }

  getGlobalPermission(pageSecurityVO: Security): void {
    this.dialogRef.close(pageSecurityVO);
  }
  onNodelete() {
    this.dialogRef.close();

  }
  deleteTask() {
    this.dialogRef.close({ status: 'yes' });

  }

  cancel() {
    this.dialogRef.close({ status: 'no' });
  }


  maintaskDelete() {
    this.dialogRef.close({ status: 'yes' });

  }
  done() {
    this.dialogRef.close();

  }
  maintaskArchive() {
    this.dialogRef.close({ status: 'yes' });

  }
  deleteDocument(){
    this.dialogRef.close({ status: 'yes' });
  
  }

  delete(){
    this.dialogRef.close('yes');
  }

  confirmSprintTask() {
    this.dialogRef.close(true);
  }
}

