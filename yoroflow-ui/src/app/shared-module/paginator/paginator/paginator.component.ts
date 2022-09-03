import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { interval, Observable } from 'rxjs';
// import { ReportGenerateComponent } from 'src/app/designer-module/report-generate/report-generate.component';
import { Pagination, Paginator } from '../paginatorVO';
import { PaginatorService } from './paginator.service';

export class DisplayPageNumbers {
  number: number;
  color: boolean;
}

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {

  @Input() pageSizeOptions: any;
  @Input() length: number;
  @Input() pageSize: number;
  @Output() page: EventEmitter<any> = new EventEmitter<any>();
  form: FormGroup;
  displayPageNumbers: DisplayPageNumbers[] = [];
  paginators = new Paginator();
  pagination = new Pagination();
  startData: any;
  endData: any;
  lastPageIcon = true;
  firstPageIcon = false;
  nextPageIcon = true;
  beforePageIcon = false;
  totalRecordsSub: any;
  primaryLength: number;

  constructor(private paginatorService: PaginatorService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      pageSize: [+this.pageSize],
    });
    this.primaryLength = this.length;
    let displayNumbers: any[];
    this.paginators.totalRecords = this.length;
    this.paginators.index = 0;
    this.paginators.pageSize = +this.pageSize;
    this.pagination = this.paginatorService.setPaginator(this.paginators);
    this.startData = this.pagination.startData;
    this.endData = this.pagination.endData;
    displayNumbers = this.paginatorService.setDisplayNumbers(this.paginators);
    this.displayPageNumbers = [];
    if (displayNumbers.length > 1) {
      this.nextPageIcon = true;
      this.lastPageIcon = true;
    } else {
      this.nextPageIcon = false;
      this.lastPageIcon = false;
    }
    this.setDefaultdisplayNumbers(displayNumbers);
    this.loadDynamicLength();
  }

  loadDynamicLength(): void {
    const sub = Observable.interval(500).subscribe(val => {
      if (this.primaryLength !== this.length) {
        this.primaryLength = this.length;
        let displayNumbers: any[];
        this.paginators.totalRecords = this.length;
        if (!this.paginatorService.dataTableEdit) {
          this.paginators.index = 0;
          this.paginators.pageSize = +this.pageSize;
        }
        this.pagination = this.paginatorService.setPaginator(this.paginators);
        this.startData = this.pagination.startData;
        this.endData = this.pagination.endData;
        displayNumbers = this.paginatorService.setDisplayNumbers(this.paginators);
        this.displayPageNumbers = [];
        if (displayNumbers.length > 1) {
          this.nextPageIcon = true;
          this.lastPageIcon = true;
        } else {
          this.nextPageIcon = false;
          this.lastPageIcon = false;
        }
        this.setDefaultdisplayNumbers(displayNumbers);
      }
    });
  }

  setDefaultdisplayNumbers(displayNumbers) {
    if (displayNumbers.length > 0) {
      for (let i = 0; i < displayNumbers.length; i++) {
        const displayNumber = new DisplayPageNumbers();
        displayNumber.number = displayNumbers[i];
        displayNumber.color = false;
        this.displayPageNumbers.push(displayNumber);
      }
      if (!this.paginatorService.dataTableEdit) {
      this.displayPageNumbers[0].color = true;
      } else {
        this.displayPageNumbers[this.paginators.index].color = true;
      }
    }
  }

  getPageSize(event) {
    let displayNumbers: any[];
    this.paginators.pageSize = +event.value;
    this.pageSize = +event.value;
    displayNumbers = this.paginatorService.setDisplayNumbers(this.paginators);
    if (this.paginatorService.totalIndex !== 1) {
      this.lastPageIcon = true;
      this.nextPageIcon = true;
    } else {
      this.lastPageIcon = false;
      this.nextPageIcon = false;
    }
    this.firstPageIcon = false;
    this.beforePageIcon = false;
    this.displayPageNumbers = [];
    for (let i = 0; i < displayNumbers.length; i++) {
      const displayNumber = new DisplayPageNumbers();
      displayNumber.number = displayNumbers[i];
      displayNumber.color = false;
      this.displayPageNumbers.push(displayNumber);
      this.displayPageNumbers[0].color = true;
    }
    this.startData = 1;
    if (event.value < this.length) {
      this.endData = event.value;
    } else {
      this.endData = this.length;
    }
    this.paginators.index = 0;
    this.page.emit(this.paginators);
  }

  getData(index: number) {
    if (this.paginators.index !== index) {
      let displayNumbers: any[];
      this.paginators.index = index;
      displayNumbers = this.paginatorService.setDisplayNumbers(this.paginators);
      if (index === 0) {
        this.lastPageIcon = true;
        this.nextPageIcon = true;
        this.firstPageIcon = false;
        this.beforePageIcon = false;
      } else if (index > 0) {
        this.firstPageIcon = true;
        this.beforePageIcon = true;
      }
      if (this.paginatorService.totalIndex - 1 === index) {
        this.lastPageIcon = false;
        this.nextPageIcon = false;
      } else if (index < this.paginatorService.totalIndex - 1) {
        this.lastPageIcon = true;
        this.nextPageIcon = true;
      }
      if (displayNumbers !== null && displayNumbers !== undefined && displayNumbers !== []) {
        this.displayPageNumbers = [];
        for (let i = 0; i < displayNumbers.length; i++) {
          const displayNumber = new DisplayPageNumbers();
          displayNumber.number = displayNumbers[i];
          displayNumber.color = false;
          this.displayPageNumbers.push(displayNumber);
          if (displayNumbers[i] === this.paginators.index + 1) {
            this.displayPageNumbers[i].color = true;
          }
        }
      }
      this.pagination = this.paginatorService.setPaginator(this.paginators);
      this.startData = this.pagination.startData;
      this.endData = this.pagination.endData;
      this.paginators.pageSize = +this.form.get('pageSize').value;
      this.page.emit(this.paginators);
    }
  }

  setFirstPage() {
    this.lastPageIcon = true;
    this.nextPageIcon = true;
    this.firstPageIcon = false;
    this.beforePageIcon = false;
    let displayNumbers: any[];
    this.paginators.index = 0;
    displayNumbers = this.paginatorService.setDisplayNumbers(this.paginators);
    this.displayPageNumbers = [];
    for (let i = 0; i < displayNumbers.length; i++) {
      const displayNumber = new DisplayPageNumbers();
      displayNumber.number = displayNumbers[i];
      displayNumber.color = false;
      this.displayPageNumbers.push(displayNumber);
    }
    this.displayPageNumbers[0].color = true;
    this.pagination = this.paginatorService.setFirstpage(this.paginators);
    this.startData = this.pagination.startData;
    this.endData = this.pagination.endData;
    this.paginators.pageSize = +this.form.get('pageSize').value;
    this.page.emit(this.paginators);
  }

  setBeforePage() {
    let displayNumbers: any[];
    this.paginators.index = this.paginators.index - 1;
    if (this.paginators.index === 0) {
      this.firstPageIcon = false;
      this.beforePageIcon = false;
    }
    this.lastPageIcon = true;
    this.nextPageIcon = true;

    displayNumbers = this.paginatorService.setDisplayNumbers(this.paginators);
    this.displayPageNumbers = [];
    for (let i = 0; i < displayNumbers.length; i++) {
      const displayNumber = new DisplayPageNumbers();
      displayNumber.number = displayNumbers[i];
      displayNumber.color = false;
      this.displayPageNumbers.push(displayNumber);
      if (displayNumbers[i] === this.paginators.index + 1) {
        this.displayPageNumbers[i].color = true;
      }
    }
    this.pagination = this.paginatorService.setPreviousPage(this.paginators);
    this.startData = this.pagination.startData;
    this.endData = this.pagination.endData;
    this.paginators.pageSize = +this.form.get('pageSize').value;
    this.page.emit(this.paginators);
  }

  setNextPge() {
    let displayNumbers: any[];
    this.paginators.index = this.paginators.index + 1;
    displayNumbers = this.paginatorService.setDisplayNumbers(this.paginators);
    if (this.paginators.index === this.paginatorService.totalIndex - 1) {
      this.lastPageIcon = false;
      this.nextPageIcon = false;
    }
    this.firstPageIcon = true;
    this.beforePageIcon = true;
    this.displayPageNumbers = [];
    for (let i = 0; i < displayNumbers.length; i++) {
      const displayNumber = new DisplayPageNumbers();
      displayNumber.number = displayNumbers[i];
      displayNumber.color = false;
      this.displayPageNumbers.push(displayNumber);
      if (displayNumbers[i] === this.paginators.index + 1) {
        this.displayPageNumbers[i].color = true;
      }
    }
    this.pagination = this.paginatorService.setPreviousPage(this.paginators);
    this.startData = this.pagination.startData;
    this.endData = this.pagination.endData;
    this.paginators.pageSize = +this.form.get('pageSize').value;
    this.page.emit(this.paginators);
  }

  setLastPage() {
    this.lastPageIcon = false;
    this.nextPageIcon = false;
    this.firstPageIcon = true;
    this.beforePageIcon = true;
    let displayNumbers: any[];
    this.pagination = this.paginatorService.setLastPage(this.paginators);
    this.startData = this.pagination.startData;
    this.endData = this.pagination.endData;
    this.paginators.index = this.pagination.index;
    displayNumbers = this.paginatorService.setDisplayNumbers(this.paginators);
    this.displayPageNumbers = [];
    for (let i = 0; i < displayNumbers.length; i++) {
      const displayNumber = new DisplayPageNumbers();
      displayNumber.number = displayNumbers[i];
      displayNumber.color = false;
      this.displayPageNumbers.push(displayNumber);
      if (displayNumbers[i] === this.paginators.index + 1) {
        this.displayPageNumbers[i].color = true;
      }
    }
    this.paginators.pageSize = +this.form.get('pageSize').value;
    this.page.emit(this.paginators);
  }
}
