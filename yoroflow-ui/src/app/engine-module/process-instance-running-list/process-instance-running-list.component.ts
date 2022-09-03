import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'app-process-instance-running-list',
  templateUrl: './process-instance-running-list.component.html',
  styleUrls: ['./process-instance-running-list.component.scss']
})
export class ProcessInstanceRunningListComponent implements OnInit {

  constructor(private router: Router, private workspaceService: WorkspaceService) { }
  status = 'IN_PROCESS';
  ngOnInit(): void {
  }

  receiveMessage($event) {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/view-task-list/' + this.status.toLowerCase() + '/' + $event.col1]);
  }

}
