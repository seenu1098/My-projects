import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkspaceDashboardService } from '../workspace-dashboard/workspace-dashboard.service';
import * as Highcharts from 'highcharts';
import { PaginationVO } from 'src/app/mytasks-module/mytasks/pagination-vo';
import { DashboardChartVO, PaginatorForTaskboard, TaskboardTasksVO, BoardNameVo } from '../landing-page/landing-page-vo';
import { DatePipe } from '@angular/common';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

@Component({
  selector: 'app-widget-preview',
  templateUrl: './widget-preview.component.html',
  styleUrls: ['./widget-preview.component.scss']
})
export class WidgetPreviewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<WidgetPreviewComponent>
  ) { }

  ngOnInit(): void {
  }

 

  close($event) {
    if ($event) {
      this.dialogRef.close(true);
    }
  }
 
}

