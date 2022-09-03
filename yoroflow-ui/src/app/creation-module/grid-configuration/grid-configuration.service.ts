import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Grid } from './grid-vo';
import { ResponseString } from '../shared/vo/response-vo';
import { TokenHeaderService } from '../../shared-module/services/token-header.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GridConfigurationService {

  constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService) { }

  gridRowInfoUrl = environment.creationBaseUrl + '/grids-config/v1/get/';
  saveAndUpdateUrl = environment.creationBaseUrl + '/grids-config/v1/save-update';
  getGridNameUrl = environment.creationBaseUrl + '/grids-config/v1/grid-name';
  getGridExistCheckListUrl = environment.creationBaseUrl + '/grids-config/v1/check-grid/';
  getBuiltInFieldsUrl = environment.creationBaseUrl + '/grids-config/v1/get/built-in/fields';
  getGridInfoByGridNameUrl = environment.creationBaseUrl + '/grids-config/v1/get-by-grid-name/';

  getRowInfo(gridId: string) {
    return this.http.get<Grid>(this.gridRowInfoUrl + gridId, this.tokenHeaderService.getHeader());
  }

  getGridInfoByGridName(gridName: string) {
    return this.http.get<Grid>(this.getGridInfoByGridNameUrl + gridName, this.tokenHeaderService.getHeader());
  }

  saveAndUpdateGridData(grid: Grid) {
    return this.http.post<ResponseString>(this.saveAndUpdateUrl, grid, this.tokenHeaderService.getHeader());
  }

  getGridName() {
    return this.http.get(this.getGridNameUrl, this.tokenHeaderService.getHeader());
  }

  checkGridName(gridName) {
    return this.http.get<any>(this.getGridExistCheckListUrl + gridName);
  }

  getBuiltInFields() {
    return this.http.get<any>(this.getBuiltInFieldsUrl);
  }
}
