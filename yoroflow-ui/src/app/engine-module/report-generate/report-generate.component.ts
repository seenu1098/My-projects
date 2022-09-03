import { startWith } from 'rxjs/operators';
import { OrgPrefrenceService } from './../../shared-module/services/org-prefrence.service';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, HostListener, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, SortDirection } from '@angular/material/sort';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { merge } from 'rxjs/internal/observable/merge';
import { saveAs } from 'file-saver';
import { ThemeService } from 'src/app/services/theme.service';
import { ReportConfigurationService } from 'src/app/designer-module/report-configuration/report-configuration.service';
import { ReportHeadersVo, ReportGenerationVo, FilterValueVoList, PaginationVO } from 'src/app/designer-module/report-configuration/report-config-vo';
import { Paginator } from 'src/app/shared-module/paginator/paginatorVO';
import { YoroflowEngineService } from '../engine.service';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

@Component({
  selector: 'app-report-generate',
  templateUrl: './report-generate.component.html',
  styleUrls: ['./report-generate.component.scss']
})
export class ReportGenerateComponent implements OnInit {

  constructor(private fb: FormBuilder, private reportConfigurationService: ReportConfigurationService,
    private datepipe: DatePipe, private router: Router, private orgPrfrenceService: OrgPrefrenceService,
    private snackBar: MatSnackBar, public activateRoute: ActivatedRoute, public changeDetectorRef: ChangeDetectorRef,
    private themeService: ThemeService, private engineService: YoroflowEngineService) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('menuTrigger') input;

  @Output() public totalRecordsEmit: EventEmitter<any> = new EventEmitter<any>();
  
  public config: PerfectScrollbarConfigInterface = {};

  loadMatMenu = false;
  form: FormGroup;
  paginators = new Paginator();
  dateSearchForm: FormGroup;
  reportId: any;
  displayedColumns: string[] = [];
  reportHeader: ReportHeadersVo[] = [];
  reportVO = new ReportGenerationVo();
  totalRecords: any;
  reportResult: any[] = [];
  pageSize = 10;
  columnValue: any;
  filterOperator: string;
  columnId: any;
  screenWidth: any;
  repeatablefieldId: any;
  filterValueVoList: FilterValueVoList[] = [];
  isDateField = false;
  filterDatatype: any;
  type = 'text';
  isFilterEnable = false;
  paginationVO = new PaginationVO();
  selectedSearch: any;
  showList = '';
  validDateSearch = true;
  emptyValue = true;
  maxDate: any;
  reportUrl = '';
  reportTitle = '';
  isPaginator = false;
  isLength = false;
  hasList = true;
  hasHeaders = false;
  errorOccured = false;
  dataType = {
    number: [{ value: 'eq', description: 'equals' },
    { value: 'ne', description: 'not equals' },
    { value: 'gt', description: 'greater than' },
    { value: 'ge', description: 'greater than or equal to' },
    { value: 'lt', description: 'less than' },
    { value: 'le', description: 'less than or equal to' },
    ],
    string: [
      { value: 'eq', description: 'equals' },
      { value: 'ne', description: 'not equals' },
      { value: 'bw', description: 'begins with' },
      { value: 'ew', description: 'ends with' },
      { value: 'cn', description: 'contains' },
    ]
  };
  @HostListener('scroll', ['$event'])
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    if (this.muenuClose === false) {
      this.loadDynamicLayout();
    } else {
      this.screenWidth = (window.innerWidth - 80) + 'px';
    }
  }

  filterCount = 0;
  hasDefaultPagesize = false;
  muenuClose = false;
  ngOnInit(): void {
    this.loadDynamicLayout();
    this.engineService.menuCloseEmitter.subscribe(data => {
      this.muenuClose = true;
      this.screenWidth = (window.innerWidth - 80) + 'px';
    });
    this.activateRoute.paramMap.subscribe(params => {
      if (params.get('id') !== null && this.reportId !== params.get('id')) {
        this.reportId = params.get('id');
        this.isPaginator = false;
        this.isLength = false;
        this.paginationVO.taskStatus = 'IN_PROCESS';
        if (this.dateSearchForm !== undefined) {
          this.dateSearchForm.reset();
          this.dateSearchForm.get('searchType').setValue('all');
          this.dateSearchForm.get('statusType').setValue('IN_PROCESS');
          this.selectedSearch = '';
          this.clearDateSearchValidation();
        }
        this.reportHeader = [];
        this.reportResult = [];
        this.emptyValue = true;
        this.totalRecords = '';
        this.displayedColumns = [];
        this.reportTitle = '';
        this.getReportdata('load', true);

        this.changeDetectorRef.markForCheck();
      }
    });
    this.form = this.fb.group({
      filterValue: [''],
      operator: [''],
      filters: this.fb.array([
        this.addFilter()
      ])
    });
    this.dateForm();
    this.maxDate = new Date();
    this.loadMatMenu = true;
  }

  loadDynamicLayout(): void {
    this.screenWidth = (window.innerWidth - 280) + 'px';
  }


  getReportdata(value, getPaginator: boolean) {
    this.errorOccured = false;
    this.reportConfigurationService.getGeneratedReport(this.getPaginationInfo(getPaginator)).subscribe(reportData => {
      this.showList = this.selectedSearch;
      this.selectedSearch = '';
      if (reportData.reportHeaders !== undefined && reportData.reportHeaders !== null) {
        if (value === 'load') {
          this.reportHeader = reportData.reportHeaders;
          this.reportTitle = reportData.reportName;
          this.loadDisplayColumns();
          this.hasHeaders = true;
        }
        this.emptyValue = false;
        this.reportResult = reportData.data;
        if (this.totalRecords !== reportData.totalRecords) {
          this.isLength = false;
          this.isPaginator = false;
        }
        this.totalRecords = reportData.totalRecords;
        if (this.totalRecords !== 0 && this.totalRecords !== '0') {
          this.isLength = true;
          this.hasList = true;
        } else {
          this.isLength = false;
          this.hasList = false;
        }
        this.isPaginator = true;
        this.reportVO = reportData;
      } else if (reportData.reportName !== undefined && reportData.reportName !== null) {
        this.reportTitle = reportData.reportName;
        this.reportResult = [];
        this.emptyValue = true;
        this.hasList = false;
        this.totalRecords = '';
        this.isPaginator = false;
        reportData = new ReportGenerationVo();
      } else {
        // this.reportHeader = [];
        // this.loadDisplayColumns();
        this.reportResult = [];
        this.emptyValue = true;
        this.isPaginator = false;
        this.totalRecords = '';
        this.hasList = false;
        reportData = new ReportGenerationVo();
      }
    },
      error => {
        this.errorOccured = true;
        this.hasList = false;
      });
  }

  getPaginationInfo(getPaginator: boolean) {

    if (this.sort?.direction !== undefined) {
      this.paginationVO.direction = this.sort.direction;
    }
    if (this.sort?.direction === '' || this.sort?.direction === undefined || this.sort?.direction === null) {
      this.paginationVO.direction = 'asc';
    }
    if (this.sort?.active === '' || this.sort?.active === undefined) {
      // this.sort?.active = 'p.start_time';
      this.paginationVO.columnName = 'p.start_time';
    }
    if (this.sort?.active !== undefined) {
      this.paginationVO.columnName = this.sort.active;
    }
    this.paginationVO.processInstanceId = this.reportId;
    if (this.paginators && getPaginator) {
      this.paginationVO.index = this.paginators.index;
      this.paginationVO.size = this.paginators.pageSize;
    } else {
      this.paginationVO.index = 0;
    }
    if (this.paginationVO.size === undefined) {
      this.paginationVO.size = this.pageSize;
    }
    return this.paginationVO;
  }

  loadDisplayColumns() {
    this.displayedColumns = [];
    if (this.reportHeader.length > 0) {
      this.reportHeader.forEach(header => {
        this.displayedColumns.push(header.headerId);
      });
    }
  }

  setDataType(headerDetails, headerId) {
    if (headerId.startsWith('ya_count')) {
      this.filterOperator = 'number';
      this.isDateField = false;
      this.type = 'number';
    } else
    if (headerDetails.datatype === 'string' || headerDetails.datatype === 'text') {
      this.filterOperator = 'string';
      this.isDateField = false;
      this.type = 'text';
    } else if (headerDetails.datatype === 'long' ||
      headerDetails.datatype === 'number' ||
      headerDetails.datatype === 'float') {
      this.filterOperator = 'number';
      this.isDateField = false;
      this.type = 'number';
    } else if (headerDetails.datatype === 'date' || headerDetails.datatype === 'timeStamp') {
      this.filterOperator = 'number';
      this.isDateField = true;
      this.type = null;
    }
    this.filterDatatype = headerDetails.datatype;
    this.columnValue = headerDetails.fieldId;
    this.columnId = headerId;
    this.repeatablefieldId = headerDetails.repeatableFieldId;
    if (!this.filterValueVoList.some(filter => filter.columnId === headerId)) {
      const filterValueVo = new FilterValueVoList();
      filterValueVo.columnId = headerId;
      filterValueVo.filterDatatype = headerDetails.datatype;
      filterValueVo.repeatablefieldId = headerDetails.repeatableFieldId;
      this.filterValueVoList.push(filterValueVo);
      if (this.filterValueVoList.length > 0) {
        (this.form.get('filters') as FormArray).push(this.addFilter());
      }
    }

    let form = (this.form.get('filters') as FormArray);
    this.form.get('filterValue').setValue(null);
    this.form.get('operator').setValue(null);

    for (let i = 0; i < form.length; i++) {
      if (form.get('' + i).get('filterIdColumn').value && form.get('' + i).get('filterIdColumn').value
        === this.columnId) {
        this.form.get('filterValue').setValue(form.get('' + i).get('filterIdColumnValue').value);
        this.form.get('operator').setValue(form.get('' + i).get('operators').value);
        this.form.get('filterValue').setValidators(null);
        this.form.get('filterValue').setErrors(null);
        this.form.get('operator').setErrors(null);
      }
    }
  }

  addFilter(): FormGroup {
    return this.fb.group({
      filterIdColumn: [''],
      operators: [''],
      filterIdColumnValue: [''],
      filterDataType: [''],
      repeatableFieldId: ['']
    });
  }

  ngAfterViewInit() {
    this.changeDetectorRef.markForCheck();
    if (this.sort?.sortChange !== undefined) {
      merge(this.sort.sortChange).subscribe(() => this.getReportdata('notload', true));
    }

  }

  clearAllFilter() {
    let allowLoadData = false;
    if (this.selectedSearch !== '' || this.selectedSearch !== null || this.selectedSearch === undefined) {
      allowLoadData = true;
    }
    this.clearDateSearch();
    if ((this.form.get('filters') as FormArray).length > 1
      || ((this.form.get('filters') as FormArray).length === 1 &&
        this.form.get('filters').get('' + 0).get('filterIdColumnValue').value !== null
        && this.form.get('filters').get('' + 0).get('filterIdColumnValue').value !== undefined
        && this.form.get('filters').get('' + 0).get('filterIdColumnValue').value !== '')) {
      const length = (this.form.get('filters') as FormArray).length;
      allowLoadData = false;
      this.form.get('filterValue').setValue(null);
      this.form.get('operator').setValue(null);
      this.form.get('filterValue').setValidators(null);
      this.form.get('operator').setValidators(null);
      this.form.get('filterValue').updateValueAndValidity();
      this.form.get('operator').updateValueAndValidity();
      for (let i = 0; i < length; i++) {
        (this.form.get('filters') as FormArray).removeAt(0);
        this.filterValueVoList.splice(0, 1);
      }
      this.paginationVO.index = 0;
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.getReportdata('notload', false);
      (this.form.get('filters') as FormArray).push(this.addFilter());
      this.form.markAsUntouched();
    }
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.reportHeader.length; i++) {
      this.reportHeader[i].style = null;
    }
    if (allowLoadData) {
      this.getReportdata('notload', false);
    }
    this.emptyPaginator();
  }

  emptyPaginator() {
    this.isPaginator = false;
    this.isLength = false;
  }

  clearFilter() {
    if ((this.form.get('filterValue').value !== null || this.form.get('filterValue').value !== undefined
      || this.form.get('filterValue').value !== '')
      && (this.form.get('operator').value !== null || this.form.get('operator').value !== undefined || this.form.get('operator').value !== '')) {
      this.form.get('filterValue').setValue(null);
      this.form.get('operator').setValue(null);
      this.form.get('filterValue').setValidators(null);
      this.form.get('operator').setValidators(null);
      this.form.get('filterValue').updateValueAndValidity();
      this.form.get('operator').updateValueAndValidity();
      this.filterCount--;
      let j = 0;
      for (let i = 0; i < this.filterValueVoList.length; i++) {
        j++;
        if (this.form.get('filters').get('' + j).get('filterIdColumn').value === '') {
          j++;
        }

        if (j <= this.filterValueVoList.length && this.filterValueVoList[i].columnId === this.form.get('filters').get('' + j).get('filterIdColumn').value) {
          (this.form.get('filters') as FormArray).removeAt(j);
          this.paginationVO.index = 0;
          const form = (this.form.get('filters') as FormArray);
          this.paginationVO.filterValue = form.value;
          this.emptyPaginator();
          this.getReportdata('notload', false);
          this.filterValueVoList.splice(i, 1);
          this.form.markAsUntouched();
        }
      }
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.reportHeader.length; i++) {
        if (this.reportHeader[i].headerId === this.columnId) {
          this.reportHeader[i].style = null;
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

  filterApply(userForm: NgForm): void {
    let setFilter = false;
    this.addValidations();
    if ((this.form.get('filters') as FormArray).length === 0) {
      (this.form.get('filters') as FormArray).push(this.addFilter());
    }
    for (let i = 0; i < this.filterValueVoList.length; i++) {
      if (this.form.get('filters').get('' + i).get('filterIdColumn').value === this.filterValueVoList[i].columnId) {
        setFilter = true;
        this.form.get('filters').get('' + i).get('filterIdColumn').setValue(this.filterValueVoList[i].columnId);
        this.form.get('filters').get('' + i).get('filterIdColumnValue').setValue(this.form.get('filterValue').value);
        this.form.get('filters').get('' + i).get('operators').setValue(this.form.get('operator').value);
        this.form.get('filters').get('' + length).get('filterDataType').setValue(this.filterValueVoList[i].filterDatatype);
        this.form.get('filters').get('' + length).get('repeatableFieldId').setValue(this.filterValueVoList[i].repeatablefieldId);
      } else {
        let array = [];
        array = (this.form.get('filters') as FormArray).value;
        if (!array.some(filter => filter.filterIdColumn === this.filterValueVoList[i].columnId)) {
          this.filterCount++;
          let length = (this.form.get('filters') as FormArray).length - 1;
          this.form.get('filters').get('' + length).get('filterIdColumn').setValue(this.filterValueVoList[i].columnId);
          this.form.get('filters').get('' + length).get('filterIdColumnValue').setValue(this.form.get('filterValue').value);
          this.form.get('filters').get('' + length).get('operators').setValue(this.form.get('operator').value);
          this.form.get('filters').get('' + length).get('filterDataType').setValue(this.filterValueVoList[i].filterDatatype);
          this.form.get('filters').get('' + length).get('repeatableFieldId').setValue(this.filterValueVoList[i].repeatablefieldId);
        }
      }
    }
    this.paginationVO.index = 0;
    if (userForm.valid) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.reportHeader.length; i++) {
        if (this.reportHeader[i].headerId === this.columnId) {
          this.reportHeader[i].style = 'color:' + this.themeService.primaryColor + ';';
        }
      }
      this.input.closeMenu();
      const form = (this.form.get('filters') as FormArray);
      this.paginationVO.filterValue = form.value;
      this.getReportdata('notload', false);
      this.emptyPaginator();
      this.removeValidations();
    }
  }

  dateSearch(event) {
    const value = event.value;
    if (value === 'betweenDates') {
      this.dateSearchForm.get('startDate').setValidators([Validators.required]);
      this.dateSearchForm.get('endDate').setValidators([Validators.required]);
      this.dateSearchForm.get('startDate').updateValueAndValidity();
      this.dateSearchForm.get('endDate').updateValueAndValidity();
    } else {
      this.clearDateSearchValidation();
    }
  }

  searchByDefault() {
    const value = this.dateSearchForm.get('searchType').value;
    const taskStatus = this.dateSearchForm.get('statusType').value;
    this.hasList = true;
    this.paginationVO.taskStatus = taskStatus;
    if (value === 'betweenDates') {
      this.selectedSearch = value;
      this.dateValidation();
      if (this.dateSearchForm.valid) {
        this.paginationVO.dateSearch = this.selectedSearch;

        this.paginationVO.startDate = this.dateSearchForm.get('startDate').value;
        this.paginationVO.endDate = this.dateSearchForm.get('endDate').value;
        this.getReportdata('notload', false);
      }
    } else {
      if (this.dateSearchForm.get('searchType').value !== 'all') {
        this.paginationVO.dateSearch = value;
      } else {
        this.paginationVO.dateSearch = '';
      }
      this.selectedSearch = value;
      this.paginationVO.startDate = '';
      this.paginationVO.endDate = '';
      this.getReportdata('notload', false);
    }
    this.emptyPaginator();
  }

  clearDateSearchValidation() {
    this.dateSearchForm.get('startDate').setValidators(null);
    this.dateSearchForm.get('endDate').setValidators(null);
    this.dateSearchForm.get('startDate').updateValueAndValidity();
    this.dateSearchForm.get('endDate').updateValueAndValidity();
  }

  clearDateSearch() {
    this.dateSearchForm.reset();
    this.clearDateSearchValidation();
    this.dateSearchForm.get('searchType').setValue('all');
    this.dateSearchForm.get('statusType').setValue('IN_PROCESS');
    this.paginationVO.dateSearch = '';
    this.selectedSearch = '';
    this.paginationVO.startDate = '';
    this.paginationVO.endDate = '';
    this.paginationVO.taskStatus = 'IN_PROCESS';
  }

  dateValidation() {
    if (this.dateSearchForm.get('startDate').value > this.dateSearchForm.get('endDate').value) {
      this.dateSearchForm.get('startDate').setErrors({ greaterValue: true });
    }
    if (this.dateSearchForm.get('startDate').value === '') {
      this.dateSearchForm.get('startDate').markAsTouched();
    }
    if (this.dateSearchForm.get('endDate').value === '') {
      this.dateSearchForm.get('endDate').markAsTouched();
    }
  }

  dateForm() {
    this.dateSearchForm = this.fb.group({
      searchType: ['all'],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      statusType: ['IN_PROCESS']
    });
  }

  checkDate(value: string) {
    if (value !== undefined && value != null) {
      if (value.includes('0Z')) {
        return this.getBrowsertime(value, false);
      } else if (value.endsWith('ya_sum')) {
        return value.replace('ya_sum', '');
      } else {
        return value;
      }
    }
    return '';
  }

  setStyleForSum(value: string) {
    if (value !== undefined && value != null) {
      if (value.endsWith('ya_sum')) {
        return 'font-weight: bold; border: 1px solid black; background-color: #f4f4d7';
      } else {
        return 'font-weight: normal;';
      }
    }
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

  pageEvent(event) {
    this.paginators = event;
    this.getReportdata('notLoad', true);
  }

  showMatIcon(value: string) {
    let show = true;
    if (value !== undefined && value != null) {
      if (value.startsWith('ya_sum') || value.startsWith('ya_avg') || value.startsWith('ya_count')) {
        show = false;
      }
    }
    return show;
  }

  getEmptyMsgValue() {
    let msg = $localize`:@@noDataForSelectedFilter:No data available for filter type(`;
    if (this.dateSearchForm.get('searchType').value === 'all') {
      msg = $localize`:@@noData:No data available`;
    } else {
      msg = msg + this.getValue() + ')';
    }
    return msg;
  }

  getValue() {
    let value = '';
    if (this.showList === 'yesterday') {
      value = 'Yesterday';
    } else if (this.showList === 'today') {
      value = 'Today';
    } else if (this.showList === 'lastWeek') {
      value = 'Last 7 days';
    } else if (this.showList === 'lastMonth') {
      value = 'Last 30 days';
    } else if (this.showList === 'last2Month') {
      value = 'Last 60 days';
    } else if (this.showList === 'betweenDates') {
      value = $localize`:@@customDates:Custom dates between` + this.getBrowsertime(this.dateSearchForm.get('startDate').value, true) + $localize`:@@customDatesAnd:and`
        + this.getBrowsertime(this.dateSearchForm.get('endDate').value, true);
    }
    return value;
  }

  excelService() {
    this.reportConfigurationService.getExcelData(this.paginationVO).subscribe((response) => {
      const blob = new Blob([response], { type: 'xlsx' });
      saveAs(blob, this.reportVO.reportName + '.xlsx');
    });
  }


}
