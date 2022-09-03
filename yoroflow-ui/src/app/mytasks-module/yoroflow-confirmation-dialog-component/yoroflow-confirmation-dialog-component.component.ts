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
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackbarComponent } from "../../shared-module/snackbar/snackbar.component";
import { TaskPropertyService } from "../../designer-module/task-property/task-property.service";

// import { TaskPropertyService } from "../task-property/task-property.service";
import { AdhocTask } from "../../designer-module/shared/vo/adhoc-task-vo";
import { AdhocTaskService } from "../../designer-module/shared/service/adhoc-task.service";
// import { LoaderService } from 'yoroapps-rendering-lib';
import { LoaderService } from "../../rendering-module/shared/service/form-service/loader-service";
import { C } from "@angular/cdk/keycodes";

@Component({
  selector: "yoroflow-confirmation-dialog-component",
  templateUrl: "./yoroflow-confirmation-dialog-component.component.html",
  styleUrls: ["./yoroflow-confirmation-dialog-component.component.css"],
})
export class YoroFlowConfirmationDialogComponent implements OnInit {
  // tslint:disable-next-line: max-line-length

  @Input() selectedForm: string;
  @Input() version: boolean;
  @Input() type: string;
  @Input() newlyBuildSelectMenu: any;
  @Output() sendSelectedPageId = new EventEmitter();
  @Output() sendPublicForm = new EventEmitter(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<YoroFlowConfirmationDialogComponent>,
    private dialog: MatDialog,
    // tslint:disable-next-line: align
    // tslint:disable-next-line: max-line-length
    private adhocTaskService: AdhocTaskService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private taskPropertyService: TaskPropertyService,
    private loaderservice: LoaderService
  ) { }
  adhocTask: AdhocTask;

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

  ngOnInit() {
    if (
      this.data.data === "selectForm" ||
      this.data === "custom-form" ||
      this.selectedForm === "selectForm"
    ) {
      this.formIdForm = this.formBuilder.group({
        formId: ["", [Validators.required]],
        version: ["", [Validators.required]],
        formName: [""],
      });
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

  deleteNotes() {
    this.adhocTaskService.deleteNotes(this.data.id).subscribe((res) => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: res.response,
      });
      this.dialogRef.close(true);
    });
  }

  deleteFiles() {
    this.adhocTaskService.deleteFiles(this.data.id).subscribe((res) => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: res.response,
      });
      this.dialogRef.close(true);
    });
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

  openPublicform(event) {
    if (event.checked === true) {
      this.isPublicForm = true;
      this.taskPropertyService.getPageId("true").subscribe((data) => {
        this.pageIdList = data;
        this.formIdForm.get("formId").setValue("");
        if (this.loaderservice.showLoader) {
          this.dialogRef.close();
        }
      });
    } else {
      this.isPublicForm = false;
      this.taskPropertyService.getPageId(this.type).subscribe((data) => {
        this.pageIdList = data;
        this.formIdForm.get("formId").setValue("");
        if (this.loaderservice.showLoader) {
          this.dialogRef.close();
        }
      });
    }
    this.sendPublicForm.emit(this.isPublicForm);
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
        }),
        (err) => {
        };
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
  cancelTask() {
    this.dialogRef.close(true);
  }
}
