import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { WorkLogVo } from '../work-log-dialog/work-log-model';
import { PaginationVO, FilterValuesVO } from 'src/app/mytasks-module/mytasks/pagination-vo';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { merge, BehaviorSubject } from 'rxjs';
import { WorkLogService } from '../work-log-dialog/work-log.service';
import { T } from 'ngx-tethys/util';
import { WorkLogDialogComponent } from '../work-log-dialog/work-log-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-work-log-list',
  templateUrl: './work-log-list.component.html',
  styleUrls: ['./work-log-list.component.scss']
})
export class WorkLogListComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() userList;
  @Input() taskBoardTaskVO;
  paginationVO = new PaginationVO();
  resultsLength: any;
  isPaginator = false;
  isLength = false;
  defaultPageSize = 10;
  displayedColumns: string[] = ['userName', 'timespent', 'workDate', 'description', 'loggedatTime'];
  workLog: WorkLogVo[] = [];


  constructor(private changeDetectorRef: ChangeDetectorRef, private worklogservice: WorkLogService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getWorkListInfo();
  }


  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit() {
    merge(this.sort.sortChange).subscribe(() => this.getWorkListInfo());
    this.changeDetectorRef.detectChanges();
  }

  getWorkListInfo() {
    this.worklogservice.getWorkList(this.getPaginationForWorkLog()).subscribe(d => {
      if (d !== null) {
        this.workLog = d.workLogVoList;
        if (d.totalRecords !== null) {
          this.resultsLength = d.totalRecords;
        } else {
          this.resultsLength = 0;
        }
        this.isPaginator = true;
        this.isLength = true;
      }
    });
  }

  getPaginationForWorkLog() {
    if (this.sort === undefined || this.sort.direction === undefined || this.sort.direction === '' || this.sort.direction === null) {
      this.paginationVO.direction = 'desc';
      this.paginationVO.columnName = this.sort.active;
    } else {
      this.paginationVO.direction = this.sort.direction;
      this.paginationVO.columnName = 'workDate';
    }
    this.paginationVO.taskboardId = this.taskBoardTaskVO.sprintTaskId;
    return this.paginationVO;
  }

  pageEvent(event) {
    this.paginationVO = event;
    this.getWorkListInfo();
  }

  emptyPaginator() {
    this.isPaginator = false;
    this.isLength = false;
  }

  addPaginator() {
    this.isPaginator = true;
    this.isLength = true;
  }

  getUsername(userId: any): string {
    let userName = '';
    const user = this.userList.find(u => u.userId === userId);
    if (user !== null) {
      const firstName = user.firstName;
      const lastName = user.lastName;
      userName = firstName + ' ' + lastName;
    }
    return userName;
  }

  updateWorkLog(row: WorkLogVo) {
    const dialog = this.dialog.open(WorkLogDialogComponent, {
      data: { taskVO: this.taskBoardTaskVO, workLogVo: row },
      disableClose: true,
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === true) {
        this.getWorkListInfo();
      }
    });
  }


  logWorkdialog() {
    const dialog = this.dialog.open(WorkLogDialogComponent, {
      data: { taskVO: this.taskBoardTaskVO },
      disableClose: true,
    });
    dialog.afterClosed().subscribe(data => {
      if (data && data === true) {
        this.getWorkListInfo();
      }
    });
  }
}
