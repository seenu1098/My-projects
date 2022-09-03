import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';


import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { GridDataSource } from './grid-data.source';
import { GridService } from './grid.service';

import { FormGroup, Form, FormBuilder, FormArray, NgForm, Validators } from '@angular/forms';

import { PaginationVO, FilterValueVO } from './pagination-vo';
import { HeaderVO } from './header-vo';
import { SelectionModel } from '@angular/cdk/collections';
import { GridVO } from './grid-vo';


@Component({
  selector: 'app-yorogrid',
  templateUrl: './yorogrid.component.html',
  styleUrls: ['./yorogrid.component.css']
})
export class YorogridComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: any;

  // tslint:disable-next-line: no-input-rename
  @Input('gridId')
  gridId = '';

  // tslint:disable-next-line: no-input-rename
  @Input('defaultColumn')
  defaultColumn = '';

  @Input('defaultColumnDirection')
  defaultColumnDirection = '';

  // tslint:disable-next-line: no-input-rename
  @Input('filterIdColumn')
  filterIdColumn = '';

  // tslint:disable-next-line: no-input-rename
  @Input('filterIdColumnValue')
  filterIdColumnValue = '';

  // tslint:disable-next-line: no-input-rename

  @Output() messageEvent = new EventEmitter<string>();
  @Output() individualSelect = new EventEmitter<object>();
  @Output() isSelect = new EventEmitter<object>();

  dataSource: GridDataSource;
  selection = new SelectionModel<string>(true, []);

  form: FormGroup;

  headerValues: HeaderVO;
  gridDetail: GridVO;
  filterColumns: any[];
  columns: any[];
  resultsLength: any;
  valid: boolean;
  tableWidth: number;
  procedure: FormGroup;
  success: boolean;
  filterOption: boolean;
  paginationVO = new PaginationVO();
  show = [] as boolean[];
  isSelectAll: boolean;

  constructor(private fb: FormBuilder, private gridService: GridService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.form = this.fb.group({
      filters: this.fb.array([
        this.addFilter()
      ])
    });
    if (this.form.get('filters').value.length === 1) {
      (this.form.get('filters') as FormArray).push(this.addFilter());
    }
    // tslint:disable-next-line: triple-equals
    if (this.gridId == '') {
      return;
    }

    // tslint:disable-next-line: triple-equals
    if (this.defaultColumn == '') {
      return;
    }

    this.dataSource = new GridDataSource(this.gridService);
    this.gridService.getGridDetail(this.gridId).subscribe(data => {
      this.tableWidth = data.widthPercentage;
      this.filterOption = data.filterable;
  });
    this.dataSource.loadClaims(this.getPaginationInfo(this.paginationVO));
    this.dataSource.getCount().subscribe(data => { this.resultsLength = data; });
      this.gridService.getHeaders(this.gridId).subscribe(data => {
      this.headerValues = data;
      const len = this.headerValues.headers.length;

      this.columns = [];
      this.filterColumns = [];
      for (let i = 0; i < len; i++) {
        const columnData = {
          columnDef: this.headerValues.headersIdList[i], header: this.headerValues.headers[i],
          style: this.headerValues.width[i], sortable: this.headerValues.sortable[i],
          filterable: this.headerValues.filterable[i], fieldType: this.headerValues.fieldType[i],
        };
        if (this.headerValues.filterable[i] === true) {
          this.filterColumns.push(columnData);
        }
        this.columns.push(columnData);
      }
      this.displayedColumns = this.headerValues.headersIdList;
    });

    this.gridService.change.subscribe(data => {
      if (data['__gridId'] && this.gridId === data['__gridId']) {
        if (this.filterIdColumnValue !== data[this.filterIdColumn]) {
          this.filterIdColumnValue = data[this.filterIdColumn];
          this.refreshGrid();
        }
      }
    });

  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit() {
    merge(this.sort.sortChange, this.paginator.page).subscribe(() => this.dataSource.loadClaims(this.getPaginationInfo(this.paginationVO)));
  }
  getPaginationInfo(pagination: PaginationVO) {

    this.paginationVO.gridId = this.gridId;
    this.paginationVO.index = this.paginator.pageIndex;
    this.paginationVO.size = this.paginator.pageSize;

    if (this.sort.direction === '' || this.sort.direction === undefined) {
      if (this.defaultColumnDirection === '') {
        this.defaultColumnDirection = 'asc';
      }
      this.paginationVO.direction = this.defaultColumnDirection;
    } else {
      this.paginationVO.direction = this.sort.direction;
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
    this.paginationVO.id =  this.filterIdColumn ;

    const page = this.paginationVO;
    if (this.filterIdColumn && this.filterIdColumn.length > 0 && this.filterIdColumnValue && this.filterIdColumnValue.length > 0) {
      page.id = this.filterIdColumnValue;
    }

    return page;
  }

  refreshGrid() {
    this.isSelectAll = false;
    this.paginator.pageIndex = 0;
    this.sort.active = this.defaultColumn;
    this.sort.direction = '';
    this.sort._stateChanges.next();

    this.dataSource.loadClaims(this.getPaginationInfo(this.paginationVO));
  }

  onRowClicked(data: any ) {
     this.messageEvent.emit(data);
  }
  isSelctedIndividual(data: any, event) {
    const checked = event.source.checked;
    this.individualSelect.emit({ data, checked });
  }
  isAllSelected(event) {
    const checked = event.source.checked;
    this.isSelectAll = checked;
    this.isSelect.emit({ checked });
  }

  addAnotherFilter(event): void {
    let j = 0;
    if (event) {
      j = 2;
    } else {
      j = 1;
    }
    for (let i = 0; i < j; i++) {
      (this.form.get('filters') as FormArray).push(this.addFilter());
    }
  }
  removeThisService(i: number) {
    (this.form.get('filters') as FormArray).removeAt(i);
  }

  addFilter(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: ['']
    });

  }

  searchFilter(userForm: NgForm) {
    this.paginationVO.index = 0;
    if (userForm.valid) {
      const form = (this.form.get('filters') as FormArray);
      for (let i = 0; i < form.length; i++) {
        const index = '' + i;
        const filterValue = form.get(index).get('filterIdColumn').value;

        if (filterValue) {
          this.paginationVO.filterValue.push(new FilterValueVO());
          this.paginationVO.filterValue[i].filterIdColumn = form.get(index).get('filterIdColumn').value.columnDef;
          this.paginationVO.filterValue[i].operators = form.get(index).get('operators').value;
          this.paginationVO.filterValue[i].filterIdColumnValue = form.get(index).get('filterIdColumnValue').value;
        }
      }
      this.dataSource.loadClaims(this.getPaginationInfo(this.paginationVO));
    }
  }

  checkValidation(event, index) {
    const i = '' + index;
    const form = (this.form.get('filters') as FormArray).get(i);
    const filterIdColumnValue = form.get('filterIdColumnValue');
    const operators = form.get('operators');
    const filterIdColumn = form.get('filterIdColumn');

    if (filterIdColumnValue.value) {
      operators.setValidators([Validators.required]);
      filterIdColumn.setValidators([Validators.required]);
    } else if (operators.value) {
      filterIdColumnValue.setValidators([Validators.required]);
      filterIdColumn.setValidators([Validators.required]);
    } else if (filterIdColumn.value) {
      operators.setValidators([Validators.required]);
      filterIdColumnValue.setValidators([Validators.required]);
    }
    operators.updateValueAndValidity();
    filterIdColumnValue.updateValueAndValidity();
    filterIdColumn.updateValueAndValidity();
  }

  selectionChange(event, index) {
    const i = '' + index;
    if (event.fieldType === 'date') {
      this.show[index] = true;
      (this.form.get('filters') as FormArray).get(i).get('filterIdColumnValue').setValue('');
    } else {
      this.show[index] = false;
      (this.form.get('filters') as FormArray).get(i).get('filterIdColumnValue').setValue('');
    }
    this.checkValidation(event, index);
  }
  
  reset() {
    this.form.reset();
    this.paginationVO.index = 0;
    this.paginationVO.filterValue = [];
    this.dataSource.loadClaims(this.getPaginationInfo(this.paginationVO));
  }

}

