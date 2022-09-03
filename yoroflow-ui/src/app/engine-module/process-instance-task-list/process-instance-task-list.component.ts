import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef, Input, HostListener } from '@angular/core';
import { ProcessInstanceTaskListService } from './process-instance-task-list.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { TaskListVO } from './task-list-vo';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PaginationVO } from './pagination-vo';
import { merge } from 'rxjs';
import { TaskPropertyComponent } from '../../designer-module/task-property/task-property.component';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ProcessInstanceDialogComponentComponent } from '../process-instance-dialog-component/process-instance-dialog-component.component';
import { OpenFormDialogBoxComponent } from '../open-form-dialog-box/open-form-dialog-box.component';
import { OrgPrefrenceService } from '../../shared-module/services/org-prefrence.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';


@Component({
  selector: 'app-process-instance-task-list',
  templateUrl: './process-instance-task-list.component.html',
  styleUrls: ['./process-instance-task-list.component.scss']
})
export class ProcessInstanceTaskListComponent implements OnInit {
  id: any;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  taskList: TaskListVO[] = [];
  // tslint:disable-next-line: max-line-length
  displayedColumns: string[] = ['processDefinitionTask.taskName', 'processDefinitionTask.taskType', 'startTime', 'endTime', 'updatedBy', 'time'];
  paginationVO = new PaginationVO();
  listLength: string;
  status: string;
  form: FormGroup;
  filterDataType = {};
  filterColumns = [
    { value: 'taskName', fieldId: 'col2', fieldName: 'Task Name', datatype: 'string' },
    { value: 'taskType', fieldId: 'col3', fieldName: 'Task Type', datatype: 'string' },
    { value: 'startTime', fieldId: 'col4', fieldName: 'Start Date', datatype: 'date' },
    { value: 'endTime', fieldId: 'col5', fieldName: 'Updated Date', datatype: 'date' },
    { value: 'time', fieldId: 'col8', fieldName: 'Total Time Taken', datatype: 'number' },
    { value: 'updatedBy', fieldId: 'col7', fieldName: 'Task Resolved By', datatype: 'string' }
  ];
  dataType = {
    number: [{ value: 'eq', description: 'equals' },
    { value: 'gt', description: 'greater than' },
    { value: 'ge', description: 'greater than or equal to' },
    { value: 'lt', description: 'less than' },
    { value: 'le', description: 'less than or equal to' },
    ],
    string: [
      { value: 'eq', description: 'equals' },
      { value: 'bw', description: 'begins with' },
      { value: 'ew', description: 'ends with' },
      { value: 'cn', description: 'contains' },
    ]
  };
  defaultPageSize: number;
  color = true;
  expandEnabled: boolean = true;
  contentAnimation: boolean = true;
  dotAnimation: boolean = true;
  isMobile: boolean;
  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef,
    private processInstanceTaskListService: ProcessInstanceTaskListService,
    private dialog: MatDialog, private workspaceService: WorkspaceService) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }
  ngOnInit(): void {
    this.color = true;
    if (window.innerWidth <= 850) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id');
      this.status = params.get('status');
    });
    this.initializeFilterForm();
    this.loadInstanceTaskList();
  }
  onHeaderClick(event) {
    if (!this.expandEnabled) {
      event.stopPropagation();
    }
  }

  onDotClick(event) {
    if (!this.expandEnabled) {
      event.stopPropagation();
    }
  }
  getPagination() {

    this.paginationVO.columnName = 'startTime';
    this.paginationVO.index = 0;
    this.paginationVO.size = 50;
    this.paginationVO.processInstanceId = this.id;
    return this.paginationVO;
  }
  pageEvent(event) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.loadInstanceTaskList();
  }
  // tslint:disable-next-line: use-lifecycle-interface


  loadInstanceTaskList() {
    this.processInstanceTaskListService.getProcessInstanceTaskList(this.getPagination()).subscribe(data => {
      this.taskList = data.data;
      this.listLength = data.totalRecords;
    });
  }

  openTaskInfo(element) {
    this.processInstanceTaskListService.getPropertyValue(element.col1).subscribe(data => {
      if (data.taskType === 'USER_TASK' || data.taskType === 'APPROVAL_TASK'
        || (data.taskType === 'START_TASK' && data.startType === 'manual')) {
        this.openForm(data);
      } else if (data.taskType === 'DECISION_TASK' || data.taskType === 'COMPUTE_TASK'
        || (data.taskType === 'START_TASK' && data.startType !== 'manual') || data.taskType === 'DB_TASK'
        || data.taskType === 'DELAY_TIMER' || data.taskType === 'SMS_TASK' || data.taskType === 'WEB_SERVICE_TASK') {
        const taskPropertyDialogBox = this.dialog.open(ProcessInstanceDialogComponentComponent, {
          disableClose: true,
          width: '800px',
          data: data,
          panelClass: 'task-property-dialogBox',
          autoFocus: false
        });
      }
    });
  }

  openForm(task) {
    const yoroflowVO = {
      isWorkflow: true,
      workflowId: task.processInstanceId,
      workflowTaskId: task.processInstanceTaskId,
      formId: task.formId,
      initialValues: null,
      isCustomForm: task.isCustomForm,
      status: 'COMPLETED',
      version: task.version,
      approvalStatus: task.approvalStatus
    };
    const taskPropertyDialogBox = this.dialog.open(OpenFormDialogBoxComponent, {
      disableClose: true,
      data: yoroflowVO,
      autoFocus: false,
      maxWidth: '96vw',
      width: '100vw',
      height: '94%',
      panelClass: 'full-screen-modal'
    });
  }

  onClick() {
    if (this.status === 'completed') {
      this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/process-instance-completed-list']);
    } else if (this.status === 'in_process') {
      this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/process-instance-running-list']);
    } else {
      this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/process-instance-failed-list']);
    }
  }
  initializeFilterForm() {
    this.form = this.fb.group({
      filters: this.fb.array([
        this.addFilter()
      ])
    });
  }

  addFilter(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      dataType: ['string'],
      totalTimeFilterValue: ['']
    });
  }

  getFiltersFormArray() {
    return (this.form.get('filters') as FormArray).controls;
  }

  addAnotherFilter(event, i: number) {
    (this.form.get('filters') as FormArray).push(this.addFilter());
  }

  removeThisService(i: number) {
    (this.form.get('filters') as FormArray).removeAt(i);
  }

  searchFilter(userForm) {
    this.paginationVO.index = 0;
    this.paginator.pageIndex = 0;
    const forms = (this.form.get('filters') as FormArray);
    for (let i = 0; i < forms.length; i++) {
      this.checkValidation(i);
    }

    if (userForm.valid && forms.valid) {
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.loadInstanceTaskList();
    }
  }

  checkValidation(index: number) {
    const i = '' + index;
    const form = (this.form.get('filters') as FormArray).get(i);
    const formRemove = (this.form.get('filters') as FormArray);
    const filterIdColumnValue = form.get('filterIdColumnValue');
    const operators = form.get('operators');
    const filterIdColumn = form.get('filterIdColumn');
    filterIdColumnValue.markAllAsTouched();
    operators.markAllAsTouched();
    filterIdColumn.markAllAsTouched();
    if (!filterIdColumnValue.value && !operators.value && !filterIdColumn.value && index !== 0) {
      formRemove.removeAt(index);
    } else if (!filterIdColumnValue.value && !operators.value && !filterIdColumn.value && index === 0) {
      operators.setErrors({ operatorsRequired: true });
      filterIdColumn.setErrors({ filterIdColumnRequired: true });
      filterIdColumnValue.setErrors({ filterIdColumnValueRequired: true });
    }
    if (!filterIdColumn.value) {
      filterIdColumn.setErrors({ filterIdColumnRequired: true });
    }
    if (!operators.value) {
      operators.setErrors({ operatorsRequired: true });
    }
    if (!filterIdColumnValue.value) {
      filterIdColumnValue.setErrors({ filterIdColumnValueRequired: true });
    }
    if (filterIdColumn.value && operators.value && filterIdColumnValue.value) {
      operators.setErrors(null);
      filterIdColumn.setErrors(null);
      filterIdColumnValue.setErrors(null);
    }
  }

  removeFilter() {
    const forms = (this.form.get('filters') as FormArray);
    if (forms.length > 1) {
      for (let i = 0; i < forms.length; i++) {
        forms.removeAt(i);
      }
    }
  }

  reset() {
    this.form.reset();
    this.removeFilter();
    const forms = (this.form.get('filters') as FormArray);
    if (forms.length > 1) {
      this.removeFilter();
    }
    this.paginationVO.index = 0;
    this.paginator.pageIndex = 0;
    this.paginationVO.filterValue = [];
    this.loadInstanceTaskList();
  }

  getDataType(i: any, headerId: any) {
    const index = '' + i;
    const form = (this.form.get('filters') as FormArray).get(index);
    const dataType = form.get('dataType');
    this.filterColumns.forEach(filter => {
      if (filter.fieldName === headerId) {
        dataType.setValue(filter.datatype);
        if (filter.datatype === 'string') {
          this.filterDataType[i] = 'string';
        } else if (filter.datatype === 'long' ||
          filter.datatype === 'number' || filter.datatype === 'date') {
          this.filterDataType[i] = 'number';
        }
      }
    });
  }
  totalTime(i, event) {
    const index = '' + i;
    const form = (this.form.get('filters') as FormArray).get(index);
    const filterIdColumnValue = form.get('filterIdColumnValue');
    const totalTimeFilterValue = form.get('totalTimeFilterValue');
    if (filterIdColumnValue.value !== null || filterIdColumnValue.value !== '') {
      totalTimeFilterValue.setValue(filterIdColumnValue.value + ' ' + event);
    }
  }
}
