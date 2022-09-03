import { Injectable, Input } from '@angular/core';
import { Pagination, Paginator } from '../paginatorVO';

@Injectable({
  providedIn: 'root'
})
export class PaginatorService {

  constructor() { }

  pagination = new Pagination();
  displayNumbers: any[];
  totalIndex: number;
  dataTableEdit = false;

  setDisplayNumbers(paginator: Paginator) {
    const displayNumbers = [];
    if (paginator.totalRecords % paginator.pageSize === 0) {
      this.totalIndex = Math.round(paginator.totalRecords / paginator.pageSize);
    } else {
      const index = (paginator.totalRecords / paginator.pageSize).toString().split('.', 2);
      this.totalIndex = +index[0] + 1;
    }
    if (paginator.index === 0) {
      if (this.totalIndex >= 5) {
        for (let i = 1; i < 6; i++) {
          displayNumbers.push(i);
        }
      } else {
        for (let i = 1; i < this.totalIndex + 1; i++) {
          displayNumbers.push(i);
        }
      }
    } else if (paginator.index >= this.totalIndex - 2) {
      if (this.totalIndex >= 5) {
        for (let i = this.totalIndex - 4; i < this.totalIndex + 1; i++) {
          displayNumbers.push(i);
        }
      } else {
        for (let i = 1; i < this.totalIndex + 1; i++) {
          displayNumbers.push(i);
        }
      }
    } else {
      if (paginator.index > 2) {
        for (let i = paginator.index - 1; i < paginator.index + 4; i++) {
          displayNumbers.push(i);
        }
      } else {
        for (let i = 1; i < 6; i++) {
          displayNumbers.push(i);
        }
      }
    }
    return displayNumbers;
  }

  setPaginator(paginator: Paginator): Pagination {
    const endData = +((paginator.index + 1) * paginator.pageSize);
    if (endData <= paginator.totalRecords) {
      this.pagination.endData = endData;
    } else {
      this.pagination.endData = paginator.totalRecords;
    }
    this.pagination.startData = endData - (paginator.pageSize - 1);
    this.pagination.index = paginator.index;
    return this.pagination;
  }

  setLastPage(paginator: Paginator): Pagination {
    if (paginator.totalRecords % paginator.pageSize === 0) {
      this.pagination.index = Math.round(paginator.totalRecords / paginator.pageSize) - 1;
    } else {
      const index = (paginator.totalRecords / paginator.pageSize).toString().split('.', 2);
      this.pagination.index = +index[0];
    }
    this.pagination.endData = paginator.totalRecords;
    if (paginator.totalRecords % paginator.pageSize !== 1) {
      this.pagination.startData = paginator.totalRecords - ((paginator.totalRecords % paginator.pageSize) - 1);
    }

    return this.pagination;
  }

  setFirstpage(paginator: Paginator): Pagination {
    this.pagination.index = 0;
    this.pagination.startData = 1;
    this.pagination.endData = paginator.pageSize;

    return this.pagination;
  }

  setPreviousPage(paginator: Paginator): Pagination {
    this.pagination.index = paginator.index - 1;
    const endData = +((paginator.index + 1) * paginator.pageSize);
    if (endData <= paginator.totalRecords) {
      this.pagination.endData = endData;
    } else {
      this.pagination.endData = paginator.totalRecords;
    }
    this.pagination.startData = endData - (paginator.pageSize - 1);

    return this.pagination;
  }

  setNextPage(paginator: Paginator): Pagination {
    this.pagination.index = paginator.index + 1;
    const endData = +((paginator.index + 2) * paginator.pageSize);
    if (endData <= paginator.totalRecords) {
      this.pagination.endData = endData;
    } else {
      this.pagination.endData = paginator.totalRecords;
    }
    this.pagination.startData = endData - (paginator.pageSize - 1);

    return this.pagination;
  }

  setDataTable(dataTable) {
    this.dataTableEdit = dataTable;
  }

}
