import { Component, OnInit, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { ProcessInstanceListService } from './process-instance-list.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PaginationVo, FieldValueVO } from './paginationVo';
import { merge } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Paginator, ProcessInstanceListVO } from './process-instance-list.vo';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcessInstanceTaskListService } from '../process-instance-task-list/process-instance-task-list.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import * as moment from 'moment';
import { OrgPrefrenceService } from '../../shared-module/services/org-prefrence.service';
import { DatePipe } from '@angular/common';
import { ThemeService } from 'src/app/services/theme.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'app-process-instance-list',
  templateUrl: './process-instance-list.component.html',
  styleUrls: ['./process-instance-list.component.scss']
})
export class ProcessInstanceListComponent implements OnInit {

  // tslint:disable-next-line: no-input-rename
  @Input('status') status: any;
  selectedItem: any;
  show = false;
  constructor(private fb: FormBuilder, private processInstanceTaskListService: ProcessInstanceTaskListService,
              private activatedRoute: ActivatedRoute, private datepipe: DatePipe,
              private themeService: ThemeService, private workspaceService: WorkspaceService,
    // tslint:disable-next-line: max-line-length
              private router: Router, private processInstanceService: ProcessInstanceListService, private dialog: MatDialog, private changeDetectorRef: ChangeDetectorRef, private snackBar: MatSnackBar, private orgPrfrenceService: OrgPrefrenceService) { }
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('menuTrigger') input;
  paginationVO = new PaginationVo();
  paginators = new Paginator();
  processInstanceList: ProcessInstanceListVO[] = [];
  listLength: any;
  form: FormGroup;
  filterDataType = {};
  filterColumns: any;
  filterColumnsCompleted = [
    { value: 'processDefName', fieldId: 'col2', fieldName: 'Process Name', datatype: 'string', style: 'string' },
    { value: 'startTime', fieldId: 'col3', fieldName: 'Start Date', datatype: 'date', style: 'string' },
    { value: 'endTime', fieldId: 'col4', fieldName: 'End Date', datatype: 'date', style: 'string' },
    { value: 'time', fieldId: 'col5', fieldName: 'Total Time Taken', datatype: 'number', style: 'string' }
  ];
  processHeader = [
    { value: 'id', headerId: 'col1', headerName: 'Id', datatype: 'uuid', style: '' },
    { value: 'processDefName', headerId: 'col2', headerName: 'Process Name', datatype: 'string', style: '' },
    { value: 'createdBy', headerId: 'col6', headerName: 'Initiated By', datatype: 'string', style: '' },
    { value: 'startTime', headerId: 'col3', headerName: 'Initiated Date', datatype: 'date', style: '' },
    { value: 'updatedBy', headerId: 'col7', headerName: 'End By', datatype: 'string', style: '' },
    { value: 'endTime', headerId: 'col4', headerName: 'End Date', datatype: 'date', style: '' },
    { value: 'time', headerId: 'col5', headerName: 'Total Time Taken', datatype: 'number', style: '' }
  ];
  filterColumnsRunning = [
    { value: 'processDefName', fieldId: 'col2', fieldName: 'Process Definition Name', datatype: 'string' },
    { value: 'startTime', fieldId: 'col3', fieldName: 'Start Date', datatype: 'date' },
    { value: 'endTime', fieldId: 'col4', fieldName: 'Updated Date', datatype: 'date' },
    { value: 'createdBy', fieldId: 'col6', fieldName: 'Start By', datatype: 'string' },
    { value: 'updatedBy', fieldId: 'col7', fieldName: 'End By', datatype: 'string' }
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
  filterCount = 0;
  columnValue: any;
  filterOperator: string;
  columnId: any;
  isDateField = false;
  filterDatatype: any;
  type = 'text';
  isPaginator = false;
  isLength = false;
  defaultPageSize = 10;

  displayedColumns: string[] = ['col2', 'col6', 'col3', 'col7', 'col4', 'col5'];
  displayedRunnningColumns: string[] = ['col1', 'startTime', 'updatedDate', 'createdBy', 'updatedBy'];
  ngOnInit(): void {
    this.initializeFilterForm();
    this.loadList();
    this.changeDetectorRef.markForCheck();
  }

  loadList() {
    this.processInstanceService.getProcessInstanceList(this.getPagination()).subscribe(data => {
      this.processInstanceList = data.data;
      this.listLength = data.totalRecords;
      if (this.listLength !== 0 && this.listLength !== '0') {
        this.isLength = true;
        this.isPaginator = true;
      } else {
        this.isLength = false;
        this.isPaginator = false;
      }
    });
  }

  getPagination() {
    this.changeDetectorRef.detectChanges();
    this.paginationVO.index = this.paginators.index;
    this.paginationVO.size = this.paginators.pageSize;
    if (this.sort === undefined || this.sort.active === undefined || this.sort.active === '') {
      this.paginationVO.columnName = 'startTime';
    } else {
      if (this.sort.active === 'col5' || this.sort.active === 'col4') {
        this.paginationVO.columnName = 'endTime';
      } else if (this.sort.active === 'col3') {
        this.paginationVO.columnName = 'startTime';
      } else if (this.sort.active === 'col2') {
        this.paginationVO.columnName = 'processDefinition.processDefinitionName';
      } else {
        this.paginationVO.columnName = 'startTime';
      }
    }
    if (this.sort === undefined || this.sort.direction === undefined || this.sort.direction === '' || this.sort.direction === null) {
      this.paginationVO.direction = 'desc';
    } else {
      this.paginationVO.direction = this.sort.direction;
    }
    if (this.paginators) {
      this.paginationVO.index = this.paginators.index;
      this.paginationVO.size = this.paginators.pageSize;
    } else {
      this.paginationVO.index = 0;
      this.paginationVO.size = this.defaultPageSize;
    }
    this.paginationVO.taskStatus = this.status;
    return this.paginationVO;
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit() {
    this.changeDetectorRef.markForCheck();
    if (this.sort !== undefined) {
      merge(this.sort.sortChange).subscribe(() => this.loadList());
    }
    this.changeDetectorRef.detectChanges();
  }

  openTaskList(element) {
    this.paginationVO.processInstanceId = element.col1;
    this.paginationVO.index = 0;
    this.paginationVO.size = 10;
    this.paginationVO.columnName = 'startTime';
    this.paginationVO.taskStatus = this.status;
    this.paginationVO.filterValue = [];
    this.processInstanceTaskListService.getProcessInstanceTaskList(this.paginationVO).subscribe(data => {
      if (data.data.length > 0) {
        this.router.navigate([this.workspaceService.getWorkSpaceKey() + 
          '/view-task-list/' + this.status.toLowerCase() + '/' + element.col1]);
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'There are no Tasks'
        });
      }
    });
  }

  pageEvent(event) {
    this.paginators = event;
    this.loadList();
  }

  initializeFilterForm() {
    this.form = this.fb.group({
      filterValue: [''],
      operator: [''],
      totalTimeFilterValue: ['minutes'],
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
    this.paginators.index = 0;
    const forms = (this.form.get('filters') as FormArray);
    for (let i = 0; i < forms.length; i++) {
      this.checkValidation(i);
    }

    if (userForm.valid && forms.valid) {
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.loadList();
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
    // for (let i = 0; i < forms.length; i++) {
    //   (this.form.get('filters') as FormArray).removeAt(i);
    // }
    // if (forms.length === 0) {
    //   (this.form.get('filters') as FormArray).push(this.addFilter());
    // }
    this.paginationVO.index = 0;
    this.paginators.index = 0;
    this.paginationVO.filterValue = [];
    this.loadList();
    this.emptyPaginator();
    // this.filterDataType = {};
  }

  getDataType(i: any, headerId: any) {
    const index = '' + i;
    const form = (this.form.get('filters') as FormArray).get(index);
    const dataType = form.get('dataType');
    if (this.status === 'COMPLETED') {
      this.filterColumns = this.filterColumnsCompleted;
    } else {
      this.filterColumns = this.filterColumnsRunning;
    }
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

  getBrowsertime(utcTime) {
    if (utcTime !== undefined && utcTime !== null && utcTime !== '' && utcTime !== 'null' &&
      (new Date(utcTime).toString() !== 'Invalid Date')) {
      const date = new Date(utcTime);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return this.datepipe.transform(new Date(date.getTime() + userTimezoneOffset), 'dd/MMM/yyyy hh:mm:ss a');
    } else {
      return utcTime;
    }
  }

  clearAllFilter() {
    if ((this.form.get('filters') as FormArray).length > 1
      || ((this.form.get('filters') as FormArray).length === 1 &&
        this.form.get('filters').get('' + 0).get('filterIdColumnValue').value !== null
        && this.form.get('filters').get('' + 0).get('filterIdColumnValue').value !== undefined
        && this.form.get('filters').get('' + 0).get('filterIdColumnValue').value !== '')) {
      const length = (this.form.get('filters') as FormArray).length;
      for (let i = 0; i < length; i++) {
        (this.form.get('filters') as FormArray).removeAt(0);
      }
      this.paginationVO.index = 0;
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.loadList();
      this.emptyPaginator();
      (this.form.get('filters') as FormArray).push(this.addFilter());
    }
    for (let i = 0; i < this.processHeader.length; i++) {
      this.processHeader[i].style = null;
    }
  }

  clearFilter() {
    if ((this.form.get('filterValue').value !== null || this.form.get('filterValue').value !== undefined || this.form.get('filterValue').value !== '')
      && (this.form.get('operator').value !== null || this.form.get('operator').value !== undefined || this.form.get('operator').value !== '')) {
      this.form.get('filterValue').setValue(null);
      this.form.get('operator').setValue(null);
      this.form.get('totalTimeFilterValue').setValue('minutes');
      // this.form.get('filterValue').setValidators([Validators.required]);
      // this.form.get('operator').setValidators([Validators.required]);
      // this.form.get('filterValue').updateValueAndValidity();
      // this.form.get('operator').updateValueAndValidity();
      this.filterCount--;
      for (let i = 0; i < (this.form.get('filters') as FormArray).length; i++) {
        if (this.form.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.form.get('filters') as FormArray).removeAt(i);
          this.paginationVO.index = 0;
          const form = (this.form.get('filters') as FormArray);
          this.paginationVO.filterValue = form.value;
          this.loadList();
          this.emptyPaginator();
        }
      }
      for (let i = 0; i < this.processHeader.length; i++) {
        if (this.processHeader[i].headerName === this.columnId) {
          this.processHeader[i].style = null;
        }
      }
    }
  }

  addValidations() {
    this.form.get('filterValue').setValidators([Validators.required]);
    this.form.get('operator').setValidators([Validators.required]);
    this.form.get('filterValue').updateValueAndValidity();
    this.form.get('operator').updateValueAndValidity();
  }

  removeValidations() {
    this.form.get('filterValue').setValidators(null);
    this.form.get('operator').setValidators(null);
    this.form.get('filterValue').updateValueAndValidity();
    this.form.get('operator').updateValueAndValidity();
  }


  filterApply(userForm) {
    this.selectedItem = this.columnId;
    let setFilter = false;
    this.addValidations();
    for (let i = 0; i < (this.form.get('filters') as FormArray).length; i++) {
      if (this.form.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        this.form.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        this.form.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.form.get('filterValue').value);
        this.form.get('filters').get('' + i).get('operators').setValue(this.form.get('operator').value);
        this.form.get('filters').get('' + i).get('totalTimeFilterValue').setValue(this.form.get('totalTimeFilterValue').value);
        this.form.get('filters').get('' + length).get('dataType').setValue(this.filterDatatype);
      } else {
        const array = [];
        array.push((this.form.get('filters') as FormArray).value);
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCount++;
          if (this.filterCount > 1) {
            (this.form.get('filters') as FormArray).push(this.addFilter());
          }
          const length = (this.form.get('filters') as FormArray).length - 1;
          this.form.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          this.form.get('filters').get('' + length).get('filterIdColumnValue').setValue(this.form.get('filterValue').value);
          this.form.get('filters').get('' + length).get('operators').setValue(this.form.get('operator').value);
          this.form.get('filters').get('' + length).get('totalTimeFilterValue').setValue(this.form.get('totalTimeFilterValue').value);
          this.form.get('filters').get('' + length).get('dataType').setValue(this.filterDatatype);
        }
      }
    }
    this.paginationVO.index = 0;
    if (userForm.valid) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.processHeader.length; i++) {
        if (this.processHeader[i].headerName === this.columnId) {
          this.processHeader[i].style = 'color:' + this.themeService.primaryColor + ';';
        }
      }
      this.input.closeMenu();
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.paginators.index = 0;
      this.loadList();
      this.removeValidations();
      this.emptyPaginator();
    }
  }

  emptyPaginator() {
    this.isPaginator = false;
    this.isLength = false;
  }

  setDataType(headerDetails) {
    if (headerDetails.datatype === 'string' || headerDetails.datatype === 'text') {
      this.filterOperator = 'string';
      this.isDateField = false;
      this.type = 'text';
    } else if (headerDetails.datatype === 'long' ||
      headerDetails.datatype === 'number') {
      this.filterOperator = 'number';
      this.isDateField = false;
      this.type = 'number';
    } else if (headerDetails.datatype === 'date' || headerDetails.datatype === 'timeStamp') {
      this.filterOperator = 'number';
      this.isDateField = true;
      this.type = null;
    }
    this.filterDatatype = headerDetails.datatype;
    this.columnValue = headerDetails.headerName;
    this.columnId = headerDetails.headerName;
    // this.repeatablefieldId = headerDetails.repeatableFieldId;
    const form = (this.form.get('filters') as FormArray);
    this.form.get('filterValue').setValue(null);
    this.form.get('operator').setValue(null);
    for (let i = 0; i < form.length; i++) {
      if (form.get('' + i).get('filterIdColumn').value && form.get('' + i).get('filterIdColumn').value === this.columnId) {
        this.form.get('filterValue').setValue(form.get('' + i).get('filterIdColumnValue').value);
        this.form.get('operator').setValue(form.get('' + i).get('operators').value);
        this.form.get('totalTimeFilterValue').setValue(form.get('' + i).get('totalTimeFilterValue').value);
        this.form.get('filterValue').setValidators(null);
        this.form.get('filterValue').setErrors(null);
        this.form.get('operator').setErrors(null);
      }
    }
  }

  checkDate(value: string) {
    if (value !== undefined && value != null) {
      return this.getBrowsertime(value);
    }
    return '';
  }

}
