import { EventEmitter, Injectable, Output } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateCenterService {

  constructor(
    private router: Router,
    private workspaceService: WorkspaceService) { }

  json: any;
  @Output() public templateEmitter: EventEmitter<any> = new EventEmitter<any>();

  setWorkflowJson(data) {
    this.json = data;
    this.router.navigate(['/template-workflow']);
  }

  setTaskboardJson(data) {
    this.json = data;
    this.workspaceService.setHideHover(false);
    this.workspaceService.setHideSubMenu(true);
    this.workspaceService.setActiveElement('Taskboard');
    this.router.navigate(['/taskboard-template']);
  }
}
