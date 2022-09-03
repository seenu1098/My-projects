import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdhocTaskService } from '../board/addtask/adhoc-task.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { AdhocTask } from '../board/addtask/VO/adhoc-task-vo';
import { MarketPlaceService } from '../market-place/market-place.service';
import { JsonData } from '../shared/vo/json-vo';
// import { TaskBoardService } from 'src/app/taskboard-configuration/taskboard.service';
import { TaskBoardService } from '../../taskboard-module/taskboard-configuration/taskboard.service';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-confirmation-dialog-box-component',
  templateUrl: './confirmation-dialog-box-component.component.html',
  styleUrls: ['./confirmation-dialog-box-component.component.css']
})
export class ConfirmationDialogBoxComponentComponent implements OnInit {
  // tslint:disable-next-line: max-line-length
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ConfirmationDialogBoxComponentComponent>, private dialog: MatDialog
    , private adhocTaskService: AdhocTaskService, private snackBar: MatSnackBar, private fb: FormBuilder, private marketPlaceService: MarketPlaceService,
    private taskboardService: TaskBoardService) { }
  adhocTask: AdhocTask;

  form: FormGroup;
  workFlowList: any;
  workflowVersionList: any;
  isExportData = false;
  importFileToken: any;
  tokenArray: any[] = [];
  json = new JsonData();
  fileName: any;
  spinnerShow: boolean = false;
  ngOnInit() {
    if (this.data.data && this.data.data === 'addApplication') {
      this.form = this.fb.group({
        title: ['', [Validators.required]],
        version: ['', [Validators.required]],
        description: ['', [Validators.required]],
        developerName: ['', [Validators.required]],
        exportData: [false],
        file: ['', [Validators.required]],
        definitionName: ['', Validators.required],
        publishedOn: ['']
      });
      this.loadWorkflowList();
      this.exportData(this.data.type);
    }
  }

  exportData(type) {
    if (type === 'uploadWorkflow') {
      this.form.get('title').setValidators(null);
      this.form.get('version').setValidators(null);
      this.form.get('file').setValidators([Validators.required]);
      this.form.get('definitionName').setValidators([Validators.required]);
      this.form.get('title').setValue('');
      this.form.get('version').setValue('');
      this.isExportData = true;
    } else if (type === 'selectWorkflow') {
      this.form.get('title').setValidators([Validators.required]);
      this.form.get('version').setValidators([Validators.required]);
      this.form.get('file').setValidators(null);
      this.form.get('definitionName').setValidators(null);
      this.form.get('file').setValue('');
      this.form.get('definitionName').setValue('');
      this.isExportData = false;
    }
  }

  onFileInput(event) {
    if (event.target.files[0].type.includes('/json')) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (_event) => {
        this.fileName = event.target.files[0].name.split('.json', 1);
        if (this.fileName.length > 0) {
          this.form.get('definitionName').setValue(this.fileName[0]);
        }
        this.importFileToken = reader.result;
        this.tokenArray = this.importFileToken.split(',');
        const decodedJwtJsonData = window.atob(this.tokenArray[1]);
        const decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.json = decodedJwtData;
        this.form.get('file').setValue(this.json);
      }
    }
  }

  loadWorkflowList() {
    this.marketPlaceService.getWorkFlowList().subscribe(data => {
      this.workFlowList = data;
    });
  }

  selectVersion(key, event) {
    if (key && event.isUserInput) {
      this.marketPlaceService.getWorkflowVersionList(key).subscribe(data => {
        this.workflowVersionList = data;
      });
    }
  }

  checkAlreadyExist() {
    const definitionName = this.form.get('definitionName');
    if (this.isExportData === true) {
      if (this.workFlowList.some(workflow => workflow.processDefinitionName === definitionName.value)) {
        definitionName.setErrors({ alreadyExist: true });
      }
    }
  }

  upload(userForm) {
    this.checkAlreadyExist();
    if (userForm.valid) {
      this.workFlowList.forEach(workflow => {
        if (this.form.get('title').value && workflow.processDefinitionName === this.form.get('title').value) {
          this.form.get('publishedOn').setValue(workflow.updatedDate);
        } else if (this.form.get('definitionName').value && workflow.processDefinitionName === this.form.get('definitionName').value) {
          this.form.get('publishedOn').setValue(workflow.updatedDate);
        }
      });
      this.dialogRef.close(this.form.getRawValue());
    }
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

  openPage() {
    this.dialogRef.close(true);
  }

  deleteFile() {
    this.spinnerShow = true;
    this.taskboardService.deleteFile(this.data.file).subscribe(data => {
      this.data.taskVO.files.splice(this.data.index, 1);
      this.data.taskVO.filesList = +this.data.taskVO.filesList - 1;

      this.spinnerShow = false;
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: data.response
      });
      this.dialogRef.close();
    });
  }

  cancel() {
    this.dialogRef.close({ status: 'no' });
  }

  dialogClose(data: string): void {
    this.dialogRef.close(data);
  }

  deleteColumn() {
    this.dialogRef.close(true);
  }

  maintaskUnArchive() {
    this.dialogRef.close({ status: 'yes' });

  }
  maintaskUnDelete() {
    this.dialogRef.close({ status: 'yes' });

  }
}


