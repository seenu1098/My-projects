import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResponseString } from '../shared/vo/response-vo';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableObjectService {

  constructor(private http: HttpClient) { }
   securityUrl = environment.creationBaseUrl + '/table-security/v1/get-security/'
  saveTableObjectionUrl = environment.creationBaseUrl + '/table/v1/save';
  saveTableObjectColumnUrl = environment.creationBaseUrl + '/table/v1/save-update-column/';
  getTableObjectInfoUrl = environment.creationBaseUrl + '/table/v1/get/table-info/';
  checkTableNameUrl = environment.creationBaseUrl + '/table/v1/check/table-name/';
  saveTableObjectionValueUrl = environment.creationBaseUrl + '/table/v1/save/table-data/';
  getTableObjectionValueUrl = environment.creationBaseUrl + '/table/v1/get/table-data/';
  getTableObjectColumnDeleteUrl = environment.creationBaseUrl + '/table/v1/delete-column/';
  deleteTableObjectRowUrl = environment.creationBaseUrl + '/table/v1/delete-table-data';
  getTableObjectsUrl = environment.creationBaseUrl + '/table/v1/get/table-names';
  deleteDataTableUrl = environment.creationBaseUrl + '/table/v1/delete-table/';
  importDataTableUrl = environment.creationBaseUrl + '/table/v1/import-table';
  getExcelHeadersUrl = environment.creationBaseUrl + '/table/v1/get-excel-headers';
   getUsersListUrl = environment.baseurl + '/user-service/v1/get/users';
  saveSecurityUrl = environment.creationBaseUrl + '/table-security/v1/save-owner';
  getExcelDataUrl = environment.creationBaseUrl + '/table/v1/get-excel/';
  saveSecurityUrlTeam = environment.creationBaseUrl + '/table-security/v1/save-team';

  saveTableObjection(tableObjectVO) {
    return this.http.post<ResponseString>(this.saveTableObjectionUrl, tableObjectVO);
  }
  saveSecurity(TableSecurityVOList) {
    return this.http.post<any>(this.saveSecurityUrl, TableSecurityVOList);
  }
  saveSecurityTeam(TableSecurityVO) {
    return this.http.post<any>(this.saveSecurityUrlTeam, TableSecurityVO);
  }

  saveTableObjectColumn(tableObjectColumnVO, tableId) {
    return this.http.post<any>(this.saveTableObjectColumnUrl + tableId, tableObjectColumnVO);
  }
  public getUsersList(): Observable<any> {
    return this.http.get<any>(this.getUsersListUrl);
  }

  getTableObjectsList() {
    return this.http.get<any>(this.getTableObjectsUrl);
  }

  deleteDataTable(tableId) {
    return this.http.get<any>(this.deleteDataTableUrl + tableId);
  }

  getTableObjectInfo(id) {
    return this.http.get<any>(this.getTableObjectInfoUrl + id);
  }

  checkTableName(tableName) {
    return this.http.get<any>(this.checkTableNameUrl + tableName);
  }
  getSecurity(tableId) {
    return this.http.get<any>(this.securityUrl + tableId);
  }

  saveTableObjectionValue(tableObjectVO, tableId) {
    return this.http.post<any>(this.saveTableObjectionValueUrl + tableId, tableObjectVO);
  }

  getTableObjectionValue(tableId, paginationVO) {
    return this.http.post<any>(this.getTableObjectionValueUrl + tableId, paginationVO);
  }

  deleteTableObjectColumn(columnId) {
    return this.http.get<any>(this.getTableObjectColumnDeleteUrl + columnId);
  }

  deleteTableObjectRow(deleteVO): Observable<any> {
    return this.http.post<any>(this.deleteTableObjectRowUrl, deleteVO);
  }

  importDataTable(formData) {
    return this.http.post<any>(this.importDataTableUrl, formData);
  }

  getExcelHeaders(formData) {
    return this.http.post<any>(this.getExcelHeadersUrl, formData);
  }

  getExcelData(tableId) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.getExcelDataUrl + tableId, httpOptions);
  }


  // getTableObjectionValue(tableId) {
  //   return '[{"id":"e8298580-429c-4784-9ad9-da84b3615816","values":[{"columnIdentifier":"ya_vaccation","columnValue":null,"dataType":null},{"columnIdentifier":"ya_age","columnValue":"26","dataType":null},{"columnIdentifier":"ya_date","columnValue":null,"dataType":null},{"columnIdentifier":"ya_name","columnValue":"Karthi","dataType":null}]},{"id":"ee0ef277-94b3-42d5-8f87-17c57d72ffd7","values":[{"columnIdentifier":"ya_vaccation","columnValue":"","dataType":null},{"columnIdentifier":"ya_age","columnValue":"25","dataType":null},{"columnIdentifier":"ya_date","columnValue":"2021-12-27 00:00:00.0","dataType":null},{"columnIdentifier":"ya_name","columnValue":"Srini","dataType":null}]}]';
  // }
}
