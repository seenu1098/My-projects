import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
// import { DynamicMenuService } from 'yoroapps-rendering-lib/lib/dynamic-menu/dynamic-menu.service';
// import { LoadMenuDetails } from 'yoroapps-rendering-lib/lib/dynamic-side-nav-bar/load-menu-details';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { GroupVO } from '../task-property/model/group-vo';
import { PageFieldVo } from '../task-property/page-field-vo';
import { TaskPropertyService } from '../task-property/task-property.service';

// import { GroupVO } from '../task-property/model/group-vo';
// import { PageFieldVo } from '../task-property/page-field-vo';
// import { TaskPropertyService } from '../task-property/task-property.service';
import { WorkFlowList, WorkflowReportVo } from './report-config-vo';
import { ReportConfigurationService } from './report-configuration.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'lib-report-configuration',
  templateUrl: './report-configuration.component.html',
  styleUrls: ['./report-configuration.component.css']
})
export class ReportConfigurationComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private reportConfigurationService: ReportConfigurationService,
    private snackBar: MatSnackBar, private taskPropertyService: TaskPropertyService, private workspaceService: WorkspaceService) { }

  form: FormGroup;
  workflowVersionList: WorkFlowList[] = [];
  workFlowList: WorkFlowList[] = [];
  taskNameList: any[] = [];
  initialFieldList: any[] = [];
  enabledSumbit = false;
  forUpdate = false;
  workflowReportVo: any;
  displayColumsValue: any[] = [];
  formId = '';
  groupList: GroupVO[];
  emptyDisplay = false;
  isversionLoad = false;
  workflowVersionChange = false;
  sameTaskName = false;
  // dataSource: LoadMenuDetails;

  @ViewChild('reportStepper') private reportStepper: MatStepper;
  @ViewChild('gridConfig', { static: true }) gridConfig: YorogridComponent;
  @ViewChild('displayTable') displayTable: ElementRef;
  @ViewChild('countTable') countTable: ElementRef;
  @ViewChild('sumTable') sumTable: ElementRef;
  @ViewChild('avgTable') avgTable: ElementRef;
  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.form = this.fb.group({
      id: [''],
      reportName: ['', [Validators.required]],
      reportLabel: [''],
      reportType: ['', Validators.required],
      workflowName: ['', [Validators.required]],
      workflowKey: ['', [Validators.required]],
      workflowVersion: [],
      taskName: ['', [Validators.required]],
      taskId: [''],
      workspaceId: [this.workspaceService.workspaceID],
      latestVersion: [false],
      displayColumns: this.fb.group({}),
      sumColumns: this.fb.group({}),
      sumDisplayName: ['Sum'],
      averageColumns: this.fb.group({}),
      averageDisplayName: ['Average'],
      countColumns: this.fb.group({}),
      // countDisplayName: ['Count'],
      groupByColumns: this.fb.group({}),
      enableReport: [false],
      groupId: [],
      allowAllVersion: [false]
    });
    this.loadWorkFlowList();
    this.workflowNameChange();
    this.taskNameChange();
    this.loadGroupsList();
  }

  setDisplayHeight() {
    let displayHeight = 0;
    if (this.displayTable && this.displayTable.nativeElement !== undefined) {
      displayHeight = this.displayTable.nativeElement.offsetHeight - 40;
    }
    return displayHeight;
  }

  setSumHeight() {
    let sumHeight = 0;
    if (this.sumTable && this.sumTable.nativeElement !== undefined) {
      sumHeight = this.sumTable.nativeElement.offsetHeight;
      if (sumHeight > 35) {
        sumHeight = sumHeight - 35;
      } else {
        sumHeight = 0;
      }
    }
    return sumHeight;
  }

  setAvgHeight() {
    let avgHeight = 0;
    if (this.avgTable && this.avgTable.nativeElement !== undefined) {
      avgHeight = this.avgTable.nativeElement.offsetHeight;
      if (avgHeight > 35) {
        avgHeight = avgHeight - 35;
      } else {
        avgHeight = 0;
      }
    }
    return avgHeight;
  }

  setCountHeight() {
    let countHeight = 0;
    if (this.countTable && this.countTable.nativeElement !== undefined) {
      countHeight = this.countTable.nativeElement.offsetHeight;
      if (countHeight > 35) {
        countHeight = countHeight - 35;
      } else {
        countHeight = 0;
      }
    }
    return countHeight;
  }

  showSumCount() {
    let hasNumberField = false;
    this.initialFieldList.forEach(fields => {
      if (fields.datatype === 'long' || fields.datatype === 'float') {
        hasNumberField = true;
        return hasNumberField;
      }
    });
    return hasNumberField;
  }

  receiveMessage(event) {
    if (event.col1 !== null) {
      this.reset();
      this.reportConfigurationService.getReportList(event.col1).subscribe(data => {
        if (data) {
          this.forUpdate = true;
          this.sameTaskName = false;
          this.workflowReportVo = data;
          this.loadWorkFlowList();
          this.loadTaskName(data.workflowKey, data.workflowVersion, true);
          this.loadFieldValuesForTask(data.reportJson.taskId, true);
          this.loadVersion(data.workflowKey, true);
          this.loadReportForm(data);
          this.formId = data.id;
        }
      });
    }
  }

  loadNewTaskDetails() {
    if (this.form.get('allowAllVersion').value === true) {
      const workflowName = this.form.get('workflowKey').value;
      if (workflowName !== '' && workflowName !== null && this.workflowVersionList.length > 0) {
        this.form.get('workflowVersion').setValue(this.workflowVersionList[0].workflowVersion);
      }
    }
  }

  allowAllVersionChange(event) {
    if (event) {
      this.loadNewTaskDetails();
    }
  }

  loadReportForm(data) {
    this.form.patchValue(data.reportJson, { emitEvent: false });
  }

  loadWorkFlowList() {
    this.reportConfigurationService.getWorkFlowList().subscribe(data => {
      this.workFlowList = data;
    });
  }

  loadGroupsList() {
    this.taskPropertyService.getGroupsList().subscribe(data => {
      this.groupList = data;
    });
  }

  selectVersion(workflow, event) {
    if (workflow && event.isUserInput) {
      this.workflowVersionChange = false;
      this.form.get('workflowName').setValue(workflow.processDefinitionName);
      this.form.get('workflowVersion').setValue('');
      this.form.get('taskName').setValue('');
      this.form.get('taskId').setValue('');
      this.loadVersion(workflow.key, false);
    }
  }

  loadVersion(key, fromLoad) {
    this.isversionLoad = false;
    this.reportConfigurationService.getWorkflowVersionList(key).subscribe(data => {
      this.workflowVersionList = data;
      this.isversionLoad = true;
      if (this.form.get('allowAllVersion').value === true) {
        this.loadNewTaskDetails();
      }
      if (fromLoad && this.form.get('latestVersion').value === true) {
        this.workflowVersionChange = true;
        this.form.get('workflowVersion').setValue('latestVersion');
      }
    });
  }

  workflowNameChange(): void {
    this.form.get('workflowVersion').valueChanges.subscribe(data => {
      const workflowName = this.form.get('workflowKey').value;
      if (data !== '' && data !== null && workflowName !== '' && workflowName !== null) {
        if (this.workflowVersionChange === false) {
          let value = data;
          if (data === 'latestVersion') {
            value = this.workflowVersionList[0].workflowVersion;
            this.form.get('latestVersion').setValue(true);
          } else {
            this.form.get('latestVersion').setValue(false);
          }
          this.loadTaskName(workflowName, value, false);
        } else {
          this.workflowVersionChange = false;
        }
      }
    });
  }

  loadTaskName(key, version, fromReceive): void {
    this.reportConfigurationService.getWorkFlowTaskName(key, version).subscribe(data => {
      if (data) {
        this.taskNameList = data;
        if (fromReceive === false) {
          const taskName = this.taskNameList.find(name => name.taskName === this.form.get('taskName').value);
          if (taskName) {
            this.sameTaskName = true;
            this.form.get('taskId').setValue(taskName.taskId);
          } else {
            this.sameTaskName = false;
            this.form.get('taskName').setValue('');
            this.form.get('taskId').setValue('');
          }
        }
      }
    });
  }

  taskNameChange() {
    this.form.get('taskId').valueChanges.subscribe(data => {
      const workflowName = this.form.get('workflowKey').value;
      const workflowVersion = this.form.get('workflowVersion').value;
      if (data !== '' && data !== null && workflowName !== '' && workflowName !== null
        && workflowVersion !== '' && workflowVersion !== null && this.sameTaskName === false) {
        this.loadFieldValuesForTask(data, false);
      }
    });
  }

  setTaskId(task, event) {
    if (task && event.isUserInput) {
      this.form.get('taskId').setValue(task.taskId);
    }
  }

  loadFieldValuesForTask(taskId, fromLoad) {
    this.reportConfigurationService.getFieldValuesForTaskName(taskId).subscribe(data => {
      if (data) {
        this.initialFieldList.forEach(field => {
          this.getDisplayColumnsFormGroup().removeControl(field.fieldId);
          this.getSumColumnsFormGroup().removeControl(field.fieldId);
          this.getAverageColumnsFormGroup().removeControl(field.fieldId);
          this.getCountColumnsFormGroup().removeControl(field.fieldId);
          this.getGroupByColumnsFormGroup().removeControl(field.fieldId);
        });
        this.initialFieldList = [];
        data.forEach(field => {
          field.fieldVO.forEach(value => {
            if (value.fieldId !== null && value.fieldId !== '' && !this.initialFieldList.includes(value)) {
              this.initialFieldList.push(value);
              this.getDisplayColumnsFormGroup().addControl(value.fieldId, (this.getFieldNameValuesForDisplayColums(value.fieldName)));
              this.getSumColumnsFormGroup().addControl(value.fieldId, (this.getFieldNameValuesForOtherColumns()));
              this.getAverageColumnsFormGroup().addControl(value.fieldId,
                (this.getFieldNameValuesForDisplayColums('Avg ' + value.fieldName)));
              this.getCountColumnsFormGroup().addControl(value.fieldId,
                (this.getFieldNameValuesForDisplayColums('Count ' + value.fieldName)));
              this.getGroupByColumnsFormGroup().addControl(value.fieldId, (this.getFieldNameValuesForOtherColumns()));
            }
          });
        });
        if (fromLoad) {
          this.form.patchValue(this.workflowReportVo.reportJson, { emitEvent: false });
        }
      }
    });
  }

  getFieldNameValuesForDisplayColums(fieldName) {
    return this.fb.group({
      fieldName: [],
      displayName: [fieldName]
    });
  }

  getFieldNameValuesForOtherColumns() {
    return this.fb.group({
      fieldName: [],
    });
  }

  addDisplayValues(event, field, control: AbstractControl) {
    const checked = event.source.checked;
    const groupBy = this.form.get('groupByColumns').get(field.fieldId).get('fieldName');
    this.emptyDisplay = false;
    if (checked) {
      control.setValue(field);
      groupBy.setValue(field);
      // this.displayColumsValue.push(field);
    } else {
      control.setValue(null);
      groupBy.setValue(null);
    }
    this.form.markAsDirty();
  }

  addCountValues(event, field, control: AbstractControl) {
    const checked = event.source.checked;
    if (checked) {
      control.setValue(field);
    } else {
      control.setValue(null);
    }
    this.form.markAsDirty();
  }

  addsumValues(event, field, control: AbstractControl) {
    const checked = event.source.checked;
    // const countColumns = this.form.get('countColumns').get(field.fieldId).get('fieldName');
    const displayColumn = this.form.get('displayColumns').get(field.fieldId).get('fieldName');
    if (checked) {
      control.setValue(field);
      displayColumn.setValue(null);
    } else {
      control.setValue(null);
    }
    this.form.markAsDirty();
  }

  getDisplayColumnsFormGroup() {
    return this.form.get('displayColumns') as FormGroup;
  }

  getSumColumnsFormGroup() {
    return this.form.get('sumColumns') as FormGroup;
  }

  getAverageColumnsFormGroup() {
    return this.form.get('averageColumns') as FormGroup;
  }

  getCountColumnsFormGroup() {
    return this.form.get('countColumns') as FormGroup;
  }

  getGroupByColumnsFormGroup() {
    return this.form.get('groupByColumns') as FormGroup;
  }

  checkDisplayValidation() {
    const value = this.getDisplayColumnsFormGroup().controls;
    let hasControl = false;
    this.initialFieldList.forEach(field => {
      const displayColumn = this.form.get('displayColumns').get(field.fieldId).get('fieldName');
      if (displayColumn.value !== null &&
        displayColumn.value !== '') {
        hasControl = true;
      }
    });
    if (hasControl) {
      this.emptyDisplay = false;
    } else {
      this.emptyDisplay = true;
    }
  }

  removeFieldControls() {
    if (this.getDisplayColumnsFormGroup()) {
      this.initialFieldList.forEach(field => {
        if (this.getDisplayColumnsFormGroup().get(field.fieldId) !== null && (this.getDisplayColumnsFormGroup().get(field.fieldId).get('fieldName').value === ''
          || this.getDisplayColumnsFormGroup().get(field.fieldId).get('fieldName').value === null)) {
          this.getDisplayColumnsFormGroup().removeControl(field.fieldId);
        }
      });
    }
    if (this.getSumColumnsFormGroup()) {
      this.initialFieldList.forEach(field => {
        if (this.getSumColumnsFormGroup().get(field.fieldId) !== null &&
          (this.getSumColumnsFormGroup().get(field.fieldId).get('fieldName').value === ''
            || this.getSumColumnsFormGroup().get(field.fieldId).get('fieldName').value === null)) {
          this.getSumColumnsFormGroup().removeControl(field.fieldId);
        }
      });
    }
    if (this.getAverageColumnsFormGroup()) {
      this.initialFieldList.forEach(field => {
        if (this.getAverageColumnsFormGroup().get(field.fieldId) != null &&
          (this.getAverageColumnsFormGroup().get(field.fieldId).get('fieldName').value === ''
            || this.getAverageColumnsFormGroup().get(field.fieldId).get('fieldName').value === null)) {
          this.getAverageColumnsFormGroup().removeControl(field.fieldId);
        }
      });
    }
    if (this.getCountColumnsFormGroup()) {
      this.initialFieldList.forEach(field => {
        if (this.getCountColumnsFormGroup().get(field.fieldId) !== null && (this.getCountColumnsFormGroup().get(field.fieldId).get('fieldName').value === ''
          || this.getCountColumnsFormGroup().get(field.fieldId).get('fieldName').value === null)) {
          this.getCountColumnsFormGroup().removeControl(field.fieldId);
        }
      });
    }
    if (this.getGroupByColumnsFormGroup()) {
      this.initialFieldList.forEach(field => {
        if (this.getGroupByColumnsFormGroup().get(field.fieldId) !== null && (this.getGroupByColumnsFormGroup().get(field.fieldId).get('fieldName').value === ''
          || this.getGroupByColumnsFormGroup().get(field.fieldId).get('fieldName').value === null)) {
          this.getGroupByColumnsFormGroup().removeControl(field.fieldId);
        }
      });
    }
  }

  setLatestVersion() {
    if (this.form.get('workflowVersion').value === 'latestVersion' && this.workflowVersionList && this.workflowVersionList.length > 0) {
      this.workflowVersionChange = true;
      this.form.get('workflowVersion').setValue(this.workflowVersionList[0].workflowVersion);
      this.form.get('latestVersion').setValue(true);
    } else {
      this.form.get('latestVersion').setValue(false);
    }
  }

  submit(userForm) {
    this.checkDisplayValidation();
    if (userForm.valid && this.emptyDisplay === false) {
      this.removeFieldControls();
      const taskName = this.form.get('taskName').value;
      const taskId = this.form.get('taskId').value;
      this.setLatestVersion();
      this.workflowVersionChange = false;
      this.enabledSumbit = true;
      this.initialFieldList = [];
      const workflowReport = new WorkflowReportVo();
      workflowReport.id = this.formId;
      workflowReport.reportName = this.form.get('reportName').value;
      workflowReport.reportType = this.form.get('reportType').value;
      workflowReport.taskName = taskName;
      workflowReport.workflowKey = this.form.get('workflowKey').value;
      workflowReport.workflowName = this.form.get('workflowName').value;
      workflowReport.workflowVersion = this.form.get('workflowVersion').value;
      workflowReport.enableReport = this.form.get('enableReport').value;
      workflowReport.taskId = taskId;
      workflowReport.workspaceId = this.workspaceService.getWorkspaceID();
      workflowReport.latestVersion = this.form.get('latestVersion').value;
      if (this.form.get('groupId').value !== null && this.form.get('groupId').value !== '') {
        workflowReport.groupId = this.form.get('groupId').value;
      }
      workflowReport.reportJson = this.form.getRawValue();
      this.reportConfigurationService.saveReport(workflowReport).subscribe(data => {
        if (data) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          // this.dataSource = new LoadMenuDetails(this.dynamicMenuService);
          // this.dataSource.loadMenuDetail(null);
          this.gridConfig.refreshGrid();
          this.reset();
        }
      },
        error => {
          this.enabledSumbit = false;
        });
    }
  }

  reset() {
    this.form.reset();
    if (this.reportStepper !== undefined) {
      this.reportStepper.reset();
    }
    this.workflowVersionList = [];
    // this.workFlowList = [];
    this.taskNameList = [];
    this.initialFieldList = [];
    this.enabledSumbit = false;
    this.workflowReportVo = '';
    this.forUpdate = false;
    this.formId = '';
  }


  // generateReportName() {
  //   this.form.get('reportName')
  //   .setValue(this.camelize(this.form.get('reportLabel').value));
  // }
}
