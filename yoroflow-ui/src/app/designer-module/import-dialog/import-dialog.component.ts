import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateWorkflowComponent } from 'src/app/engine-module/create-workflow/create-workflow.component';
// import { TableObjectsVO } from 'yoroapps-creation/lib/table-objects/table-object-vo';
import { TableObjectsVO } from "../../creation-module/table-objects/table-object-vo";
// import { ConfirmationDialogBoxComponentComponent, YoroSecurityComponent } from '../../public-api';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { ExportPages, Page, PageIdListVO, Permission } from '../task-flow/model/page-vo';
import { Workflow } from '../task-flow/model/workflow.model';
import { TaskService } from '../task-flow/services/task.service';

@Component({
  selector: 'lib-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.css']
})
export class ImportDialogComponent implements OnInit {

  importForm: FormGroup;
  pageJsonData: Page[] = [];
  tableJsonData: TableObjectsVO[] = [];
  workflowJsonData: Workflow;
  pageNameList: any[] = [];
  workflowList: any[] = [];
  tableNamelist: any[] = [];
  exportPages: ExportPages[] = [];
  permissionJson: Permission[] = [];
  randomNumber: any;
  type: any;
  tableShow = false;
  URL: any;
  isFromTemplate = false;
  constructor(private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ConfirmationDialogBoxComponentComponent>,
    private dialog: MatDialog, private taskService: TaskService, private router: Router) { }

  ngOnInit() {
    if (window.location.href.includes('template-center')) {
      this.isFromTemplate = true;
    }
    let arrOfString = window.location.href.split('//', 2);
    this.URL = arrOfString[1].split('.', 2);
    this.getRandomNumber();
    this.type = this.data.type;
    this.pageJsonData = this.data.pageJson;
    this.tableJsonData = this.data.tableVO;
    this.workflowJsonData = this.data.workflowJson;
    this.permissionJson = this.data.permission;
    this.exportPages = this.data.exportPage;
    if (this.tableJsonData.length > 0) {
      this.tableShow = true;
    }
    for (let i = 0; i < this.exportPages.length; i++) {
      for (let j = 0; j < this.pageJsonData.length; j++) {
        if (this.exportPages[i].pageId === this.pageJsonData[j].pageId && this.pageJsonData[j].count === 0) {
          this.pageJsonData[j].taskId = this.exportPages[i].taskId;
          this.pageJsonData[j].count = 1;
          if (this.pageJsonData[j].taskId.includes('START')) {
            this.pageJsonData[j].type = 'START TASK';
          } else if (this.pageJsonData[j].taskId.includes('USER')) {
            this.pageJsonData[j].type = 'USER TASK';
          } else if (this.pageJsonData[j].taskId.includes('APPROVAL')) {
            this.pageJsonData[j].type = 'APPROVAL TASK';
          }
        }
      }
    }
    this.importForm = this.fb.group({
      oldWorkflowName: [''],
      newWorkflowName: [''],
      importFieldsArray: this.fb.array([
        this.importFieldsGroup()
      ]),
      tableObjectsArray: this.fb.array([
        this.importTablesGroup()
      ])
    });
    this.loadImportForm();
    this.loadImportTableForm();
    this.getPermissions();
    this.taskService.getPageNameList().subscribe(list => {
      this.pageNameList = list;
    });
    this.taskService.getWorkFlowList().subscribe(list => {
      this.workflowList = list;
    });
    this.taskService.getTableNames().subscribe(tableList => {
      this.tableNamelist = tableList;
    });
  }

  getPermissions() {
    let pageIdList = new PageIdListVO();
    if (this.permissionJson.length === 0) {
      for (let i = 0; i < this.pageJsonData.length; i++) {
        pageIdList.uuidList.push(this.pageJsonData[i].yorosisPageId);
      }
      this.taskService.getPagePermissions(pageIdList).subscribe(data => {
        this.permissionJson = data;
      });
    }
  }
  generateWorkFlowKey(name: string) {
    name = (name).replace(/[^\w\s]/gi, '');
    name = (name).trim().toLowerCase().replace(/ +/g, '-');
    return name;
  }
  checkWorkflowName() {
    const oldWorkflowName = this.importForm.get('oldWorkflowName').value;
    const newWorkflowName = this.importForm.get('newWorkflowName');
    if (newWorkflowName.value !== null && newWorkflowName.value !== '') {
      this.taskService.checkWorkflowByKey(this.generateWorkFlowKey(newWorkflowName.value)).subscribe(data => {
        if (data.response.includes('already exist')) {
          newWorkflowName.setErrors({ alreadyExist: true });
        }

        if (oldWorkflowName === newWorkflowName.value) {
          newWorkflowName.setErrors({ sameName: true });
        }
      });
    }


  }

  checkPageName(i) {
    const group = this.importForm.get('importFieldsArray').get('' + i);
    const oldpageName = group.get('oldPageName').value;
    const newPageName = group.get('newPageName');
    if (this.pageNameList.some(page => page.pageName === newPageName.value)) {
      newPageName.setErrors({ alreadyExist: true });
    }
    if (oldpageName === newPageName.value) {
      newPageName.setErrors({ sameName: true });
    }
  }

  checkTableName(i) {
    const group = this.importForm.get('tableObjectsArray').get('' + i);
    const oldTableName = group.get('oldTableName').value;
    const newTableName = group.get('newTableName');
    if (this.tableNamelist.some(table => table.tableName === newTableName.value)) {
      newTableName.setErrors({ alreadyExist: true });
    }
    if (oldTableName === newTableName.value) {
      newTableName.setErrors({ sameName: true });
    }
  }

  importFieldsGroup(): FormGroup {
    return this.fb.group({
      oldPageName: [''],
      newPageName: [''],
      importType: [''],
      taskType: ['']
    })
  }

  getImportFieldsFormArray() {
    return (this.importForm.get('importFieldsArray') as FormArray).controls;
  }

  addImportFieldsFormArray() {
    (this.importForm.get('importFieldsArray') as FormArray).push(this.importFieldsGroup());
  }

  loadImportForm() {
    this.importForm.get('oldWorkflowName').setValue(this.workflowJsonData.name);
    this.importForm.get('oldWorkflowName').disable();
    for (let i = 0; i < this.pageJsonData.length; i++) {
      if (i > 0) {
        this.addImportFieldsFormArray();
      }
      const group = ((this.importForm.get('importFieldsArray') as FormArray).get('' + i) as FormGroup);
      group.get('oldPageName').setValue(this.pageJsonData[i].pageName);
      group.get('importType').setValue('asItIs');
      group.get('taskType').setValue(this.pageJsonData[i].type);
      group.get('newPageName').disable();
      group.get('oldPageName').disable();
      group.get('taskType').disable();
    }
  }

  importTablesGroup(): FormGroup {
    return this.fb.group({
      oldTableName: [''],
      newTableName: [''],
      importType: [''],
    })
  }

  getImportTablesFormArray() {
    return (this.importForm.get('tableObjectsArray') as FormArray).controls;
  }

  addImportTablesFormArray() {
    (this.importForm.get('tableObjectsArray') as FormArray).push(this.importTablesGroup());
  }

  loadImportTableForm() {
    for (let i = 0; i < this.tableJsonData.length; i++) {
      if (i > 0) {
        this.addImportTablesFormArray();
      }
      const group = ((this.importForm.get('tableObjectsArray') as FormArray).get('' + i) as FormGroup);
      group.get('oldTableName').setValue(this.tableJsonData[i].tableName);
      group.get('importType').setValue('asItIs');
      group.get('newTableName').disable();
      group.get('oldTableName').disable();
    }
  }

  selectChangeForTable(event, i) {
    let newTableName = this.importForm.get('tableObjectsArray').get('' + i).get('newTableName');
    if (event.value === 'asItIs') {
      newTableName.setValue('');
      newTableName.setValidators(null);
      newTableName.disable();
    } else if (event.value === 'copy') {
      newTableName.enable();
      newTableName.setValidators([Validators.required]);
    }
    newTableName.updateValueAndValidity();
  }

  selectChange(event, i) {
    let newPageName = this.importForm.get('importFieldsArray').get('' + i).get('newPageName');
    if (event.value === 'asItIs') {
      newPageName.setValue('');
      newPageName.setValidators(null);
      newPageName.disable();
    } else if (event.value === 'copy') {
      newPageName.enable();
      newPageName.setValidators([Validators.required]);
    }
    newPageName.updateValueAndValidity();
  }

  getRandomNumber() {
    this.randomNumber = Math.random().toString(36).substring(2, 5);
  }

  setUniqueTaskKeys(type) {
    return type + this.randomNumber;
  }

  getWorkflowKeys() {
    this.workflowJsonData.startKey = this.setUniqueTaskKeys(this.workflowJsonData.startKey);
    this.workflowJsonData.canPublish = false;
    this.workflowJsonData.status = 'draft';
    this.workflowJsonData.linkNodeList.forEach(link => {
      link.key = this.setUniqueTaskKeys(link.key);
      link.source = this.setUniqueTaskKeys(link.source);
      link.target = this.setUniqueTaskKeys(link.target);
    });
    this.workflowJsonData.taskNodeList.forEach(task => {
      task.key = this.setUniqueTaskKeys(task.key);
      if (task.taskType === 'APPROVAL_TASK') {
        if (task.taskProperty.propertyValue.approvalTask) {
          task.taskProperty.propertyValue.approvalTask = this.setUniqueTaskKeys(task.taskProperty.propertyValue.approvalTask);
        }
        if (task.taskProperty.propertyValue.rejectedTask) {
          task.taskProperty.propertyValue.rejectedTask = this.setUniqueTaskKeys(task.taskProperty.propertyValue.rejectedTask);
        }
        if (task.taskProperty.propertyValue.sendBackTask) {
          task.taskProperty.propertyValue.sendBackTask = this.setUniqueTaskKeys(task.taskProperty.propertyValue.sendBackTask);
        }
      }
      const arrOfString = window.location.href.split('//', 2);
      const Url = arrOfString[1].split('.', 2);
      // const Url = ['yorosis', 'yorosis.yoroflow.com'];
      if (this.type === 'import' && this.data.subdoainName !== Url[0]) {
        if (task.taskProperty.propertyValue && (task.taskProperty.propertyValue.assigneeUser
          || task.taskProperty.propertyValue.assigneeGroup)) {
          task.taskProperty.propertyValue.assigneeUser = '';
          task.taskProperty.propertyValue.assigneeGroup = '';
        }
      }
    });
  }


  submit(userForm) {
    const oldWorkflowName = this.importForm.get('oldWorkflowName').value;
    const newWorkflowName = this.importForm.get('newWorkflowName');
    if (newWorkflowName.value !== null && newWorkflowName.value !== '') {
      this.taskService.checkWorkflowByKey(this.generateWorkFlowKey(newWorkflowName.value)).subscribe(data => {
        if (data.response.includes('already exist')) {
          newWorkflowName.setErrors({ alreadyExist: true });
        }
        else {
          if (userForm.valid) {
            const pageVO: Page[] = [];
            const permissionVO: Permission[] = [];
            this.workflowJsonData.name = this.importForm.get('newWorkflowName').value;
            this.workflowJsonData.workflowId = '';
            const name = (this.workflowJsonData.name).replace(/[^\w\s]/gi, '');
            this.workflowJsonData.key = (name).trim().toLowerCase().replace(/ +/g, '-');
            for (let i = 0; i < this.tableJsonData.length; i++) {
              const newTableName = this.importForm.get('tableObjectsArray').get('' + i).get('newTableName').value;
              const oldTableName = this.importForm.get('tableObjectsArray').get('' + i).get('oldTableName').value;
              if (newTableName !== '' && newTableName !== null && newTableName !== undefined) {
                this.tableJsonData.forEach(table => {
                  if (table.tableName === oldTableName) {
                    this.tableJsonData[i].tableName = newTableName;
                    const prefix = table.tableIdentifier.split('_', 2);
                    const tableId = (newTableName).trim().toLowerCase().replace(/ +/g, '');
                    this.tableJsonData[i].tableIdentifier = prefix[0] + '_' + tableId;
                  }
                })
                for (let j = 0; j < this.pageJsonData.length; j++) {
                  this.setTableName(this.pageJsonData[j], oldTableName, newTableName);
                }
              }
            }
            for (let i = 0; i < this.pageJsonData.length; i++) {
              const newPageName = this.importForm.get('importFieldsArray').get('' + i).get('newPageName');
              const oldPageName = this.importForm.get('importFieldsArray').get('' + i).get('oldPageName').value;
              if (newPageName.value !== '' && newPageName.value !== null && newPageName.value !== undefined) {
                this.pageJsonData[i].pageName = newPageName.value;
                this.pageJsonData[i].yorosisPageId = '';
                this.pageJsonData[i].version = 1;
                this.pageJsonData[i].pageId = (newPageName.value).trim().toLowerCase().replace(/ +/g, '');
                this.workflowJsonData.taskNodeList.forEach(task => {
                  if (task.key === this.pageJsonData[i].taskId) {
                    task.taskProperty.propertyValue.formIdentifier = this.pageJsonData[i].pageId;
                    task.taskProperty.propertyValue.formVersion = 1;
                    task.taskProperty.propertyValue.pageName = this.pageJsonData[i].pageName;
                  }
                });
                this.permissionJson.forEach(permission => {
                  if (permission.pageName === oldPageName) {
                    permission.pageName = newPageName.value;
                    permissionVO.push(permission);
                  }
                });
                if (this.pageJsonData[i].layoutType === 'publicForm') {
                  this.pageJsonData[i].sections.forEach(mainSection => {
                    mainSection.rows.forEach(row => {
                      row.columns.forEach(column => {
                        if (column.controlType === 'button') {
                          column.field.control.buttonType = 'action';
                          column.field.control.screenType = 'callWorkflow';
                          column.field.control.saveAndCallWorkflow = true;
                          column.field.control.workflowKey = this.workflowJsonData.key;
                          column.field.control.workflowVersion = 'latest';
                        }
                      });
                    });
                  });
                }
                pageVO.push(this.pageJsonData[i]);
              } else {
                const arrOfString = window.location.href.split('//', 2);
                const Url = arrOfString[1].split('.', 2);
                // const Url = ['yorosis', 'yorosis.yoroflow.com'];
                if (this.type === 'import' && this.data.subdoainName !== Url[0]) {
                  this.pageJsonData[i].yorosisPageId = '';
                  this.pageJsonData[i].version = 1;
                  pageVO.push(this.pageJsonData[i]);
                  this.workflowJsonData.taskNodeList.forEach(task => {
                    if (task.key === this.pageJsonData[i].taskId) {
                      task.taskProperty.propertyValue.formIdentifier = this.pageJsonData[i].pageId;
                    }
                    if (task.taskProperty.propertyValue && task.taskProperty.propertyValue.formVersion) {
                      task.taskProperty.propertyValue.formVersion = 1;
                    }
                  });
                }
              }
            }
            this.getWorkflowKeys();
            const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
              disableClose: true,
              width: '900px',
              panelClass: 'scroll',
              maxHeight: '600px',
              data: { data: 'importPermission', page: this.pageJsonData, workflow: this.workflowJsonData }
            });
            dialog.afterClosed().subscribe(data => {
              if (data !== false) {
                this.dialogRef.close({ pageVo: pageVO, workflowData: data.workflow, permissionVoList: data.permission });
              }
            });
          }

        }
        if (oldWorkflowName === newWorkflowName.value) {
          newWorkflowName.setErrors({ sameName: true });
        }
      });
    }


  }

  setTableName(page, oldTableName, newTableName) {
    page.sections.forEach(mainSection => {
      mainSection.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'select' || column.controlType === 'multipleselect' ||
            column.controlType === 'radiobutton') {
            if (column.field.control.optionType === 'd' && column.field.control.filter.tableName && column.field.control.filter.pageName === oldTableName) {
              column.field.control.filter.pageName = newTableName;
              const tableName = column.field.control.filter.tableName.split('_', 2);
              const tableId = (newTableName).trim().toLowerCase().replace(/ +/g, '');
              column.field.control.filter.tableName = tableName[0] + '_' + tableId;
            }
          } else if (column.controlType === 'autocomplete') {
            if (column.field.control.tableName && column.field.control.filter.pageName === oldTableName) {
              column.field.control.filter.pageName = newTableName;
              const tableName = column.field.control.filter.tableName.split('_', 2);
              const tableId = (newTableName).trim().toLowerCase().replace(/ +/g, '');
              column.field.control.filter.tableName = tableName[0] + '_' + tableId;
            }
          } else if (column.controlType === 'input') {
            if (column.field.enableHyperlink === true && column.field.control.targetPageName && column.field.control.targetPageName === oldTableName) {
              column.field.control.targetPageName = newTableName;
              column.field.control.targetPageId === (newTableName).trim().toLowerCase().replace(/ +/g, '');
            }
          }
          //  else if (column.controlType === 'grid') {
          //   if (page.pageIdWithPrefix) {
          //     column.field.control.filter.tableName === newTableName;
          //   }
          // }
          else if (column.controlType === 'table') {
            if (column.field.control.tableId) {
              column.field.control.tableName === newTableName;
              const tableId = (newTableName).trim().toLowerCase().replace(/ +/g, '');
              column.field.control.filter.tableName = tableId;
            }
          } else if (column.controlType === 'button' && column.field.control.buttonType &&
            column.field.control.buttonType === 'action') {
            if (column.field.control.screenType && column.field.control.screenType !== 'webServiceCall'
              && column.field.control.screenType !== 'callWorkflow' && column.field.control.filter.pageName === oldTableName) {
              column.field.control.filter.pageName = newTableName;
              const tableName = column.field.control.filter.tableName.split('_', 2);
              const tableId = (newTableName).trim().toLowerCase().replace(/ +/g, '');
              column.field.control.filter.tableName = tableName[0] + '_' + tableId;
            }
          }
        });
      });
      if (mainSection.sections && mainSection.sections.length > 0) {
        this.setTableName(mainSection, oldTableName, newTableName);
      }
    });
  }

  cancel() {

    if (window.location.href.includes('/template-center')) {
      this.dialogRef.close(false);
      this.router.navigate(['/template-center'])
    } else {
      const configDialog = this.dialog.open(
        CreateWorkflowComponent,
        {
          disableClose: true,
          width: '95%',
          maxWidth: '95%',
          height: '95%',
          panelClass: 'config-dialog',
          data: {
            pageName: "Workflow Dashboard",
            fromScratch: true
          },
        });
      configDialog.afterClosed().subscribe(data => {
        if (data !== undefined) {

        }
      })
      this.dialogRef.close(false);
    }
  }

}
