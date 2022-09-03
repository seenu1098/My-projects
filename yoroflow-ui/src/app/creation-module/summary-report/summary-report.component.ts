import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceListVO } from 'src/app/workspace-module/create-dialog/create-dialog-vo';
import { SummaryReportDialogComponent } from '../summary-report-dialog/summary-report-dialog.component';
import { OrgSummaryReportVo } from './summary-report-model';
import { SummaryReportService } from './summary-report.service';

@Component({
  selector: 'app-summary-report',
  templateUrl: './summary-report.component.html',
  styleUrls: ['./summary-report.component.scss']
})
export class SummaryReportComponent implements OnInit {

  @Input() subdomainName: string;

  workspaceListVO: WorkspaceListVO[];
  ownerList: any[] = [];
  groupList: any[] = [];
  orgSummaryReportVO = new OrgSummaryReportVo();

  constructor(public summaryReportService: SummaryReportService, private dialog: MatDialog, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.loadOrgSummaryReport();
    this.loadWorkspacesList();
  }

  loadOrgSummaryReport(): void {
    this.summaryReportService.getOrgSummaryDetails(this.subdomainName).subscribe(data => {
      this.orgSummaryReportVO = data;
    });
  }

  loadWorkspacesList(): void {
    this.summaryReportService.listAllWorkspaceList(this.subdomainName).subscribe(list => {
      this.workspaceListVO = list;
      this.getGroups();
      this.getOwners();
    });
  }

  getGroups(): void {
    this.summaryReportService.getGroupList().subscribe(groups => {
      this.groupList = groups;
    });
  }

  getOwners(): void {
    this.summaryReportService.getOwnerList().subscribe(owners => {
      this.ownerList = owners;
    });
  }

  getWorkspaceProfileName(workspaceName: string): string {
    const val = workspaceName?.replace(/ /g, '');
    return val.charAt(0).toUpperCase();
  }

  getUserFirstAndLastNamePrefix(task): string {
    let name = "";
    let array = task.split(' ')
    if (array[0]) {
      name = array[0].charAt(0).toUpperCase()
    }
    return name;
  }

  getRemainingAssigneeUserCount(teams: string[]): number {
    return teams.length
  }

  getGroupBackground(id: string): string {
    const group = this.groupList.find(g => g.id === id);
    if (group) {
      return group.color;
    } else {
      return 'green';
    }
  }

  getOwnersBackground(id: string): string {
    const user = this.ownerList.find(o => o.userId === id);
    if (user) {
      return user.color;
    } else {
      return 'green';
    }
  }

  openReportDialog(type: string, workspace: WorkspaceListVO, length: number): void {
    if (length > 0) {
      const dialog = this.dialog.open(SummaryReportDialogComponent, {
        width: '90%',
        minHeight: '200px',
        maxHeight: '90%',
        data: {
          type: type, workspaceId: workspace.workspaceId,
          groupList: this.groupList, userList: this.ownerList,
          workspaceVO: workspace, subdomainName: this.subdomainName
        }
      });
    }
  }
}
