import { Component, OnInit, ViewChild } from '@angular/core';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'lib-app-layout-page-list',
  templateUrl: './app-layout-page-list.component.html',
  styleUrls: ['./app-layout-page-list.component.css']
})
export class AppLayoutPageListComponent implements OnInit {

  constructor(private router: Router, private workspaceService: WorkspaceService) { }

  @ViewChild('page', { static: true }) gridConfig: YorogridComponent;

  ngOnInit(): void {
  }

  receiveMessage($event): void {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/get/app-layout-page' , $event.col1])  ;
  }

}
