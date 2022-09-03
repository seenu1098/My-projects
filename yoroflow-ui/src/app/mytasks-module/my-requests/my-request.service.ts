import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyRequestService {

  @Output() public submitReqEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }

  private getTaskboardListUrl = environment.baseurl + '/taskboard-launch/v1/get-taskboard/list/';

  getTaskboardList(isWorkspace:string) {
    return this.http.get<any>(this.getTaskboardListUrl +isWorkspace);
  }

  invokeSubmittedReqEmitter(): void {
    this.submitReqEmitter.emit(true);
  }
}
