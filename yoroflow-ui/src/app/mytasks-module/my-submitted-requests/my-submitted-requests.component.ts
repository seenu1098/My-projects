import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { group } from 'console';
import { merge } from 'rxjs';
import { HeaderVO } from 'src/app/creation-module/summary-report/summary-report-model';
import { GroupVO } from 'src/app/designer-module/task-property/model/group-vo';
import { OpenFormDialogBoxComponent } from 'src/app/engine-module/open-form-dialog-box/open-form-dialog-box.component';
import { Paginator } from 'src/app/shared-module/paginator/paginatorVO';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { TaskboardFormDetailsComponent } from 'src/app/taskboard-module/taskboard-form-details/taskboard-form-details.component';
import { UserVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { MyRequestService } from '../my-requests/my-request.service';
import { MyTaskService } from '../mytasks/my-task.service';
import { LaunchTaskListVo } from './submitted-task-model';

@Component({
  selector: 'app-my-submitted-requests',
  templateUrl: './my-submitted-requests.component.html',
  styleUrls: ['./my-submitted-requests.component.scss']
})
export class MySubmittedRequestsComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('menuTrigger') public inputForWorkflow: any;
  sortHeader: Sort;

  constructor(private taskService: MyTaskService, private workspaceService: WorkspaceService,
              private dialog: MatDialog, private taskboardService: TaskBoardService, private changeDetectorRef: ChangeDetectorRef,
              private fb: FormBuilder, private myRequestService: MyRequestService) { }

  dataSource: any;
  taskboardDataSource: any;
  columnHeaders: HeaderVO[] = [];
  displayedColumns: string[] = [];
  title: string;
  paginationVO = new PaginationVO();
  paginators = new Paginator();
  length: any;
  groupList: GroupVO[] = [];
  usersList: UserVO[] = [];
  form: FormGroup;
  columnId: string;
  filterDatatype: string;
  selectedItem: string[] = [];
  filterCountForDynamic: any;
  isDateField: boolean;
  filterOperator: string;
  showSubmittedTask = false;
  isWorkspace = false;
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
    ],
    boolean: [
      { value: 'tr', description: 'true' },
      { value: 'fa', description: 'false' },
    ]
  };

  ngOnInit(): void {
    this.loadData();
    const pagination = new PaginationVO();
    pagination.index = 0;
    pagination.size = 10;
    pagination.direction = 'desc';
    pagination.columnName = 'submittedDate';
    this.paginationVO = pagination;
    this.sort.direction = this.paginationVO.direction as SortDirection;
    this.sort.active = this.paginationVO.columnName;
    this.isWorkspace = this.taskService.isWorkspace;
    this.loadSubmittedTask();
    this.form = this.fb.group({
      filterValue: ['', [Validators.required]],
      operator: ['', [Validators.required]],
      filters: this.fb.array([
        this.addFilter()
      ])
    });
    this.myRequestService.submitReqEmitter.subscribe(data => {
      this.loadSubmittedTask();
    });
    this.allWorkspaceChange();
  }

  addFilter(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      filterDataType: ['']
    });
  }

  allWorkspaceChange(): void {
    this.taskService.isWorkspaceEmit.subscribe(data => {
      this.isWorkspace = data;
      this.loadSubmittedTask();
    });
  }

  loadSubmittedTask(): void {
    this.paginationVO.allWorkspace = this.isWorkspace;
    this.taskService.getSubmittedTasks(this.paginationVO, this.workspaceService.getWorkspaceID()).subscribe(data => {
      this.dataSource = data.taskVOList;
      this.length = data.totalRecords;
      this.showSubmittedTask = true;
    });
  }

  loadData(): void {
    const header1 = new HeaderVO();
    header1.headerId = 'reqName';
    header1.headerName = 'Request Name';
    const header2 = new HeaderVO();
    header2.headerId = 'submittedDate';
    header2.headerName = 'Submitted Date';
    const header3 = new HeaderVO();
    header3.headerId = 'assignedTo';
    header3.headerName = 'Assigned To';
    const header4 = new HeaderVO();
    header4.headerId = 'status';
    header4.headerName = 'Status';
    const header5 = new HeaderVO();
    header5.headerId = 'action';
    header5.headerName = 'Action';
    this.columnHeaders.push(header1);
    this.columnHeaders.push(header2);
    this.columnHeaders.push(header3);
    this.columnHeaders.push(header4);
    this.columnHeaders.push(header5);
    this.displayedColumns = ['reqName', 'submittedDate', 'assignedTo', 'status', 'action'];
  }

  ngAfterViewInit() {
    merge(this.sort.sortChange).subscribe(() => this.getPaginationInfo());
    this.changeDetectorRef.detectChanges();
  }

  getPaginationInfo(): void {
    this.paginationVO.columnName = this.sort.active;
    this.paginationVO.direction = this.sort.direction;
    this.loadSubmittedTask();
  }

  pageEvent(paginator: Paginator): void {
    const pagination = new PaginationVO();
    pagination.index = paginator.index;
    pagination.size = paginator.pageSize;
    pagination.direction = this.paginationVO.direction;
    pagination.columnName = this.paginationVO.columnName;
    pagination.filterValue = this.paginationVO.filterValue;
    this.paginationVO = pagination;
    this.loadSubmittedTask();
  }

  openTask(taskVO: LaunchTaskListVo): void {
    if (taskVO.taskId) {
      this.openDialogForm(taskVO);
    } else {
      this.openTaskboardTask(taskVO);
    }
  }

  openDialogForm(taskVO: LaunchTaskListVo): void {
    if (taskVO.taskId != null) {
      this.taskService.getTaskInfo(taskVO.taskId).subscribe(task => {
        if (task) {
          const yoroflowVO = {
            isWorkflow: true,
            workflowId: task.processInstanceId,
            workflowTaskId: task.processInstanceTaskId,
            formId: task.formId,
            isApproveRejectForm: task.isApprovalForm,
            isSendBack: task.isSendBack,
            isReject: task.isReject,
            initialValues: task.initialValues,
            isCustomForm: task.isCustomForm,
            status: 'COMPLETED',
            version: task.version,
            isInitialValues: true,
            taskData: taskVO.jsonData
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
          taskPropertyDialogBox.afterClosed().subscribe(taskData => {
          });
        }
      });
    }
  }

  openTaskboardTask(taskVO: LaunchTaskListVo): void {
    const dialog = this.dialog.open(TaskboardFormDetailsComponent, {
      disableClose: false,
      width: '95%',
      maxWidth: '95%',
      height: '95%',
      autoFocus: false,
      data: {
        taskId: taskVO.taskboardTaskId,
        formId: taskVO.formId,
        version: taskVO.version,
        taskData: taskVO.jsonData,
        value: 'loadTask'
      }
    });
    dialog.afterClosed().subscribe(data => { });
  }

  loadUserAndGroupList() {
    this.taskboardService.getUserGroupList().subscribe((data) => {
      this.groupList = data;
    });
    this.taskboardService.getUsersList().subscribe((data) => {
      this.usersList = data;
    });
  }

  getAssigneeList(taskVO: LaunchTaskListVo): any[] {
    if (taskVO.taskId) {
      const array: any[] = [];
      taskVO.assignedToUser.forEach(u => {
        const user = this.usersList.find(us => us.userId === u);
        if (user) {
          array.push(user);
        }
      });
      taskVO.assignedToTeam.forEach(g => {
        const team = this.groupList.find(gr => gr.groupId === g);
        if (team) {
          array.push(team);
        }
      });
      return array;
    } else {
      const array: any[] = [];
      taskVO.assignedToUser.forEach(u => {
        const user = this.usersList.find(us => us.userId === u);
        if (user) {
          array.push(user);
        }
      });
      return array;
    }
  }

  getUserFirstAndLastNamePrefix(object: any): string {
    if (object.groupName) {
      let name = '';
      const array = object.groupName.split(' ');
      if (array[0] && array[1]) {
        name = array[0].charAt(0).toUpperCase() + array[1].charAt(0).toUpperCase();
      } else {
        name = array[0].charAt(0).toUpperCase();
      }
      return name;
    } else if (object.userName) {
      let name = '';
      const array = object.userName.split(' ');
      if (array[0] && array[1]) {
        name = array[0].charAt(0).toUpperCase() + array[1].charAt(0).toUpperCase();
      } else {
        name = array[0].charAt(0).toUpperCase();
      }
      return name;
    }
  }

  getRemainingUsersCount(usersList): number {
    if (usersList.length > 4) {
      return usersList.length - 4;
    }
  }

  filterApply() {
    let setFilter = false;
    this.addValidations();
    this.form.get('filterValue').markAsTouched();
    this.form.get('operator').markAsTouched();
    if ((this.form.get('filters') as FormArray).length === 0) {
      (this.form.get('filters') as FormArray).push(this.addFilter());
    }
    for (let i = 0; i < (this.form.get('filters') as FormArray).length; i++) {
      if (this.form.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        this.form.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        this.form.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.form.get('filterValue').value);
        this.form.get('filters').get('' + i).get('operators').setValue(this.form.get('operator').value);
        this.form.get('filters').get('' + i).get('filterDataType').setValue(this.filterDatatype);
      } else {
        let array = [];
        array = (this.form.get('filters') as FormArray).value;
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCountForDynamic++;
          if (this.filterCountForDynamic >= 1) {
            (this.form.get('filters') as FormArray).push(this.addFilter());
          }
          const length = (this.form.get('filters') as FormArray).length - 1;
          this.form.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          this.form.get('filters').get('' + length).get('filterIdColumnValue').setValue(this.form.get('filterValue').value);
          this.form.get('filters').get('' + length).get('operators').setValue(this.form.get('operator').value);
          this.form.get('filters').get('' + length).get('filterDataType').setValue(this.filterDatatype);
        }
      }
    }
    if (this.form.valid) {
      const index = this.selectedItem.findIndex(t => t === this.columnId);
      if (index === -1) {
        this.selectedItem.push(this.columnId);
      }
      this.paginationVO.index = 0;
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.removeEmptyArray();
      this.loadSubmittedTask();
      this.removeValidations();
      this.inputForWorkflow.closeMenu();
    }
  }

  removeEmptyArray() {
    for (let i = 0; i < this.paginationVO.filterValue.length; i++) {
      if (this.paginationVO.filterValue[i].filterIdColumn === '' &&
        this.paginationVO.filterValue[i].filterIdColumnValue === '' &&
        this.paginationVO.filterValue[i].operators === '') {
        this.paginationVO.filterValue.splice(i, 1);
      }
    }
  }

  addValidations(): void {
    this.form.get('filterValue').setValidators([Validators.required]);
    this.form.get('operator').setValidators([Validators.required]);
    this.form.get('filterValue').updateValueAndValidity();
    this.form.get('operator').updateValueAndValidity();
  }

  removeValidations(): void {
    this.form.get('filterValue').setValidators(null);
    this.form.get('operator').setValidators(null);
    this.form.get('filterValue').updateValueAndValidity();
    this.form.get('operator').updateValueAndValidity();
  }

  clearFilter(): void {
    const index = this.selectedItem.findIndex(t => t === this.columnId);
    if (index !== -1) {
      this.selectedItem.splice(index, 1);
    }
    if ((this.form.get('filterValue').value !== null
      || this.form.get('filterValue').value !== undefined ||
      this.form.get('filterValue').value !== '')
      && (this.form.get('operator').value !== null || this.form.get('operator').value !== undefined || this.form.get('operator').value !== '')) {
      this.form.get('filterValue').setValue(null);
      this.form.get('operator').setValue(null);
      this.filterCountForDynamic--;
      for (let i = 0; i < (this.form.get('filters') as FormArray).length; i++) {
        if (this.form.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.form.get('filters') as FormArray).removeAt(i);
          this.inputForWorkflow.closeMenu();
          const form = (this.form.get('filters') as FormArray);
          this.paginationVO.filterValue = form.value;
          this.removeEmptyArray();
          this.loadSubmittedTask();
          this.emptyworkPaginator();
          this.form.markAsUntouched();
        }
      }
    }
  }

  emptyworkPaginator(): void {
    this.length = false;
  }

  isSelectedColumn(columnId: string): boolean {
    const returnValue = this.selectedItem.some(c => c === columnId);
    return returnValue;
  }

  setDataTypeForWorkflow(columnId: string): void {
    if (columnId === 'submittedDate') {
      this.isDateField = true;
      this.filterOperator = 'number';
    } else {
      this.isDateField = false;
      this.filterOperator = 'string';
    }
    this.columnId = columnId;
  }
}
