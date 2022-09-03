import { Component, OnInit, ViewChild } from '@angular/core';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.css']
})
export class PageListComponent implements OnInit {

  @ViewChild('page', { static: true }) gridConfig: YorogridComponent;

  constructor(private router: Router, private workspaceService: WorkspaceService) { }

  ngOnInit() {
  }
  receiveMessage($event): void {
    this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/get/page' , $event.col1])  ;
  }
}
