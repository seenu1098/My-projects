import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdhocTaskService } from '../board/addtask/adhoc-task.service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { AdhocTask } from '../board/addtask/VO/adhoc-task-vo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskPropertyService } from './task-property.service';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-yoroflow-confirmation-dialog-component',
  templateUrl: './yoroflow-confirmation-dialog-component.component.html',
  styleUrls: ['./yoroflow-confirmation-dialog-component.component.css']
})
export class YoroFlowConfirmationDialogComponent implements OnInit {

  // tslint:disable-next-line: max-line-length
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<YoroFlowConfirmationDialogComponent>, private dialog: MatDialog
    // tslint:disable-next-line: align
    // tslint:disable-next-line: max-line-length
    , private adhocTaskService: AdhocTaskService, private sanitizer: DomSanitizer, private snackBar: MatSnackBar, private formBuilder: FormBuilder, private taskPropertyService: TaskPropertyService) { }
  adhocTask: AdhocTask;

  pageIdList: any;
  tableList: any;
  tableId: any;
  formIdForm: FormGroup;
  tableIdForm: FormGroup;
  assignmentTypeForm: FormGroup;
  otpForm: FormGroup;
  qrForm: FormGroup;

  ngOnInit() {
    if (this.data === 'selectForm' || this.data === 'custom-form') {
      this.formIdForm = this.formBuilder.group({
        formId: [''],
      });
      if (this.data === 'selectForm') {
        this.loadPageIdentifiers();
      }

      if (this.data === 'custom-form') {
        this.loadCustomForms();
      }

    }
    if (this.data === 'selectTable') {
      this.tableIdForm = this.formBuilder.group({
        tableName: [''],
        tableId: ['']
      });
      this.loadTables();
    }
    if (this.data.type === 'variableTypeChange') {
      this.assignmentTypeForm = this.formBuilder.group({
        dataType: ['', [Validators.required]],
        variableName: [''],
        variableType: [''],
      });
    }

    if (this.data === 'linkProperty' || this.data === 'cancelWorkflow' || this.data === 'approveTaskProperty') {
      this.assignmentTypeForm = this.formBuilder.group({
        taskType: ['', [Validators.required]],
      });
    }
    this.assignmentDataType();
  }

  enter() {
    this.dialogRef.close(true);
  }

  transformImageQr() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.data.qr);
  }

  assignmentDataType() {
    if (this.data.type === 'variableTypeChange') {
      if (this.data.group !== undefined) {
        this.assignmentTypeForm.patchValue(this.data.group);
      }
    }
  }

  saveLink() {
    if (this.assignmentTypeForm.valid) {
      this.dialogRef.close(this.assignmentTypeForm.get('taskType').value);
    }
  }

  onNoClickTask() {
    this.dialogRef.close({ cancel: false, type: this.assignmentTypeForm.get('variableType').value });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  deleteNotes() {
    this.adhocTaskService.deleteNotes(this.data.id).subscribe(res => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: res.response
      });
      this.dialogRef.close(true);
    });
  }

  deleteFiles() {
    this.adhocTaskService.deleteFiles(this.data.id).subscribe(res => {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: res.response
      });
      this.dialogRef.close(true);
    });
  }

  selectedPageId() {
    this.dialogRef.close(this.formIdForm.get('formId').value);
  }

  selectedTable() {
    this.dialogRef.close(this.tableIdForm.value);
  }

  setTableId(tableObjectId) {
    this.tableIdForm.get('tableId').setValue(tableObjectId);
  }

  constantValue() {
    if (this.assignmentTypeForm.valid) {
      this.dialogRef.close(this.assignmentTypeForm.value);
    }
  }

  loadCustomForms() {
    this.taskPropertyService.loadCustomPage().subscribe(data => {
      this.pageIdList = data;
    });
  }

  loadPageIdentifiers() {
    this.taskPropertyService.getPageId().subscribe(data => {
      this.pageIdList = data;
    });
  }

  loadTables() {
    this.taskPropertyService.getTables().subscribe(data => {
      this.tableList = data;
    });
  }

  deleteConnection() {
    this.dialogRef.close(true);
  }


  closeDialog() {
    this.dialogRef.close(true);
  }

  cancelTask() {
    this.dialogRef.close(true);
  }

  dialogClose(event) {
if (event === true) {
  this.dialogRef.close(true);
}
  }
}


