import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaginationVo } from './paginationVo';
import { environment } from '../../../environments/environment';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessInstanceListService {

  getProcessInstanceListUrl = environment.workflowBaseurl + '/process-instance/v1/get/list/';

  constructor(private http: HttpClient,private workspaceService:WorkspaceService) { }

  getProcessInstanceList(paginationVO: PaginationVo) {
    return this.http.post<any>(this.getProcessInstanceListUrl+this.workspaceService.workspaceID, paginationVO);
  }
}
