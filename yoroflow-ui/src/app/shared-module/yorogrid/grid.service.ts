import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeadersVO } from './headers-vo';
// import { TokenHeaderService } from '../shared/service/token-header.service';
import { PaginationVO } from './pagination-vo';
import { TokenHeaderService } from '../services/token-header.service';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs/internal/observable/of';
import { CreationCacheService } from '../../creation-module/shared/service/creation-cache.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  gridUrl = environment.creationBaseUrl + '/grids/v1/get-headers/';
  gridDataPaginatioUrl = environment.creationBaseUrl + '/grids/v1/get-grid-data/';
  gridExcelDataUrl = environment.creationBaseUrl + '/grids/v1/get-excel-file/';

  constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService, private workspaceService: WorkspaceService) { }

  // getHeaders(gridId: string): Observable<HeadersVO> {
  //   const url = this.gridUrl + gridId;
  // const gridHeaderCache = this.cacheService.responseCache.get(url);
  //   if (gridHeaderCache) {
  //     return of(gridHeaderCache);
  //   }
  //   const response = this.http.get<HeadersVO>(url);
  //   response.subscribe(headersVO => this.cacheService.responseCache.set(url, headersVO));
  //   return response;
  // }

  getHeaders(gridId: string) {
    return this.http.get<any>(this.gridUrl + gridId);
  }

  getExcelData(paginationVO) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.post<any>(this.gridExcelDataUrl, paginationVO, httpOptions);
  }

  getGridData(paginatioVO: PaginationVO) {
    if (!paginatioVO.direction) {
      paginatioVO.direction = 'asc';
    }

    return this.http.post(this.gridDataPaginatioUrl + this.workspaceService.workspaceID, paginatioVO, this.tokenHeaderService.getHeader());
  }
}
