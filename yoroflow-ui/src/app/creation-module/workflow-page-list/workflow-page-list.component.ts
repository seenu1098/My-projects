import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'lib-workflow-page-list',
  templateUrl: './workflow-page-list.component.html',
  styleUrls: ['./workflow-page-list.component.css']
})
export class WorkflowPageListComponent implements OnInit {

  constructor(private router: Router, private workspaceService: WorkspaceService) { }

  ngOnInit(): void {
  }

  receiveMessage($event): void {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/get/page', $event.col1]);
  }

}
