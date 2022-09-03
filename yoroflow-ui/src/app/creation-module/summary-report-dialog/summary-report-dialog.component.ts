import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Paginator } from 'src/app/shared-module/paginator/paginatorVO';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { HeaderVO, TaskBoardTaskSummaryVo, WorkflowSummaryVO } from '../summary-report/summary-report-model';
import { SummaryReportService } from '../summary-report/summary-report.service';

@Component({
  selector: 'app-summary-report-dialog',
  templateUrl: './summary-report-dialog.component.html',
  styleUrls: ['./summary-report-dialog.component.scss']
})
export class SummaryReportDialogComponent implements OnInit {

  taskboardSummaryList: TaskBoardTaskSummaryVo[] = [];
  workflowSummaryList: WorkflowSummaryVO[] = [];
  dataSource: any;
  columnHeaders: HeaderVO[] = [];
  displayedColumns: string[] = [];
  title: string;
  paginationVO = new PaginationVO();
  paginators = new Paginator();
  length: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<SummaryReportDialogComponent>,
    private summaryService: SummaryReportService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.data.type === 'taskboard') {
      this.title = 'Taskboard Details';
      this.getTaskboardSummary();
      const header1 = new HeaderVO();
      header1.headerId = 'taskboardName';
      header1.headerName = 'Taskboard Name';
      const header2 = new HeaderVO();
      header2.headerId = 'inProcessCount';
      header2.headerName = 'In Progress';
      const header3 = new HeaderVO();
      header3.headerId = 'completedCount';
      header3.headerName = 'Completed';
      this.columnHeaders.push(header1);
      this.columnHeaders.push(header2);
      this.columnHeaders.push(header3);
      this.displayedColumns = ['taskboardName', 'inProcessCount', 'completedCount'];
      this.length = this.data.workspaceVO?.taskboard?.taskboardCount;
    } else if (this.data.type === 'workflow') {
      this.title = 'Workflow Details';
      this.getWorkflowSummary();
      const header1 = new HeaderVO();
      header1.headerId = 'processDefinitionName';
      header1.headerName = 'Workflow Name';
      const header2 = new HeaderVO();
      header2.headerId = 'inProcessCount';
      header2.headerName = 'In Progress';
      const header3 = new HeaderVO();
      header3.headerId = 'completedCount';
      header3.headerName = 'Completed';
      this.columnHeaders.push(header1);
      this.columnHeaders.push(header2);
      this.columnHeaders.push(header3);
      this.displayedColumns = ['processDefinitionName', 'inProcessCount', 'completedCount'];
      this.length = this.data.workspaceVO?.workflow?.workflowCount;
    } else if (this.data.type === 'group') {
      const matDialogConfig = new MatDialogConfig();
      matDialogConfig.maxHeight = '400px';
      matDialogConfig.width = '600px';
      this.dialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
      this.title = "Teams";
    } else if (this.data.type === 'user') {
      const matDialogConfig = new MatDialogConfig();
      matDialogConfig.maxHeight = '400px';
      matDialogConfig.width = '600px';
      this.dialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
      this.title = 'Users';
    }
  }

  getTaskboardSummary(): void {
    const pagination = new PaginationVO();
    pagination.index = 0;
    pagination.size = 10;
    this.summaryService.getTaskboardSummary(pagination, this.data.workspaceId,this.data.subdomainName).subscribe(data => {
      this.taskboardSummaryList = data;
      this.dataSource = data;
    });
  }

  getWorkflowSummary(): void {
    const pagination = new PaginationVO();
    pagination.index = 0;
    pagination.size = 10;
    this.summaryService.getWorkflowSummary(pagination, this.data.workspaceId,this.data.subdomainName).subscribe(data => {
      this.workflowSummaryList = data;
      this.dataSource = data;
    });
  }

  getPrefix(task: string): string {
    let name = "";
    let array = task.split(' ')
    if (array[0]) {
      name = array[0].charAt(0).toUpperCase()
    }
    return name;
  }

  getGroupBackground(id: string): string {
    const group = this.data.groupList.find(g => g.id === id);
    if (group) {
      return group.color;
    } else {
      return 'green';
    }
  }

  getOwnersBackground(id: string): string {
    const user = this.data.userList.find(o => o.userId === id);
    if (user) {
      return user.color;
    } else {
      return 'green';
    }
  }

  pageEvent(paginator: Paginator): void {
    const pagination = new PaginationVO();
    pagination.index = paginator.index;
    pagination.size = paginator.pageSize;
    if (this.data.type === 'taskboard') {
      this.summaryService.getTaskboardSummary(pagination, this.data.workspaceId,this.data.subdomainName).subscribe(data => {
        this.taskboardSummaryList = data;
        this.dataSource = data;
      });
    } else {
      this.summaryService.getWorkflowSummary(pagination, this.data.workspaceId,this.data.subdomainName).subscribe(data => {
        this.workflowSummaryList = data;
        this.dataSource = data;
      });
    }
  }
}
