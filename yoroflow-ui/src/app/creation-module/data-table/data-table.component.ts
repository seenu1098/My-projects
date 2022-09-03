import { DatePipe, DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild, HostListener, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ResizeEvent } from 'angular-resizable-element';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ThemeService } from 'src/app/services/theme.service';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { GridService } from 'src/app/shared-module/yorogrid/grid.service';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { DataTableDialogComponent } from '../data-table-dialog/data-table-dialog.component';
import { TableObjectsColumns, TableObjectsVO } from '../table-objects/table-object-vo';
import { TableObjectService } from '../table-objects/table-objects.service';
import { ColumnDataVO, DataTableVO, DeleteDataTableValuesVO, paginatorForData } from './data-table-vo';
import { ImportDataTableComponent } from '../import-data-table/import-data-table.component';
import { DataTableteamComponent } from '../data-tableteam/data-tableteam.component';
import { Sort } from '@angular/material/sort';
import { GroupService } from 'src/app/engine-module/group/group-service';
import { NotificationService } from 'src/app/rendering-module/shared/service/notification.service.service';
import { DataTablePageComponent } from 'src/app/mytasks-module/data-table-page/data-table-page.component';
import { saveAs } from 'file-saver';
import { Paginator } from 'src/app/shared-module/paginator/paginatorVO';
import * as moment from 'moment';
import { DataTableColumnsVO } from 'src/app/taskboard-module/shared/automation-data-table/data-table-model';
import { TaskBoardService } from 'src/app/taskboard-module/taskboard-configuration/taskboard.service';
import { PaginatorService } from 'src/app/shared-module/paginator/paginator/paginator.service';
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
  screenHeight1: string;
  screenHeight: string;
  screenWidth: string;
  ownerList: any = [];

  @Input() object: any;
  @Input() from: string;
  @Input() tableObjectId: string;
  length: any;
  updateAllowed = false;
  readAllowed = false;
  deleteAllowed = false;
  ownerAllowed = false;

  constructor(private fb: FormBuilder, public themeService: ThemeService, private datepipe: DatePipe, public service: TableObjectService,
              private dialog: MatDialog, private gridService: GridService, public snackBar: MatSnackBar,
              private groupService: GroupService, private notficationService: NotificationService,
              private activatedRoute: ActivatedRoute, private paginatorService: PaginatorService,
              private router: Router, public taskboardService: TaskBoardService) { }

  form: FormGroup;
  spinner: any;
  dataTableColumns: TableObjectsColumns[] = [];
  dataTable: TableObjectsVO;
  displayedColumns: string[] = [];
  dataTableName: string;
  dataTableId: any;
  scrollHeight: any;
  dataTableValuesList: any;
  @ViewChild('menuTriggerMap') addFields;
  @ViewChild('menuTriggerColumn') columnProcess;
  selectedColumn: any;
  selectedIndex: any;
  paginationVO = new PaginationVO();
  selectAllRow: boolean;
  valueChangedRow: any[] = [];
  deleteRowArray: any[] = [];
  dataError = false;
  saving = false;
  dataEmpty = false;
  documentOwnerList: any;
  usersList: any = [];
  type = 'text';
  subscription = new Observable<any>();
  dataColumnsList = [
    { type: 'string', icon: 'pin', name: 'Text' },
    { type: 'date', icon: 'date_range', name: 'Date' },
    { type: 'timestamp', icon: 'pin', name: 'Date & Time' },
    { type: 'long', icon: 'list_alt', name: 'Number' },
  ];
  dataTableForm: FormGroup;

  columnProcessList = [
    { type: 'edit', icon: 'pin', name: 'Edit' },
    { type: 'delete', icon: 'text_fields', name: 'Delete' }
  ];
  sortForDataTable: Sort;
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
  filterOperator: any;
  isDateField = false;
  filterDatatype: any;
  filterCountForDataTable = 0;
  sortb = false;
  modes = [
    { name: 'Editing', icon: 'edit', isSelected: false },
    { name: 'Viewing', icon: 'visibility', isSelected: false }
  ];
  viewMode: any = 'Viewing';

  // file imports
  fieldNamesList: any[] = [];
  file: any;
  dataTableObjectPageObject: DataTablePageComponent;
  @Input('defaultColumn')
  defaultColumnForDataTable = 'created_on';
  @Input('defaultSortDirection')
  defaultSortDirection = 'desc';
  paginatorForDataTable = new paginatorForData();
  defaultPageSize = 10;
  DataTableOwnerList: string[] = [];
  userDetails: any;
  columnId: any;
  @ViewChild('matMenuTriggerdataTable') inputForDataTable;
  selectedItem: any[] = [];
  isDataTablePaginator = false;
  islength = false;
  activeSortColumn: string;
  isLoad = true;
  ngOnInit(): void {
    this.initializeform();
    this.getPaginationForDataTable();
    this.paginatorService.setDataTable(false);
    this.loadColumnValues();
    this.activatedRoute.paramMap.subscribe(params => {
      const tableId = params.get('id');
      if (tableId) {
        this.dataTableId = tableId;
        this.getTableObjects(tableId);
      }
    });
    this.form = this.fb.group({
      rows: [1],
      isSelected: [''],
      tableObjectsColumns: this.fb.array([
        this.addDataTableFormGroup()
      ]),
    });
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    if (this.object) {
      this.dataTableObjectPageObject = this.object;
    }
    this.dataTableObjectPageObject?.tableObjectId.subscribe(data => {
      this.dataTableId = data;
      this.getTableObjects(data);
    });
    if (this.tableObjectId) {
      this.dataTableId = this.tableObjectId;
      this.getTableObjects(this.tableObjectId);
    }
    this.getUsers();
    this.getOwners();
    this.getSecurity();
    this.getLoggedUserDetails();
  }

  initializeform() {
    this.dataTableForm = this.fb.group({
      filterValue: [''],
      operator: [''],
      filters: this.fb.array([
        this.addDynamicFilter()
      ])

    });

  }
  addDynamicFilter() {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      filterDataType: ['string'],
    });
  }
  sort(sort: Sort, column: TableObjectsColumns) {
    // if (this.sortb === true) {
    const pagination = new PaginationVO();
    // pagination.index = 0;
    // pagination.size = 10;
    if (column.isSort === true) {
      column.isSort = false;
    } else {
      column.isSort = true;
    }
    this.paginationVO.direction = column.isSort === true ? 'asc' : 'desc';
    this.activeSortColumn = column.columnIdentifier;
    this.paginationVO.columnName = column.columnIdentifier;
    this.dataTableColumns.forEach(d => {
      if (d.columnIdentifier !== column.columnIdentifier) {
        d.isSort = false;
      }
    });
    // this.paginationVO = pagination;
    this.service.getTableObjectionValue(this.dataTableId, this.paginationVO).subscribe(data => {
      // this.spinner.close();
      if (data) {
        this.dataError = false;
        this.dataTableValuesList = data.dataTableVOList;
        this.length = data.totalRecords;
        if (this.length !== 0 && this.length !== '0') {
          this.isDataTablePaginator = true;
          this.islength = true;
        } else {
          this.isDataTablePaginator = false;
          this.islength = false;
        }

        this.form.reset();
        const formArray = (this.form.get('tableObjectsColumns') as FormArray);
        while (formArray.length !== 0) {
          formArray.removeAt(0);
        }
        this.form.get('rows').setValue(1);
        this.getDataTableFormarray().push(this.addDataTableFormGroup());
        if (this.dataTableValuesList.length === 0) {
          this.loadDataArray(0, null);
        } else {
          this.loadDataValueArray();
        }
      }
    }, error => {
      this.dataError = true;
      // this.spinner.close();
    });
    this.sortb = false;
  }

  setDataType(column) {
    this.columnId = column.columnIdentifier;
    if (column.dataType === 'string') {
      this.filterOperator = 'string';
      this.isDateField = false;
      this.type = 'text';
    } else if (column.dataType === 'date' || column.dataType === 'timestamp') {
      this.filterOperator = 'number';
      this.isDateField = true;
      this.type = null;
    } else if (column.dataType === 'long' || column.dataType === 'float') {
      this.filterOperator = 'number';
      this.isDateField = false;
      this.type = null;
    }
    this.filterDatatype = column.dataType;
    const form = (this.dataTableForm.get('filters') as FormArray);
    this.dataTableForm.get('filterValue').setValue(null);
    this.dataTableForm.get('operator').setValue(null);
    this.dataTableForm.get('filterValue').setValidators(null);
    this.dataTableForm.get('filterValue').setErrors(null);
    this.dataTableForm.get('operator').setValidators(null);
    this.dataTableForm.get('operator').setErrors(null);
    for (let i = 0; i < form.length; i++) {
      if (form.get('' + i).get('filterIdColumn').value && form.get('' + i).get('filterIdColumn').value === this.columnId) {
        this.dataTableForm.get('filterValue').setValue(form.get('' + i).get('filterIdColumnValue').value);
        this.dataTableForm.get('operator').setValue(form.get('' + i).get('operators').value);
        this.dataTableForm.get('filterValue').setValidators(null);
        this.dataTableForm.get('filterValue').setErrors(null);
        this.dataTableForm.get('operator').setErrors(null);
      }
    }

  }
  changeMode(mode) {
    this.viewMode = mode;
    if (mode !== 'Viewing') {
      this.clearAllFilter();
    }
  }

  dynamicFilterApply() {
    // this.selectedItem = this.columnId;
    let setFilter = false;
    this.addValidations();
    this.dataTableForm.get('filterValue').markAsTouched();
    this.dataTableForm.get('operator').markAsTouched();
    for (let i = 0; i < (this.dataTableForm.get('filters') as FormArray).length; i++) {
      this.dataTableColumns.forEach(d => {
        if (this.dataTableForm.get('filters').get('' + i).get('filterIdColumn').value === d.columnIdentifier) {
          d.style = 'color:' + this.themeService.primaryColor + ';';
        }
      });
      if (this.dataTableForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        this.dataTableForm.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        this.dataTableForm.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.dataTableForm.get('filterValue').value);
        this.dataTableForm.get('filters').get('' + i).get('operators').setValue(this.dataTableForm.get('operator').value);
        this.dataTableForm.get('filters').get('' + i).get('filterDataType').setValue(this.filterDatatype);
      } else {
        let array = [];
        array = (this.dataTableForm.get('filters') as FormArray).value;
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCountForDataTable++;
          if (this.filterCountForDataTable >= 1) {
            (this.dataTableForm.get('filters') as FormArray).push(this.addDynamicFilter());
          }
          const length = (this.dataTableForm.get('filters') as FormArray).length - 1;
          this.dataTableForm.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          this.dataTableForm.get('filters').get('' + length).get('filterIdColumnValue')
          .setValue(this.dataTableForm.get('filterValue').value);
          this.dataTableForm.get('filters').get('' + length).get('operators').setValue(this.dataTableForm.get('operator').value);
          this.dataTableForm.get('filters').get('' + length).get('filterDataType').setValue(this.filterDatatype);
        }
      }
    }
    this.paginationVO.index = 0;
    if (this.dataTableForm.valid) {
      const index = this.selectedItem.findIndex(t => t === this.columnId);
      if (index === -1) {
        this.selectedItem.push(this.columnId);
      }
      this.inputForDataTable.closeMenu();
      const form = (this.dataTableForm.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.paginationVO.index = 0;
      this.paginationVO.size = 10;
      this.emptyworkPaginator();
      this.loadColumnValues();
      this.removeValidations();
    }
    // if (this.dataTableForm.valid) {
    //   this.inputForDataTable.closeMenu();
    //   const form = (this.dataTableForm.get('filters') as FormArray);
    //   this.paginationVO.filterValue = form.value;
    //   this.paginationVO.index = 0;
    //   this.loadColumnValues();
    //   this.emptyworkPaginator();
    //   this.removeValidations();

    // }

  }

  emptyworkPaginator() {
    this.isDataTablePaginator = false;
    this.islength = false;
  }


  clearAllFilter() {
    let allowLoadData = false;
    // if (this.selectedSearch !== '' || this.selectedSearch !== null || this.selectedSearch === undefined) {
    //   allowLoadData = true;
    // }
    // this.clearDateSearch();
    if ((this.dataTableForm.get('filters') as FormArray).length > 1
      || ((this.dataTableForm.get('filters') as FormArray).length === 1 &&
        this.dataTableForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== null
        && this.dataTableForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== undefined
        && this.dataTableForm.get('filters').get('' + 0).get('filterIdColumnValue').value !== '')) {
      const length = (this.dataTableForm.get('filters') as FormArray).length;
      allowLoadData = false;
      this.dataTableForm.get('filterValue').setValue(null);
      this.dataTableForm.get('operator').setValue(null);
      this.dataTableForm.get('filterValue').setValidators(null);
      this.dataTableForm.get('operator').setValidators(null);
      this.dataTableForm.get('filterValue').updateValueAndValidity();
      this.dataTableForm.get('operator').updateValueAndValidity();
      for (let i = 0; i < length; i++) {
        (this.dataTableForm.get('filters') as FormArray).removeAt(0);
        // this.filterValueVoList.splice(0, 1);
        //     const index = this.selectedItem.findIndex(t => t === this.columnId);
        //     if (index !== -1) {
        //   this.selectedItem.splice(index, 1);
        // }
      }
      this.dataTableColumns.forEach(d => {
        d.style = null;
      });
      this.paginationVO.index = 0;
      const form = (this.dataTableForm.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      (this.dataTableForm.get('filters') as FormArray).push(this.addDynamicFilter());
      this.paginatorService.setDataTable(false);
      this.loadColumnValues();
      this.emptyworkPaginator();
      this.dataTableForm.markAsUntouched();
      this.dataTableForm.markAsUntouched();
    }
    // tslint:disable-next-line:prefer-for-of
    // for (let i = 0; i < this.reportHeader.length; i++) {
    //   this.reportHeader[i].style = null;
    // }
    // if (allowLoadData) {
    //   this.getReportdata('notload', false);
    // }
    // this.emptyPaginator();
  }

  clearFilterForDynamic() {
    const index = this.selectedItem.findIndex(t => t === this.columnId);
    if (index !== -1) {
      this.selectedItem.splice(index, 1);
    }
    if ((this.dataTableForm.get('filterValue').value !== null ||
      this.dataTableForm.get('filterValue').value !== undefined ||
      this.dataTableForm.get('filterValue').value !== '')
      && (this.dataTableForm.get('operator').value !== null ||
        this.dataTableForm.get('operator').value !== undefined ||
        this.dataTableForm.get('operator').value !== '')) {
      this.dataTableForm.get('filterValue').setValue(null);
      this.dataTableForm.get('operator').setValue(null);
      this.filterCountForDataTable--;
      for (let i = 0; i < (this.dataTableForm.get('filters') as FormArray).length; i++) {
        this.dataTableColumns.forEach(d => {
          if (this.dataTableForm.get('filters').get('' + i).get('filterIdColumn').value === d.columnIdentifier) {
            d.style = null;
          }
        });
        if (this.dataTableForm.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.dataTableForm.get('filters') as FormArray).removeAt(i);
          this.inputForDataTable.closeMenu();
          this.paginationVO.index = 0;
          const form = (this.dataTableForm.get('filters') as FormArray);
          this.paginationVO.filterValue = form.value;
          this.paginatorService.setDataTable(false);
          this.loadColumnValues();
          this.emptyworkPaginator();
          this.dataTableForm.markAsUntouched();
        }
      }
    }
  }

  addValidations() {

    this.dataTableForm.get('filterValue').setValidators([Validators.required]);
    this.dataTableForm.get('operator').setValidators([Validators.required]);
    this.dataTableForm.get('filterValue').updateValueAndValidity();
    this.dataTableForm.get('operator').updateValueAndValidity();
  }
  removeValidations() {
    this.dataTableForm.get('filterValue').setValidators(null);
    this.dataTableForm.get('operator').setValidators(null);
    this.dataTableForm.get('filterValue').updateValueAndValidity();
    this.dataTableForm.get('operator').updateValueAndValidity();

  }
  getLoggedUserDetails() {
    this.notficationService.getLoggedInUserDetails().subscribe(data => {
      this.userDetails = data;
      const details = this.userDetails.firstName + ' ' + this.userDetails.lastName;
    });
  }
  checkLoggedInUser() {
    let isnotCreatedUser = false;
    if (this.userDetails !== null && this.userDetails !== undefined && this.userDetails !== '' && this.documentOwnerList && this.documentOwnerList.tableOwnersId) {
      this.documentOwnerList.tableOwnersId.forEach(element => {
        if (element.includes(this.userDetails.userId)) {
          isnotCreatedUser = true;
        }
      });
    }

    return isnotCreatedUser;
  }

  getUsers() {
    this.groupService.getGroupList().subscribe(res => {
      this.usersList = res;
    });
  }
  getOwners() {
    this.DataTableOwnerList = [];
    this.service.getUsersList().subscribe((data) => {
      this.ownerList = data;
    });
  }


  getPaginationForDataTable() {
    if (this.sortForDataTable === undefined || this.sortForDataTable.active === undefined || this.sortForDataTable.active === '') {
      this.paginationVO.columnName = this.defaultColumnForDataTable;
    } else {
      this.paginationVO.columnName = this.sortForDataTable.active;
    }
    if (this.sortForDataTable === undefined || this.sortForDataTable.direction === '' || this.sortForDataTable.direction === undefined || this.sortForDataTable.direction === null) {
      this.paginationVO.direction = this.defaultSortDirection;
    } else {
      this.paginationVO.direction = this.sortForDataTable.direction;
    }
    if (this.paginatorForDataTable.index > 0) {
      this.paginationVO.index = this.paginatorForDataTable.index;
    } else {
      this.paginationVO.index = 0;
    }
    if (this.paginatorForDataTable.pageSize > 10) {
      this.paginationVO.size = this.paginatorForDataTable.pageSize;
    } else {
      this.paginationVO.size = this.defaultPageSize;
    }
    return this.paginationVO;
  }
  sortDataForDataTable(sort: Sort) {
    this.sortForDataTable = sort;
    this.paginatorService.setDataTable(false);
    this.loadColumnValues();
  }
  getUserName(userId) {
    const index = this.ownerList.findIndex(
      (users) => users.userId === userId
    );
    return (this.ownerList[index]?.firstName +
      ' ' +
      this.ownerList[index]?.lastName
    );
  }

  getUserColor(userId): string {
    const index = this.ownerList.findIndex(
      (users) => users.userId === userId
    );
    return this.ownerList[index]?.color;
  }

  getUserFirstAndLastNamePrefix(userId) {
    const index = this.ownerList.findIndex(
      (users) => users.userId === userId
    );
    const firstName = this.ownerList[index]?.firstName.charAt(0).toUpperCase();
    const lastName = this.ownerList[index]?.lastName.charAt(0).toUpperCase();
    if (firstName && lastName) {
      return firstName + lastName;
    } else {
      return;
    }
  }

  getUserNames(assigneeUsers) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < assigneeUsers?.length; i++) {
      if (i > 4) {
        const index = this.ownerList.findIndex(
          (users) => users.userId === assigneeUsers[i]
        );
        if (userNames === null) {
          userNames =
            'Assigned To ' +
            this.ownerList[index].firstName +
            ' ' +
            this.ownerList[index].lastName +
            ', ';
        } else {
          userNames =
            userNames +
            this.ownerList[index].firstName +
            ' ' +
            this.ownerList[index].lastName +
            ', ';
        }
      }
    }
    return userNames;
  }

  getRemainingAssigneeUserCount(assigneeUsers) {
    const array = [];
    for (let i = 0; i < assigneeUsers.length; i++) {
      const index = this.usersList.findIndex(
        (users) => users.userId === assigneeUsers[i]
      );
      array.push(this.usersList[index]);
    }
    if (assigneeUsers.length > 4) {
      return assigneeUsers.length - 4;
    }
  }
  getGroupName(groupId) {
    const index = this.usersList.findIndex(
      (users) => users.id === groupId
    );
    return (this.usersList[index]?.name);
  }

  getGroupColor(groupId): string {
    const index = this.usersList.findIndex(
      (users) => users.id === groupId
    );
    return this.usersList[index]?.color;
  }

  getGroupFirstAndLastNamePrefix(groupId) {
    const index = this.usersList.findIndex(
      (users) => users.id === groupId
    );
    const firstName = this.usersList[index]?.name.toUpperCase().charAt(0);
    if (firstName) {
      return firstName;
    } else {
      return;
    }
  }

  getGroupNames(securityVoList) {
    let userNames: string;
    userNames = null;
    for (let i = 0; i < securityVoList?.length; i++) {
      if (i > 4) {
        const index = this.usersList.findIndex(
          (users) => users.id === securityVoList[i].groupId
        );
        if (userNames === null) {
          userNames =
            'Assigned To ' +
            this.ownerList[index].name +
            ', ';
        } else {
          userNames =
            userNames +
            this.ownerList[index].name +
            ', ';
        }
      }
    }
    return userNames;
  }

  getRemainingAssigneeGroupCount(securityVoList) {
    const array = [];
    for (let i = 0; i < securityVoList.length; i++) {
      const index = this.usersList.findIndex(
        (users) => users.userId === securityVoList[i].groupId
      );
      array.push(this.usersList[index]);
    }
    if (securityVoList.length > 4) {
      return securityVoList.length - 4;
    }
  }

  readDialog() {
    const dialog = this.dialog.open(
      DataTableteamComponent,
      {
        disableClose: true,
        width: '850px',
        height: '550px',
        panelClass: 'config-dialog',
        data: {
          id: this.dataTableId,
          usersList: this.ownerList,
          groupList: this.usersList,
          owner: this.documentOwnerList,

        },
      });
    dialog.afterClosed().subscribe(data => {
      this.getSecurity();
    });
  }


  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'modern') {
      this.scrollHeight = (window.innerHeight - 30) + 'px';
      this.screenHeight1 = (window.innerHeight - 1) + 'px';
      this.screenHeight = (window.innerHeight - 85) + 'px';
      this.screenWidth = (window.innerWidth - 63) + 'px';

    } else {
      this.scrollHeight = (window.innerHeight - 86) + 'px';
      this.screenHeight1 = (window.innerHeight - 63) + 'px';
      this.screenHeight = (window.innerHeight - 158) + 'px';
      this.screenWidth = (window.innerWidth - 63) + 'px';

    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.themeService.layoutName === 'modern') {
      this.scrollHeight = (window.innerHeight - 30) + 'px';
    } else {
      this.scrollHeight = (window.innerHeight - 86) + 'px';
    }
  }

  getTableObjects(id) {
    this.spinnerDialog();
    this.service.getTableObjectInfo(id).subscribe(data => {
      if (data) {
        this.dataTable = data;
        this.dataTableColumns = this.dataTable.tableObjectsColumns;
        this.dataTableName = data.tableName;
        data.tableObjectsColumns.forEach(element => {
          this.displayedColumns.push(element.columnName);
          element.isSort = false;
        });
        this.paginatorService.setDataTable(false);
        this.loadColumnValues();
      }
    },
      error => {
        this.spinner.close();
      });
  }
  getSecurity() {
    this.service.getSecurity(this.dataTableId).subscribe(data => {
      this.documentOwnerList = data;
      this.updateAllowed = this.documentOwnerList.updateAllowed;
      this.readAllowed = this.documentOwnerList.readAllowed;
      this.deleteAllowed = this.documentOwnerList.deleteAllowed;
      this.ownerAllowed = this.documentOwnerList.owner;
    });
  }
  pageEvent(paginator: Paginator): void {
    const pagination = new PaginationVO();
    this.paginationVO.index = paginator.index;
    this.paginationVO.size = paginator.pageSize;
    this.paginationVO.direction = this.paginationVO.direction;
    this.paginationVO.columnName = this.paginationVO.columnName;
    // this.paginationVO = pagination;
    this.paginatorForDataTable.index = paginator.index;
    this.paginatorService.setDataTable(false);
    this.loadColumnValues();
  }

  loadColumnValues() {
    this.isLoad = true;
    this.service.getTableObjectionValue(this.dataTableId, this.paginationVO).subscribe(data => {
      this.spinner.close();
      this.isLoad = false;
      if (data) {
        this.dataError = false;
        this.dataTableValuesList = data.dataTableVOList;
        this.length = data.totalRecords;
        if (this.length !== 0 && this.length !== '0') {
          this.isDataTablePaginator = true;
          this.islength = true;
        } else {
          this.isDataTablePaginator = false;
          this.islength = false;
        }

        this.form.reset();
        const formArray = (this.form.get('tableObjectsColumns') as FormArray);
        while (formArray.length !== 0) {
          formArray.removeAt(0);
        }
        this.form.get('rows').setValue(1);
        this.getDataTableFormarray().push(this.addDataTableFormGroup());
        if (this.dataTableValuesList.length === 0) {
          this.loadDataArray(0, null);
        } else {
          this.loadDataValueArray();
        }
      }
    }, error => {
      this.dataError = true;
      this.isLoad = false;
      this.spinner.close();
    });
  }

  loadDataValueArray() {
    const variableList: any[] = this.dataTableValuesList;
    for (let i = 0; i < variableList.length; i++) {
      const index = '' + i;
      if (i > 0) {
        this.getDataTableFormarray().push(this.addDataTableFormGroup());
      }
      if (variableList[i].values.length > 0) {
        this.loadDataArray(i, this.dataTableValuesList);
        const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
        tableObjectsColumnsArray.get('' + i).get('id').setValue(variableList[i].id);
        tableObjectsColumnsArray.get('' + i).get('index').setValue(i);
      }
    }

  }

  loadDataArray(columnIndex, columnDataVO) {
    const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
    for (let i = 0; i < this.dataTableColumns.length; i++) {
      const index = '' + i;
      (tableObjectsColumnsArray.get('' + columnIndex).get('values') as FormArray).push(this.addDataTableValueFormGroup());
      const group = (this.getDataTableValueFormarray(columnIndex).get(index) as FormGroup);
      group.get('columnIdentifier').setValue(this.dataTableColumns[i].columnIdentifier);
      group.get('dataType').setValue(this.dataTableColumns[i].dataType);
      if (this.dataTableColumns[i].isRequired === true) {
        group.get('columnValue').setValidators([Validators.required]);
      }
      if (this.dataTableColumns[i].dataType === 'long') {
        group.get('columnValue').setValidators([Validators.pattern('^[0-9]*$')]);
      }
      if (columnDataVO != null) {
        const columnValue = columnDataVO[columnIndex];
        columnValue.values.forEach(element => {
          if (element.columnIdentifier === this.dataTableColumns[i].columnIdentifier) {
            if ((this.dataTableColumns[i].dataType === 'date' || this.dataTableColumns[i].dataType === 'timestamp')
              && (element.columnValue && element.columnValue !== null && element.columnValue !== '')) {
              group.get('columnValue').setValue(new Date(element.columnValue));
            } else {
              group.get('columnValue').setValue(element.columnValue);
            }
          }
        });
      }
    }
    this.formValueChanges();
  }

  formValueChanges(): void {
    const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
    for (let i = 0; i < tableObjectsColumnsArray.length; i++) {
      const index = '' + i;
      const array = tableObjectsColumnsArray.get('' + i).get('values') as FormArray;
      array.valueChanges.pipe(debounceTime(300)),
        switchMap(async (data) => {
          if (data && array.valid) {
            const indexValue = tableObjectsColumnsArray.get('' + i).get('index').value;
            // return this.callSaveFromValueChanges(array, indexValue);
          }
        });
    }
  }

  saveValuesWhileFocusout(event, index) {
    const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
    const array = tableObjectsColumnsArray.get('' + index).get('values') as FormArray;
    if (event && array.valid) {
      const indexValue = tableObjectsColumnsArray.get('' + index).get('index').value;
      this.callSaveFromValueChanges(array, indexValue);
    }
  }

  checkLongField(array) {
    let valid = true;
    for (let i = 0; i < array.length; i++) {
      if (array.get('' + i).get('dataType').value === 'long' && array.get('' + i).get('columnValue').value !== null) {
        const value = array.get('' + i).get('columnValue').value;
        valid = value.includes('.') ? false : true;
      }
    }
    
    return valid;
  }

  callSaveFromValueChanges(array: FormArray, index: any) {
    if (array.valid) {
      const dataTableVO: DataTableVO[] = [];
      const tableObjectsColumnArray = this.form.get('tableObjectsColumns').value;
      if (tableObjectsColumnArray !== null) {
        dataTableVO.push(tableObjectsColumnArray[index]);
        this.saveValues(dataTableVO, index);
      }
    }
  }

  getDataTableFormarray() {
    return (this.form.get('tableObjectsColumns') as FormArray);
  }

  getDataTableValueFormarray(i) {
    return (this.form.controls.tableObjectsColumns as FormArray).at(i).get('values') as FormArray;
  }

  addRows() {
    const index = this.getDataTableFormarray().length - 1;
    // for (let i = index; i < index + this.form.get('rows').value; i++) {
    //   this.addNewColumn(i);
    // }
    this.addNewColumn(index);
    this.form.get('rows').setValue(1);
  }

  addNewColumn(i) {
    this.getDataTableFormarray().push(this.addDataTableFormGroup());
    const index = (+i + 1);
    this.getDataTableFormarray().get('' + index).get('index').setValue(index);
    this.loadDataArray(i + 1, null);
  }

  save() {
    if (this.form.valid) {
      const dataTableVO: DataTableVO[] = [];
      const tableObjectsColumnArray = this.form.get('tableObjectsColumns').value;
      if (tableObjectsColumnArray !== null) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < tableObjectsColumnArray.length; i++) {
          if (this.valueChangedRow.some(v => v === i)) {
            dataTableVO.push(tableObjectsColumnArray[i]);
          }
        }
      }
      // this.saveValues(dataTableVO);
    }
  }

  saveValues(dataTableVO: DataTableVO[], index: any) {
    if (dataTableVO.length > 0) {
      this.saving = true;
      this.service.saveTableObjectionValue(dataTableVO, this.dataTableId).subscribe(data => {
        this.saving = false;
        if (data) {
          this.valueChangedRow = [];
          const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
          tableObjectsColumnsArray.get('' + index).get('id').setValue(data.tableId);
          // this.getTableObjects(this.dataTableId);
          const d = dataTableVO.findIndex(da => da.id === '' || da.id === null);
          if (d !== -1) {
            this.paginatorService.setDataTable(true);
            this.loadColumnValues();
          }
        }
      },
        error => {
          this.saving = false;
        }
      );
    }
  }


  deleteRow(): void {
    const deleteRow = new DeleteDataTableValuesVO();
    const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
    for (let i = 0; i < tableObjectsColumnsArray.length; i++) {
      const group = (tableObjectsColumnsArray.get('' + i) as FormGroup);
      if (group.get('id').value && group.get('isSelected').value === true) {
        deleteRow.idList.push(group.get('id').value);
      } else if (group.get('isSelected').value === true) {
        this.deleteRowArray.push(i);
      }
    }
    deleteRow.tableId = this.dataTableId;
    if (deleteRow.idList.length > 0) {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '400px',
        data: { type: 'deleteTableRow' }
      });
      dialog.afterClosed().subscribe(data => {
        if (data && data === true) {
          this.service.deleteTableObjectRow(deleteRow).subscribe(response => {
            if (response) {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: response.response,
              });
              this.valueChangedRow = [];
              this.selectAllRow = false;
              this.getTableObjects(this.dataTableId);
            }
          });
        }
      });
    }
    if (this.deleteRowArray.length > 0) {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '400px',
        data: { type: 'deleteTableRow' }
      });
      dialog.afterClosed().subscribe(data => {
        if (data && data === true) {
          for (let i = 0; i < tableObjectsColumnsArray.length; i++) {
            const group = (tableObjectsColumnsArray.get('' + i) as FormGroup);
            if (this.deleteRowArray.some(d => d === i)) {
              tableObjectsColumnsArray.removeAt(i);
            }
          }
          this.deleteRowArray = [];
        }
      });
    }
  }

  fileImport(event) {
    this.fieldNamesList = [];
    this.file = event.target.files[0];

    const formData = new FormData();
    formData.append('file', this.file);
    this.service.getExcelHeaders(formData).subscribe(data => {
      if (data.response.includes('exist')) {
        this.fieldNamesList = data.excelHeaders;
        const dialogRef = this.dialog.open(ImportDataTableComponent, {
          width: '500px',
          height: '500px',
          data: {
            fieldList: this.fieldNamesList,
            dataTableColumns: this.dataTableColumns,
            dataTableName: this.dataTableName,
            file: this.file,
            tableObjectsId: this.dataTableId
          },
        });
        dialogRef.afterClosed().subscribe(response => {
          if (response) {
            this.getTableObjects(this.dataTableId);
          }
        });
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Invalid excel'
        });
      }
    });
  }

  openColumnFields(column) {
    const dialogRef = this.dialog.open(DataTableDialogComponent, {
      data: {
        status: 'column', required: this.dataTableValuesList.length > 0 ? true : false,
        data: column, type: 'save', dataTable: this.dataTable
      },
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.dataTable = response;
        this.dataTableColumns = response.tableObjectsColumns;
        this.loadDataArrayAfterAddColumn();
      }
    });
  }

  columnProcessChanges(column, i) {
    this.selectedColumn = column;
    this.selectedIndex = i;
  }

  getRequiredEnable(selectedIndex) {
    const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
    for (let j = 0; j < tableObjectsColumnsArray.length; j++) {
      const index = '' + selectedIndex;
      const group = (this.getDataTableValueFormarray(j).get(index) as FormGroup);
      if (this.dataTableColumns[selectedIndex].isRequired === true) {
        return false;
      } else {
        if (group.get('columnValue').value === null || group.get('columnValue').value === '') {
          return true;
        }
      }
    }
    return false;
  }

  processColumnFields(process) {
    if (process.type === 'edit') {
      const dialogRef = this.dialog.open(DataTableDialogComponent, {
        data: {
          status: 'column', required: this.getRequiredEnable(this.selectedIndex),
          data: this.selectedColumn, index: this.selectedIndex, type: 'edit', dataTable: this.dataTable
        },
      });
      dialogRef.afterClosed().subscribe(response => {
        if (response) {
          this.dataTable = response;
          this.dataTableColumns = response.tableObjectsColumns;
        }
      });
    }
    if (process.type === 'delete') {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '400px',
        data: { type: 'deleteTableColumn' }
      });
      dialog.afterClosed().subscribe(data => {
        if (data && data === true) {
          this.service.deleteTableObjectColumn(this.dataTable.tableObjectsColumns[this.selectedIndex].id).subscribe(response => {
            if (response && response.response === 'Column deleted successfully') {
              this.dataTable.tableObjectsColumns.splice(this.selectedIndex, 1);
              this.deleteColumnAndRow();
            }
          });
        }
      });
    }
  }

  deleteColumnAndRow() {
    this.getDataTableFormarray().removeAt(this.selectedIndex);
    const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
    for (let j = 0; j < tableObjectsColumnsArray.length; j++) {
      const index = j + '';
      (tableObjectsColumnsArray.get('' + index).get('values') as FormArray).removeAt(this.selectedIndex);
    }
  }

  loadDataArrayAfterAddColumn() {
    const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
    for (let i = 0; i < tableObjectsColumnsArray.length; i++) {
      const index = '' + i;
      (tableObjectsColumnsArray.get('' + i).get('values') as FormArray).push(this.addDataTableValueFormGroup());
      const group = (this.getDataTableValueFormarray(i).get('' + (this.dataTableColumns.length - 1)) as FormGroup);
      group.get('columnIdentifier').setValue(this.dataTableColumns[this.dataTableColumns.length - 1].columnIdentifier);
      group.get('dataType').setValue(this.dataTableColumns[this.dataTableColumns.length - 1].dataType);
      if (this.dataTableColumns[this.dataTableColumns.length - 1].isRequired === true) {
        group.get('columnValue').setValidators([Validators.required]);
      }
    }
  }

  addDataTableFormGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      index: [0],
      isSelected: [false],
      values: this.fb.array([
      ]),
    });
  }

  addDataTableValueFormGroup(): FormGroup {
    return this.fb.group({
      columnIdentifier: ['', Validators.required],
      columnValue: [''],
      dataType: [''],
    });
  }

  checkDate(value: string) {
    if (value !== undefined && value != null) {
      if (value.includes('0Z')) {
        return this.getBrowsertime(value, false);
      } else {
        return value;
      }
    }
    return '';
  }

  getBrowsertime(utcTime, fromDisplay: boolean) {
    if (utcTime !== undefined && utcTime !== null && utcTime !== '' && utcTime !== 'null' &&
      (new Date(utcTime).toString() !== 'Invalid Date')) {
      let date = new Date(utcTime);
      if (fromDisplay) {
        date = new Date(date.getTime() + (60 * 60 * 24 * 1000));
      }
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return this.datepipe.transform(new Date(date.getTime() + userTimezoneOffset), 'dd/MMM/yyyy');
    } else {
      return utcTime;
    }
  }

  setSelection(event: MatCheckboxChange): void {
    this.selectAllRow = event.checked;
    const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
    for (let i = 0; i < tableObjectsColumnsArray.length; i++) {
      const group = (tableObjectsColumnsArray.get('' + i) as FormGroup);
      group.get('isSelected').setValue(event.checked);
    }
  }

  setRowSelection(valueGroup: any, event: MatCheckboxChange): void {
    valueGroup.get('isSelected').setValue(event.checked);
    this.isCheckAllSelection();
  }

  isCheckAllSelection(): void {
    let count = 0;
    const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
    for (let i = 0; i < tableObjectsColumnsArray.length; i++) {
      const group = (tableObjectsColumnsArray.get('' + i) as FormGroup);
      if (group.get('isSelected').value === true) {
        count++;
      }
    }
    if (count === tableObjectsColumnsArray.length) {
      this.selectAllRow = true;
    } else {
      this.selectAllRow = false;
    }
  }

  isCheckBoxSelected(): boolean {
    const tableObjectsColumnsArray = this.form.get('tableObjectsColumns') as FormArray;
    for (let i = 0; i < tableObjectsColumnsArray.length; i++) {
      const group = (tableObjectsColumnsArray.get('' + i) as FormGroup);
      if (group.get('isSelected').value === true) {
        return true;
      }
    }
    return false;
  }

  spinnerDialog(): void {
    this.spinner = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '100px',
      data: { type: 'spinner' },
    });
  }

  route(): void {
    if (this.form.invalid || this.deleteRowArray.length > 0) {
      const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '400px',
        data: { type: 'backToDataTable' }
      });
      dialog.afterClosed().subscribe(data => {
        if (data && data === true) {
          this.router.navigate(['/data-table-list']);
        }
      });
    } else {
      this.router.navigate(['/data-table-list']);
    }
  }

  excelService() {
    this.service.getExcelData(this.dataTable.tableObjectId).subscribe((response) => {
      const blob = new Blob([response], { type: 'xlsx' });
      saveAs(blob, this.dataTable.tableName + '.xlsx');
    });
  }

  getDate(value, type) {
    if (value !== undefined && value !== null && value !== '' && value !== 'null' &&
      (new Date(value).toString() !== 'Invalid Date')) {
      return this.datepipe.transform(new Date(value), type === 'date' ? 'MMM d, y' : 'MMM d, y, h:mm:ss a');
      // return this.datepipe.transform(moment.utc(value).toDate(), 'MMM d, y, h:mm:ss a');
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() {
    this.paginatorService.setDataTable(false);
  }

}
