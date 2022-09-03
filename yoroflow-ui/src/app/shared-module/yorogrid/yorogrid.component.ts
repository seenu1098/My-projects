import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { merge, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GridDataSource } from './grid-data.source';
import { GridService } from './grid.service';
import { FormGroup, FormBuilder, NgForm, FormArray, Validators } from '@angular/forms';
import { HeaderVO, HeadersVO } from './headers-vo';
import { PaginationVO, FilterValueVO } from './pagination-vo';
import { OrgPrefrenceService } from '../services/org-prefrence.service';
import { Paginator } from '../../shared-module/paginator/paginatorVO';
import * as moment from 'moment';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-yorogrid',
  templateUrl: './yorogrid.component.html',
  styleUrls: ['./yorogrid.component.css']
})
export class YorogridComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('menuTrigger') input;

  form: FormGroup;

  // tslint:disable-next-line: no-input-rename
  @Input('gridId')
  gridId = '';

  // tslint:disable-next-line: no-input-rename
  @Input('id')
  id: string;

  // tslint:disable-next-line: no-input-rename
  @Input('defaultColumn')
  defaultColumn = '';

  @Input('defaultSortDirection')
  defaultSortDirection = '';

  @Input() filterVO: any;


  @Output() messageEvent = new EventEmitter<string>();
  @Output() individualSelect = new EventEmitter<object>();
  @Output() isSelect = new EventEmitter<object>();
  private gridDataSubject = new BehaviorSubject<any[]>([]);

  // tslint:disable-next-line: ban-types
  private behSubjectResultLength = new BehaviorSubject<string>('0');

  dataSource: GridDataSource;
  gridHeaders: HeadersVO;
  columnHeaders: HeaderVO[] = [];
  filterColumns: HeaderVO[];
  displayedColumns: string[] = [];
  filterBoolean = false;

  resultsLength: any;
  valid: boolean;
  success: boolean;
  paginationVO = new PaginationVO();
  show = [] as boolean[];
  isSelectAll: boolean;
  isIndividualSelect: boolean;
  filterDataType = {};
  checkboxIndex: any[] = [];
  indexes: any[] = [];
  defaultPageSize = 10;

  dataType = {
    number: [{ value: 'eq', description: $localize`:dataTyperq:equals` },
    { value: 'gt', description: $localize`:dataTypegt:greater than` },
    { value: 'ge', description: $localize`:dataTypege:greater than or equal to` },
    { value: 'lt', description: $localize`:dataTypelt:less than` },
    { value: 'le', description: $localize`:dataTypele:less than or equal to` },
    ],
    string: [
      { value: 'eq', description: $localize`:stringeq:equals` },
      { value: 'bw', description: $localize`:stringbw:begins with` },
      { value: 'ew', description: $localize`:stringew:ends with` },
      { value: 'cn', description: $localize`:stringcn:contains` },
    ]
  };
  filterCount = 0;
  columnValue: any;
  filterOperator: string;
  columnId: any;
  isDateField = false;
  filterDatatype: any;
  type = 'text';
  isFilterEnable = false;
  paginators = new Paginator();
  isPaginator = false;
  isLength = false;


  constructor(private fb: FormBuilder, private gridService: GridService, private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef, private orgPrfrenceService: OrgPrefrenceService,private themeService: ThemeService) { }

  ngOnInit() {
    this.paginators.index = 0;
    this.paginators.pageSize = this.defaultPageSize;
    this.form = this.fb.group({
      filterValue: ['', [Validators.required]],
      operator: ['', [Validators.required]],
      filters: this.fb.array([
        this.addFilter()
      ])
    });

    this.route.data.subscribe(data => {
      if (data) {
        if (data.gridId !== undefined && data.gridId !== '') {
          this.gridId = data.gridId;
        }
        if (data.defaultColumn !== undefined && data.defaultColumn !== '') {
          this.defaultColumn = data.defaultColumn;
        }
      }
    });

    // tslint:disable-next-line: triple-equals
    if (this.gridId == '') {
      console.error('Grid ID is mandatory');
      return;
    }
    this.gridHeaders = new HeadersVO();
    this.gridHeaders.tableWidth = 100;
    this.gridHeaders.headers = [];
    this.dataSource = new GridDataSource(this.gridService);
    this.dataSource.loadData(this.getPaginationInfo(this.paginationVO));
    this.dataSource.getCount().subscribe(data => {
      this.resultsLength = data;
      if (this.resultsLength !== 0 && this.resultsLength !== '0') {
        this.isLength = true;
      }
    });
    this.gridService.getHeaders(this.gridId).subscribe(data => {
      this.gridHeaders = data;
      this.gridHeaders.defaultPageSize = this.paginators.pageSize;
      this.isPaginator = true;
      this.filterBoolean = this.gridHeaders.filterEnabled;
      const len = this.gridHeaders.headers.length;
      this.displayedColumns = [];
      this.columnHeaders = this.gridHeaders.headers;
      let count = 0;
      for (let i = 0; i < this.columnHeaders.length; i++) {
        if (this.columnHeaders[i].filterable === true && count === 0) {
          this.isFilterEnable = true;
          count = 1;
        }
      }
      this.filterColumns = [];
      for (let i = 0; i < len; i++) {
        const header = this.columnHeaders[i];

        if (header.filterable === true) {
          this.filterColumns.push(header);
        }
        if (header.hidden === false) {
          this.displayedColumns.push(header.headerId);
        }

      }
    });
  }

  getFiltersFormArray() {
    return (this.form.get('filters') as FormArray).controls;
  }

  getDataType(i: any, headerId: any) {
    const index = '' + i;
    const form = (this.form.get('filters') as FormArray).get(index);
    const dataType = form.get('dataType');
    const filterIdColumnValue = form.get('filterIdColumnValue');


    this.filterColumns.forEach(filter => {
      if (filter.headerId === headerId) {
        dataType.setValue(filter.fieldDataType);
        if (filter.fieldDataType === 'text') {
          this.filterDataType[i] = 'string';
        } else if (filter.fieldDataType === 'long' ||
          filter.fieldDataType === 'double' || filter.fieldDataType === 'date') {
          this.filterDataType[i] = 'number';
        }
      }
    });

  }

  getDisplayedColumns(): string[] {
    if (this.gridHeaders && this.gridHeaders.headers) {
      return this.gridHeaders.headers
        .filter(column => !column.hidden)
        .map(column => column.headerId);
    }

    return [];
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit() {
    // tslint:disable-next-line: max-line-length
    merge(this.sort.sortChange).subscribe(() => this.dataSource.loadData(this.getPaginationInfo(this.paginationVO)));
    this.changeDetectorRef.detectChanges();
    // , this.paginator.page
  }

  pageEvent(event) {
    this.paginators = event;
    this.dataSource.loadData(this.getPaginationInfo(this.paginationVO));
  }

  getPaginationInfo(pagination: PaginationVO) {
    if (this.filterVO !== undefined) {
      this.paginationVO.staticFilterVO = this.filterVO;
    }
    // tslint:disable-next-line: triple-equals
    this.paginationVO.id = this.id;
    this.paginationVO.gridId = this.gridId;
    this.paginationVO.index = this.paginators.index;
    this.paginationVO.size = this.paginators.pageSize;
    this.paginationVO.direction = this.sort.direction;
    if (this.sort.direction === '' || this.sort.direction === undefined || this.sort.direction === null) {
      this.paginationVO.direction = this.defaultSortDirection;
      this.sort.direction = this.paginationVO.direction as SortDirection;
    }
    if (this.sort.active === '' || this.sort.active === undefined) {
      this.sort.active = this.defaultColumn;
    }
    this.paginationVO.columnName = this.sort.active;
    // tslint:disable-next-line: triple-equals
    if (pagination.filterValue.length === 0) {
      this.paginationVO.filterValue = [];

    } else {
      this.paginationVO.filterValue = pagination.filterValue;
    }
    return this.paginationVO;
  }

  refreshGrid() {
    this.isSelectAll = false;
    this.paginators.index = 0;
    this.paginators.pageSize = 10;
    this.sort.active = this.defaultColumn;
    this.sort.direction = '';
    this.sort._stateChanges.next();
    this.dataSource.loadData(this.getPaginationInfo(this.paginationVO));
    this.isLength = false;
    this.checkboxIndex = [];
    this.indexes = [];
  }

  emptyPaginator() {
    this.isPaginator = false;
    this.isLength = false;
  }

  addPaginator() {
    this.isPaginator = true;
    this.isLength = true;
  }

  getBrowsertime(utcTime) {
    if (utcTime !== undefined && utcTime !== null && utcTime !== '' && utcTime !== 'null' &&
      // tslint:disable-next-line:use-isnan
      (new Date(utcTime).toString() !== 'Invalid Date') && +utcTime === NaN) {
      const date = new Date(utcTime);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() + userTimezoneOffset);
      // return moment.utc(utcTime).toDate();
    } else {
      return utcTime;
    }
  }

  onRowClicked(data) {
    this.messageEvent.emit(data);
  }

  addAnotherFilter(event): void {

    (this.form.get('filters') as FormArray).push(this.addFilter());

  }

  removeThisService(i: number) {
    (this.form.get('filters') as FormArray).removeAt(i);
  }

  addFilter(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      dataType: ['text']
    });
  }

  searchFilter(userForm) {
    this.paginationVO.index = 0;
    this.paginator.pageIndex = 0;
    this.paginators.index = 0;
    this.paginators.pageSize = 10;
    const forms = (this.form.get('filters') as FormArray);
    for (let i = 0; i < forms.length; i++) {
      this.checkValidation(i);
    }
    if (userForm.valid && forms.valid) {
      const form = (this.form.get('filters') as FormArray);

      this.paginationVO.filterValue = form.value;
      this.dataSource.loadData(this.getPaginationInfo(this.paginationVO));
      this.isLength = false;
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


  selectionChange(event, index: number) {
    const i = '' + index;
    if (event.fieldDataType === 'date') {
      this.show[index] = true;
      (this.form.get('filters') as FormArray).get(i).get('filterIdColumnValue').setValue('');
    } else {
      this.show[index] = false;
      (this.form.get('filters') as FormArray).get(i).get('filterIdColumnValue').setValue('');
    }
    this.checkValidation(index);
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
    this.paginators.index = 0;
    this.paginators.pageSize = 10;
    this.paginationVO.filterValue = [];
    this.dataSource.loadData(this.getPaginationInfo(this.paginationVO));
    this.isLength = false;
    this.filterDataType = {};
  }

  isSelctedIndividual(data: any, event) {
    if (event === null) {
      this.gridService.getGridData(this.paginationVO).subscribe((gridData: any) => {
        if (data.length === gridData.data.length) {
          this.isSelectAll = true;
        } else {
          data.forEach(params => {

            for (let i = 0; i < gridData.data.length; i++) {
              if (params === gridData.data[i].col1) {
                gridData.data[i].col0 = 'select';
              } else if (!data.some(param => param === gridData.data[i].col1)) {
                gridData.data[i].col0 = '';
              }
            }
          });
          this.dataSource.loadChecKBoxData(gridData);
        }

      });
    } else {
      const checked = event.source.checked;
      this.individualSelect.emit({ data, checked });
    }

  }

  isAllSelected(event) {
    const checked = event.source.checked;
    this.isSelectAll = checked;
    this.isSelect.emit({ checked });
  }

  ExcelService() {

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
      this.paginators.index = 0;
      this.paginators.pageSize = 10;
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.dataSource.loadData(this.getPaginationInfo(this.paginationVO));
      this.isLength = false;
      (this.form.get('filters') as FormArray).push(this.addFilter());
    }
    for (let i = 0; i < this.columnHeaders.length; i++) {
      this.columnHeaders[i].style = null;
    }
  }

  clearFilter(): void {
    if ((this.form.get('filterValue').value !== null || this.form.get('filterValue').value !== undefined || this.form.get('filterValue').value !== '')
      && (this.form.get('operator').value !== null || this.form.get('operator').value !== undefined || this.form.get('operator').value !== '')) {
      this.form.get('filterValue').setValue(null);
      this.form.get('operator').setValue(null);
      this.filterCount--;
      for (let i = 0; i < (this.form.get('filters') as FormArray).length; i++) {
        if (this.form.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
          (this.form.get('filters') as FormArray).removeAt(i);
          this.paginationVO.index = 0;
          this.paginators.index = 0;
          this.paginators.pageSize = 10;
          const form = (this.form.get('filters') as FormArray);
          this.paginationVO.filterValue = form.value;
          this.dataSource.loadData(this.getPaginationInfo(this.paginationVO));
          this.isLength = false;
        }
      }
      for (let i = 0; i < this.columnHeaders.length; i++) {
        if (this.columnHeaders[i].headerId === this.columnId) {
          this.columnHeaders[i].style = null;
        }
      }
    }
  }

  filterApply(userForm: NgForm): void {
    let setFilter = false;
    this.addValidations();
    if ((this.form.get('filters') as FormArray).length === 0) {
      (this.form.get('filters') as FormArray).push(this.addFilter());
    }
    for (let i = 0; i < (this.form.get('filters') as FormArray).length; i++) {
      if (this.form.get('filters').get('' + i).get('filterIdColumn').value === this.columnId) {
        setFilter = true;
        this.form.get('filters').get('' + i).get('filterIdColumn').setValue(this.columnId);
        this.form.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.form.get('filterValue').value);
        this.form.get('filters').get('' + i).get('operators').setValue(this.form.get('operator').value);
        this.form.get('filters').get('' + i).get('dataType').setValue(this.filterDatatype);
      } else {
        let array = [];
        array = (this.form.get('filters') as FormArray).value;
        if (!array.some(filter => filter.filterIdColumn === this.columnId)) {
          this.filterCount++;
          if (this.filterCount > 1) {
            (this.form.get('filters') as FormArray).push(this.addFilter());
          }
          let length = (this.form.get('filters') as FormArray).length - 1;
          this.form.get('filters').get('' + length).get('filterIdColumn').setValue(this.columnId);
          this.form.get('filters').get('' + length).get('filterIdColumnValue').setValue(this.form.get('filterValue').value);
          this.form.get('filters').get('' + length).get('operators').setValue(this.form.get('operator').value);
          this.form.get('filters').get('' + length).get('dataType').setValue(this.filterDatatype);
        }
      }
    }
    this.paginationVO.index = 0;
    if (userForm.valid) {
      for (let i = 0; i < this.columnHeaders.length; i++) {
        if (this.columnHeaders[i].headerId === this.columnId) {
          this.columnHeaders[i].style = "color:"+this.themeService.primaryColor+";";
          // this.columnHeaders[i].style = "color:white;width:30px;padding:5px;height:30px;background-color:"+this.themeService.primaryColor+";border-radius:30px;";

        }
      }

      this.input.closeMenu();
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.paginators.index = 0;
      this.paginators.pageSize = 10;
      this.dataSource.loadData(this.getPaginationInfo(this.paginationVO));
      this.isLength = false;
      this.removeValidations();
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

  setDataType(filterColumnName: string) {
    this.filterColumns.forEach(filter => {
      if (filter.headerId === filterColumnName) {
        this.columnValue = filter.headerName;
        this.columnId = filter.headerId;
        if (filter.fieldDataType === 'string' || filter.fieldDataType === 'text') {
          this.filterOperator = 'string';
          this.isDateField = false;
          this.filterDatatype = filter.fieldDataType;
          this.type = 'text';
        } else if (filter.fieldDataType === 'long' ||
          filter.fieldDataType === 'number') {
          this.filterOperator = 'number';
          this.isDateField = false;
          this.filterDatatype = filter.fieldDataType;
          this.type = 'number';
        } else if (filter.fieldDataType === 'date' || filter.fieldDataType === 'timeStamp') {
          this.filterOperator = 'number';
          this.isDateField = true;
          this.filterDatatype = filter.fieldDataType;
          this.type = null;
        }
      }
    });
    let form = (this.form.get('filters') as FormArray);
    this.form.get('filterValue').setValue(null);
    this.form.get('operator').setValue(null);
    for (let i = 0; i < form.length; i++) {
      if (form.get('' + i).get('filterIdColumn').value && form.get('' + i).get('filterIdColumn').value === this.columnId) {
        this.form.get('filterValue').setValue(form.get('' + i).get('filterIdColumnValue').value);
        this.form.get('operator').setValue(form.get('' + i).get('operators').value);
        this.form.get('filterValue').setValidators(null);
        this.form.get('filterValue').setErrors(null);
        this.form.get('operator').setErrors(null);
      }
    }
  }
}


