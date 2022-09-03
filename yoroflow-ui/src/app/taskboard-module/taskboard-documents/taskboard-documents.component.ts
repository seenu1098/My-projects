import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PaginationVO, Paginator } from './attachments-vo';
import { DocumentsService } from './documents.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { BoardNameVo, PaginatorForTaskboard } from '../../engine-module/landing-page/landing-page-vo';
import { Sort } from '@angular/material/sort';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { OrgPrefrenceService } from 'src/app/shared-module/services/org-prefrence.service';
import { TaskboardTaskVO, UserVO } from '../taskboard-form-details/taskboard-task-vo';
import { TaskboardColumnMapVO, StatusList } from '../taskboard-configuration/taskboard.model';
import { TaskBoardService } from '../taskboard-configuration/taskboard.service';
import { TaskboardFormDetailsComponent } from '../taskboard-form-details/taskboard-form-details.component';
import { GroupVO } from 'src/app/designer-module/task-property/model/group-vo';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-taskboard-documents',
  templateUrl: './taskboard-documents.component.html',
  styleUrls: ['./taskboard-documents.component.scss']
})
export class TaskboarddocumentsComponent implements OnInit {
  public config: PerfectScrollbarConfigInterface = {};
  attachmentVO = new PaginationVO();
  selectedTaskIndex: any;
  taskboardForm: FormGroup;
  displayedColumns: string[] = ['taskboardName', 'task_id', 'file_name', 'file_type', 'created_on', 'created_by', 'actions'];
  attachments: any;
  defaultPageSize = 10;
  taskboardLength: any;
  paginatorForTaskboard = new PaginatorForTaskboard();
  paginators = new Paginator();
  sortForAttachments: Sort;
  defaultColumn = 'created_on';
  @Input('defaultSortDirection')
  defaultSortDirection = 'desc';
  filterOperator: string;
  type = 'text';
  isDateField = false;
  columnId: any;
  selectedItem: any;
  filterDatatype: any;
  filterCountForTaskboard = 0;
  boardNames: any;
  boardNamesVO: BoardNameVo[] = [];
  boardList: any;
  isLength = false;
  @Input('defaultColumn')
  defaultColumnForTaskboard = 'created_on';
  taskboardTaskVOList: TaskboardTaskVO[] = [];
  taskIdFromUrl: any;
  taskboardColumns: any[] = [];
  selectedColumn: string;
  selectedColumnIndex: number;
  taskboardTaskVO = new TaskboardTaskVO();
  mappedTask: any;
  taskBoardTaskVO = new TaskboardTaskVO();
  groupList: GroupVO[] = [];
  usersList: UserVO[] = [];
  taskStatusType: any;

  viewTaskVO: any;
  taskboardColumnMapVO: TaskboardColumnMapVO[] = [];

  constructor(private attachmentsservice: DocumentsService, private dialog: MatDialog,
    private taskboardService: TaskBoardService, private fb: FormBuilder, private orgPrfrenceService: OrgPrefrenceService) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('menuTrigger1') menu1;
  @ViewChild('menuTrigger2') menu2;
  @ViewChild('menuTrigger3') menu3;
  @ViewChild('menuTrigger4') menu4;
  @ViewChild('menuTrigger5') menu5;
  @ViewChild('menuTrigger6') menu6;
  isPaginator = false;
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
    assigned_to: [
      { value: 'eq', description: 'equals' },
      { value: 'ne', description: 'not equals' },
      { value: 'cn', description: 'contains' }
    ]
  };
  ngOnInit(): void {
    this.initializeFilterFormTaskboard();
    this.loadBoardNames();
    this.searchBoardValueChanges();
    this.getUserAndGroupList();
    this.loadAttachments();
  }
  loadAttachments() {
    this.attachmentsservice.getAttachments(this.getPaginationForTaskboard()).subscribe(res => {
      this.attachments = res.attachmentsList;
      this.taskboardLength = res.totalRecords;
      if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
        this.isPaginator = true;
        this.isLength = true;
      }
      else {
        this.isPaginator = false;
        this.isLength = false;
      }
    })
  }
  loadBoardNames() {
    this.attachmentsservice.getBoardNames().subscribe(names => {
      this.boardNamesVO = names.boardNameList;
      this.boardList = names.boardNameList;
    })
  }
  initializeFilterFormTaskboard() {
    this.taskboardForm = this.fb.group({
      filterValue: [''],
      operator: [''],
      search: [''],
      searchForAssignedToTaskboard: [''],
      searchForStatus: [''],
      searchForSubStatus: [''],
      filters: this.fb.array([
        this.addFilterForTaskboard()
      ])
    });
  }
  addFilterForTaskboard(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      dataType: ['string'],
    });
  }
  pageEvent(event) {
    this.paginators = event;
    this.loadAttachments();

  }
  emptyPaginator() {
    this.isPaginator = false;
    this.isLength = false;
  }
  getPaginationForTaskboard() {
    this.attachmentVO.index = this.paginators.index;
    this.attachmentVO.size = this.paginators.pageSize;
    if (this.sortForAttachments && this.sortForAttachments.active) {
      this.attachmentVO.columnName = this.sortForAttachments.active;
    } else {
      this.attachmentVO.columnName = this.defaultColumn;
    }
    if (this.sortForAttachments === undefined || this.sortForAttachments.direction === '' || this.sortForAttachments.direction === undefined || this.sortForAttachments.direction === null) {
      this.attachmentVO.direction = this.defaultSortDirection;
    } else {
      this.attachmentVO.direction = this.sortForAttachments.direction;
    }
    if (this.paginators.index > 0) {
      this.attachmentVO.index = this.paginators.index;
    } else {
      this.attachmentVO.index = 0;
    }
    if (this.paginators) {
      this.attachmentVO.index = this.paginators.index;

      this.attachmentVO.size = this.paginators.pageSize;
    } else {
      this.attachmentVO.index = 0;

      this.attachmentVO.size = this.defaultPageSize;
    }
    return this.attachmentVO;
  }
  sortData(sort: Sort) {
    this.sortForAttachments = sort;
    this.attachmentVO = this.getPaginationForTaskboard();
    this.attachmentsservice.getAttachments(this.attachmentVO).subscribe(result => {
      if (result && result.attachmentsList && result.attachmentsList.length > 0) {
        this.attachments = result.attachmentsList;
        this.taskboardLength = result.totalRecords;
        if (this.taskboardLength !== 0 && this.taskboardLength !== '0') {
          this.isPaginator = true;
          this.isLength = true;
        }
        else {
          this.isPaginator = false;
          this.isLength = false;
        }
      } else {
        this.attachments = [];
        this.taskboardLength = 0;
      }
    })
  }
  view(files) {
    this.attachmentsservice.downloadAttachedFile(files.attachmentsId).subscribe(data => {
      const file = new Blob([data], { type: data.type });
      FileSaver.saveAs(file, files.fileName);
    });
  }
  download(files) {
    this.attachmentsservice.downloadAttachedFile(files.attachmentsId).subscribe(data => {
      const file = new Blob([data], { type: data.type });
      FileSaver.saveAs(file, files.fileName);
    });
  }
  setDataTypeForTaskboard(headerDetails, datatype) {
    if (headerDetails === 'taskboardName' || headerDetails === 'task_id' || headerDetails === 'file_name' || headerDetails === 'file_type' || headerDetails === 'created_by') {
      this.filterOperator = 'string';
      this.isDateField = false;
      this.type = 'text';
    } else if (headerDetails === 'created_on') {
      this.filterOperator = 'number';
      this.isDateField = true;
      this.type = null;
    }
    this.filterDatatype = datatype;
    this.columnId = headerDetails;
    let form = (this.taskboardForm.get('filters') as FormArray);
    this.taskboardForm.get('filterValue').setValue(null);
    this.taskboardForm.get('operator').setValue(null);
    for (let i = 0; i < form.length; i++) {
      if (form.get('' + i).get('filterIdColumn').value && form.get('' + i).get('filterIdColumn').value === this.columnId) {
        this.taskboardForm.get('filterValue').setValue(form.get('' + i).get('filterIdColumnValue').value);
        this.taskboardForm.get('operator').setValue(form.get('' + i).get('operators').value);
        this.taskboardForm.get('filterValue').setValidators(null);
        this.taskboardForm.get('filterValue').setErrors(null);
        this.taskboardForm.get('operator').setErrors(null);
      }
    }
  }
  changeFilterValue(event, filterValue, columnName, datatype, checked) {
    this.filterOperator = 'string';
    this.columnId = columnName;
    this.setFilterFormValues(filterValue, datatype);
    if (event.checked === true) {
      this.selectedItem = this.columnId;
      checked = true;
      this.filterForBoardTrue();
    }
    if (event.checked === false) {
      this.selectedItem = ''
      checked = false;
      this.filterForBoardFalse();
    }
  }
  filterForBoardTrue() {
    let array = [];
    if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
      this.filterCountForTaskboard++;
      if (this.filterCountForTaskboard >= 1) {
        (this.taskboardForm.get('filters') as FormArray).push(this.addFilterForTaskboard());
      }
      const index = (this.taskboardForm.get('filters') as FormArray).length - 1;
      this.taskboardForm.get('filters').get('' + index).get('filterIdColumn').setValue(this.columnId);
      this.taskboardForm.get('filters').get('' + index).get('filterIdColumnValue').setValue(this.taskboardForm.get('filterValue').value);
      this.taskboardForm.get('filters').get('' + index).get('operators').setValue(this.taskboardForm.get('operator').value);
      this.taskboardForm.get('filters').get('' + index).get('dataType').setValue(this.filterDatatype);
    }
    if (this.taskboardForm.valid) {
      this.menu1.closeMenu();
      this.menu2.closeMenu();
      this.menu3.closeMenu();
      this.menu4.closeMenu();
      this.menu5.closeMenu();
      this.menu6.closeMenu();
      const form = (this.taskboardForm.get('filters') as FormArray);
      this.attachmentVO.filterValue = form.value;
      this.paginators.index = 0;
      this.loadAttachments();
      this.removeValidations();
      this.emptyPaginator();
    }
  }


  filterForBoardFalse() {
    this.filterCountForTaskboard--;
    for (let i = 0; i < (this.taskboardForm.get('filters') as FormArray).length; i++) {
      if (this.taskboardForm.get('filters').get('' + i).get('filterIdColumnValue').value === this.taskboardForm.get('filterValue').value) {
        (this.taskboardForm.get('filters') as FormArray).removeAt(i);
        this.menu1.closeMenu();
        this.menu2.closeMenu();
        this.menu3.closeMenu();
        this.menu4.closeMenu();
        this.menu5.closeMenu();
        this.menu6.closeMenu(); this.attachmentVO.index = 0;
        const form = (this.taskboardForm.get('filters') as FormArray);
        this.attachmentVO.filterValue = form.value;
        this.paginators.index = 0;
        this.loadAttachments();
        this.removeValidations();
        this.emptyPaginator();
      }
    }
  }

  setFilterFormValues(filterValue, datatype) {
    this.filterDatatype = datatype;
    let form = (this.taskboardForm.get('filters') as FormArray);
    this.taskboardForm.get('filterValue').setValue(null);
    this.taskboardForm.get('operator').setValue(null);
    for (let i = 0; i < form.length; i++) {
      this.taskboardForm.get('filterValue').setValue(filterValue);
      this.taskboardForm.get('operator').setValue('eq');
      this.taskboardForm.get('filterValue').setValidators(null);
      this.taskboardForm.get('filterValue').setErrors(null);
      this.taskboardForm.get('operator').setErrors(null);
    }
  }


  filterApplyForTaskboard() {
    this.selectedItem = this.columnId
    let setFilter = false;
    this.addValidations();
    for (let i = 0; i < (this.taskboardForm.get('filters') as FormArray).length; i++) {
      if (this.taskboardForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        this.taskboardForm.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        this.taskboardForm.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.taskboardForm.get('filterValue').value);
        this.taskboardForm.get('filters').get('' + i).get('operators').setValue(this.taskboardForm.get('operator').value);
        this.taskboardForm.get('filters').get('' + i).get('dataType').setValue(this.filterDatatype);
      } else {
        let array = [];
        array.push((this.taskboardForm.get('filters') as FormArray).value);
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCountForTaskboard++;
          if (this.filterCountForTaskboard >= 1) {
            (this.taskboardForm.get('filters') as FormArray).push(this.addFilterForTaskboard());
          }
          let length = (this.taskboardForm.get('filters') as FormArray).length - 1;
          this.taskboardForm.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          this.taskboardForm.get('filters').get('' + length).get('filterIdColumnValue').setValue(this.taskboardForm.get('filterValue').value);
          this.taskboardForm.get('filters').get('' + length).get('operators').setValue(this.taskboardForm.get('operator').value);
          this.taskboardForm.get('filters').get('' + length).get('dataType').setValue(this.filterDatatype);
        }
      }
    }
    this.attachmentVO.index = 0;
    if (this.taskboardForm.valid) {
      this.menu1.closeMenu();
      this.menu2.closeMenu();
      this.menu3.closeMenu();
      this.menu4.closeMenu();
      this.menu5.closeMenu();
      this.menu6.closeMenu();
      const form = (this.taskboardForm.get('filters') as FormArray);
      this.attachmentVO.filterValue = form.value;
      this.paginators.index = 0;
      this.loadAttachments();
      this.removeValidations();
      this.emptyPaginator();
    }
  }
  addValidations() {
    this.taskboardForm.get('filterValue').setValidators([Validators.required]);
    this.taskboardForm.get('operator').setValidators([Validators.required]);
    this.taskboardForm.get('filterValue').updateValueAndValidity();
    this.taskboardForm.get('operator').updateValueAndValidity();
  }

  removeValidations() {
    this.taskboardForm.get('filterValue').setValidators(null);
    this.taskboardForm.get('operator').setValidators(null);
    this.taskboardForm.get('filterValue').updateValueAndValidity();
    this.taskboardForm.get('operator').updateValueAndValidity();
  }


  clearFilterForTaskboard() {
    this.selectedItem = "";
    if ((this.taskboardForm.get('filterValue').value !== null || this.taskboardForm.get('filterValue').value !== undefined || this.taskboardForm.get('filterValue').value !== '')
      && (this.taskboardForm.get('operator').value !== null || this.taskboardForm.get('operator').value !== undefined || this.taskboardForm.get('operator').value !== '')) {
      this.taskboardForm.get('filterValue').setValue(null);
      this.taskboardForm.get('operator').setValue(null);
      for (let i = 0; i < (this.taskboardForm.get('filters') as FormArray).length; i++) {
        if (this.taskboardForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.taskboardForm.get('filters') as FormArray).removeAt(i);
          this.menu1.closeMenu();
          this.menu2.closeMenu();
          this.menu3.closeMenu();
          this.menu4.closeMenu();
          this.menu5.closeMenu();
          this.menu6.closeMenu(); this.attachmentVO.index = 0;
          const form = (this.taskboardForm.get('filters') as FormArray);
          this.attachmentVO.filterValue = form.value;
          this.loadAttachments();
          this.emptyPaginator();
        }
      }
    }
  }
  clearAllFilterTaskboard() {
    this.selectedItem = '';
    if ((this.taskboardForm.get('filters') as FormArray).length > 1
      || ((this.taskboardForm.get('filters') as FormArray).length === 1 &&
        this.taskboardForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== null
        && this.taskboardForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== undefined
        && this.taskboardForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== '')) {
      const length = (this.taskboardForm.get('filters') as FormArray).length;
      for (let i = 0; i < length; i++) {
        (this.taskboardForm.get('filters') as FormArray).removeAt(0);
      }
      this.attachmentVO.index = 0;
      const form = (this.taskboardForm.get('filters') as FormArray);
      this.attachmentVO.filterValue = form.value;
      this.loadAttachments();
      this.uncheckAllTaskboard();
      this.loadBoardNames();
      this.emptyPaginator();
      (this.taskboardForm.get('filters') as FormArray).push(this.addFilterForTaskboard());
      this.filterCountForTaskboard = 0;
    }
  }
  uncheckAllTaskboard() {
    this.boardNamesVO.forEach(element => {
      element.isSelected = false;
    });
  }
  searchBoardValueChanges(): void {
    this.taskboardForm.get('search').valueChanges.subscribe(data => {
      if (data !== undefined && data !== null && data !== '') {
        const filterData = data.toLowerCase();
        let filterList: any[] = [];
        for (let i = 0; i < this.boardNamesVO.length; i++) {
          const boardName = this.boardNamesVO[i].boardName.toLowerCase();
          if (boardName.includes(filterData)) {
            filterList.push(this.boardNamesVO[i]);
          }
        }
        this.boardNamesVO = filterList;
      } else {
        this.boardNamesVO = this.boardList;
      }
    }); ``
  }
  viewTaskboardTask(taskboardId, taskId) {
    this.taskboardTaskVOList = [];
    this.taskIdFromUrl = taskId;
    this.taskboardService.getAllTaskboardDetails(taskboardId).subscribe(task => {
      this.viewTaskVO = task;
      this.taskboardColumnMapVO = task.taskboardColumnMapVO;
      this.taskboardColumns = []

      for (let i = 0; i < task.taskboardColumnMapVO.length; i++) {
        this.taskboardColumns.push(task.taskboardColumnMapVO[i].taskboardColumnsVO);
        task.taskboardColumnMapVO[i].taskboardTaskVOList.forEach(element => {
          this.taskboardTaskVOList.push(element)
        });
      }

      if (this.taskIdFromUrl !== undefined && this.taskIdFromUrl !== null && this.taskIdFromUrl !== '') {
        this.openTaskDetailsDialog();
      }
    })
  }
  openTaskDetailsDialog() {
    const taskDetails = this.taskboardTaskVOList.find(task => task.taskId === this.taskIdFromUrl);
    let item = null;
    item = this.taskboardColumns.find(column => column.columnName === taskDetails.status);
    this.selectedColumn = item.columnName;
    const columnIndex = this.taskboardColumnMapVO.findIndex(column => column.taskboardColumnsVO.columnName === taskDetails.status);
    this.selectedColumnIndex = columnIndex;
    if (this.viewTaskVO.isTaskBoardOwner) {
      item.taskboardColumnSecurity.read = true;
      item.taskboardColumnSecurity.delete = true;
      item.taskboardColumnSecurity.update = true;
    }
    if (item.taskboardColumnSecurity.read === true) {
      this.taskBoardTaskVO = taskDetails;
      var statusList: StatusList[] = [];
      this.taskboardColumnMapVO.forEach(column => {
        const statusListVO = new StatusList();
        statusListVO.name = column.taskboardColumnsVO.columnName;
        statusListVO.color = column.taskboardColumnsVO.columnColor;
        if (column.taskboardColumnsVO.subStatus && column.taskboardColumnsVO.subStatus.length > 0) {
          statusListVO.subStatusList = column.taskboardColumnsVO.subStatus;
          statusList.push(statusListVO);
        } else {
          statusListVO.subStatusList = [];
          statusList.push(statusListVO);
        }
      });
      const selectedTaskIndex = this.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList.findIndex(column => column.id === this.taskBoardTaskVO.id);
      this.selectedTaskIndex = selectedTaskIndex;
      this.mappedTask = this.taskboardColumnMapVO[this.selectedColumnIndex].taskboardTaskVOList;
      var subStatus: string;
      if (this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus
        && this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus.length > 0) {
        subStatus = this.taskboardColumnMapVO[0].taskboardColumnsVO.subStatus[0].name;
      }
      const dialog = this.dialog.open(TaskboardFormDetailsComponent, {
        disableClose: false,
        width: '95%',
        maxWidth: '95%',
        height: '95%',
        autoFocus: false,
        data: {
          taskDetails: this.taskBoardTaskVO,
          formId: item.formId,
          version: item.version,
          color: item.columnColor,
          statusList: statusList,
          taskList: this.taskboardTaskVOList,
          taskIndex: this.selectedTaskIndex,
          groupList: this.groupList,
          usersList: this.usersList,
          taskName: this.viewTaskVO.taskName,
          taskboardId: this.viewTaskVO.id,
          taskboardColumnId: item.id,
          isTaskBoardOwner: this.viewTaskVO.isTaskBoardOwner,
          taskboardColumnSecurity: item.taskboardColumnSecurity,
          taskboardVO: this.viewTaskVO,
          value: 'fromTask',
          mappedColumnTaskList: this.mappedTask,
          type: 'files',
          subStatus
        },
      });
      dialog.afterClosed().subscribe((data) => {
        this.loadAttachments()
      });
    }

  }
  getUserAndGroupList() {
    this.taskboardService.getUserGroupList().subscribe(group => {
      this.groupList = group;
    })
    this.taskboardService.getUsersList().subscribe(users => {
      this.usersList = users;
    })
  }
}
