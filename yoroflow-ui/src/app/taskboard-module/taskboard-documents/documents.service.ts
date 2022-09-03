import { Injectable } from '@angular/core';
import { environment } from "src/environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { PaginationVO } from './attachments-vo';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private getTaskboardAttachmentsUrl = environment.workflowBaseurl + "/attachments/v1/get/list";
  private downloadFileUrl = environment.baseurl + "/taskboard/v1/download/file/";
  getBoardNamesURL = environment.baseurl + '/attachments/v1/get/board-names-list';

  constructor(private http: HttpClient) { }
  public getAttachments(paginationVO: PaginationVO): Observable<any> {
    return this.http.post<any>(this.getTaskboardAttachmentsUrl, paginationVO);
  }
  public downloadAttachedFile(fileId: string) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.downloadFileUrl + fileId, httpOptions);
  }
  getBoardNames() {
    return this.http.get<any>(this.getBoardNamesURL);
  }
}
