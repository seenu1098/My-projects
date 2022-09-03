import { Injectable, Output, EventEmitter } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HeaderVO } from './header-vo';
import { GridVO } from './grid-vo';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  @Output() change: EventEmitter<any> = new EventEmitter();

  headerValues: HeaderVO;
  headers: any;

  gridUrl = environment.baseURL + '/grid-service/v1/grid/get-headers/';
  gridDataPaginatioUrl = environment.baseURL + '/grid-service/v1/grid/get-grid-data';
  gridWidthUrl =  environment.baseURL + '/grid-service/v1/grid/get-width/';
  gridFilterUrl = environment.baseURL + '/grid-service/v1/grid/get-filter/';
  gridDetailUrl = environment.baseURL + '/grid-service/v1/grid/get/';
  getBatchTestcaseId = environment.baseURL + '/batch-result/v1/get-batchtestcase/';

  constructor(private http: HttpClient) { }

  getHeaders(gridId: string): Observable<HeaderVO> {
    return this.http.get<HeaderVO>(this.gridUrl + gridId);
  }
  getGridWidth(gridId: string)  {
    return this.http.get<number>(this.gridWidthUrl + gridId);
   }
   getFilterOption(gridId: string) {
    return this.http.get<boolean>(this.gridFilterUrl + gridId);
  }
  getGridDetail(gridId: string) {
    return this.http.get<GridVO>(this.gridDetailUrl + gridId);
  }
  getGridData(paginatioVO) {
    if (!paginatioVO.direction) {
      paginatioVO.direction = 'asc';
    }
    return this.http.post(this.gridDataPaginatioUrl, paginatioVO);
  }

  rowSelected(data: any) {
     this.change.emit(data);
  }
  isSelectAll(data: any) {
    return this.http.get<[]>(this.getBatchTestcaseId + data);
  }
}
