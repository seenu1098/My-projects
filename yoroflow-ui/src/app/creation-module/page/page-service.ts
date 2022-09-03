import { Injectable } from '@angular/core';
import { ResponseString } from '../shared/vo/response-vo';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Page, Grid, PageField } from '../shared/vo/page-vo';
import { TokenHeaderService } from '../../shared-module/services/token-header.service';
import { Application } from '../shared/vo/appication-vo';
import { environment } from '../../../environments/environment';
import { WorkFlowList } from '../shared/vo/workflow-list-vo';
import { TableObjectsVO } from '../table-objects/table-object-vo';
import { ShoppingCartImage } from '../shopping-card-step-name/shopping-cart-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  pageUrl = environment.creationBaseUrl + '/page/v1';
  getPageNamesUrl = environment.creationBaseUrl + '/page/v1/get/page-name/';
  getGridNameUrl = environment.creationBaseUrl + '/grids/v1/get/grid-name/';
  getPageByPageIdUrl = environment.creationBaseUrl + '/page/v1/get-page/';
  getTargetPageColumnsUrl = environment.creationBaseUrl + '/dynamic-page/v1/get/fields/for/page/';
  getPageFieldsForGridUrl = environment.creationBaseUrl + '/page/v1/get/page-field-list/';
  publishPageUrl = environment.creationBaseUrl + '/page/v1/publish/';
  getApplicationistUrl = environment.creationBaseUrl + '/application/v1/get-app-list/';
  getFieldColumnsUrl = environment.creationBaseUrl + '/dynamic-page/v1/get/fields/';
  getPageNameByAppIdUrl = environment.creationBaseUrl + '/page/v1/get/page-name/app-id/';
  getCustomPageNameListUrl = environment.creationBaseUrl + '/custom-page/v1/get-page-name-list/';
  getAutocompleteFieldListUrl = environment.creationBaseUrl + '/custom-page/v1/get-page-field-list/';
  private listWorkflowUrl = environment.workflowBaseurl + '/flow/v1/get/workflow-list/button/';
  private listWorkflowVersionUrl = environment.workflowBaseurl + '/flow/v1/get/workflow-version/';
  pageVersionListUrl = environment.creationBaseUrl + '/page/v1/get/page-version/';
  pageIdUrl = environment.creationBaseUrl + '/page/v1/get/workflowform/page-names';
  getAppPrefixUrl = environment.creationBaseUrl + '/page/v1/get/app-prefix/';
  checkApplicationExistUrl = environment.creationBaseUrl + '/application/v1/check-app/';
  checkTableNameUrl = environment.creationBaseUrl + '/table/v1/check/table-name/';
  getTableListVOUrl = environment.creationBaseUrl + '/table/v1/get-table-vo-list';
  saveTableListUrl = environment.creationBaseUrl + '/table/v1/save/table-list';
  saveshoppingCartImageUrl = environment.creationBaseUrl + '/page/v1/save/shopping-cart/image';
  getshoppingCartImageUrl = environment.creationBaseUrl + '/page/v1/get/shopping-cart/';
  getshoppingCartNameAutoCompleteUrl = environment.creationBaseUrl + '/shopping-cart/v1/get/cart-name/';
  cartNamesUrl = environment.creationBaseUrl + '/shopping-cart/v1/get/cart-names';
  private isAllowedUrl = environment.baseurl + '/flow/v1/license/is-allowed';
  getTableNameUrlForPage = environment.creationBaseUrl + '/table/v1/get/table-names/page';
  private getGroupListUrl = environment.baseurl + '/user-management/v1/get/list';

  constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService, private workspaceService: WorkspaceService) { }

  getWorkFlowList() {
    return this.http.get<WorkFlowList[]>(this.listWorkflowUrl + this.workspaceService.workspaceID);
  }

  getWorkflowVersionList(key) {
    return this.http.get<WorkFlowList[]>(this.listWorkflowVersionUrl + key);
  }

  getPageId() {
    return this.http.get<any>(this.pageIdUrl);
  }

  savePage(pageVO: Page) {
    return this.http.post<ResponseString>(this.pageUrl + '/save/' + this.workspaceService.workspaceID, pageVO, this.tokenHeaderService.getHeader());
  }

  checkPageName(pageName: string) {
    return this.http.post<ResponseString>(this.pageUrl + '/check-page-name', pageName, this.tokenHeaderService.getHeader());
  }

  getPage(id) {
    return this.http.get<Page>(this.pageUrl + '/get/' + id, this.tokenHeaderService.getHeader());
  }

  getPageNames() {
    return this.http.get<any>(this.pageUrl + '/get/page-names', this.tokenHeaderService.getHeader());
  }

  updatePage(page: Page, id: string) {
    return this.http.put<ResponseString>(this.pageUrl + '/update/' + id, page, this.tokenHeaderService.getHeader());
  }

  getAutoCompletePageName(pageName: string, isPublicForm: string) {
    return this.http.get<Page[]>(this.getPageNamesUrl + pageName + '/' + isPublicForm, this.tokenHeaderService.getHeader());
  }

  getGridName(gridName: string) {
    return this.http.get<Grid>(this.getGridNameUrl + gridName, this.tokenHeaderService.getHeader());
  }

  getPageByPageIdentifier(id, version) {
    return this.http.get<Page>(this.getPageByPageIdUrl + id + '/' + version);
  }

  getTargetPageColumns(pageIdentifier, version) {
    return this.http.get<PageField[]>(this.getTargetPageColumnsUrl + pageIdentifier + '/' + version);
  }

  getPageFieldsForGrid(pageIdentifier) {
    return this.http.get<PageField[]>(this.getPageFieldsForGridUrl + pageIdentifier);
  }

  getPageVersion(pageId, type) {
    return this.http.get<any>(this.pageVersionListUrl + pageId + '/' + type);
  }

  publishPage(id) {
    return this.http.get<ResponseString>(this.publishPageUrl + id);
  }

  getApplicationList() {
    return this.http.get<Application[]>(this.getApplicationistUrl + this.workspaceService.workspaceID);
  }

  getFieldColumns(pageIdentifier) {
    return this.http.get<PageField[]>(this.getFieldColumnsUrl + pageIdentifier, this.tokenHeaderService.getHeader());
  }

  getPageNameByAppId(appId) {
    return this.http.get<any>(this.getPageNameByAppIdUrl + appId, this.tokenHeaderService.getHeader());
  }

  getCustomPageNameList(pageName) {
    return this.http.get<any>(this.getCustomPageNameListUrl + pageName, this.tokenHeaderService.getHeader());
  }

  getPageFieldList(pageId) {
    return this.http.get<any>(this.getAutocompleteFieldListUrl + pageId, this.tokenHeaderService.getHeader());
  }

  getAppPrefix(pageId, version) {
    return this.http.get<any>(this.getAppPrefixUrl + pageId + '/' + version, this.tokenHeaderService.getHeader());
  }

  checkApplicationExist(appId: string) {
    return this.http.get<any>(this.checkApplicationExistUrl + '/' + appId)
  }

  checkTableName(tableName) {
    return this.http.get<any>(this.checkTableNameUrl + tableName);
  }

  getTableListVO(tableListVO) {
    return this.http.post<any>(this.getTableListVOUrl, tableListVO);
  }

  saveTableListVO(tableList: TableObjectsVO[]) {
    return this.http.post<any>(this.saveTableListUrl, tableList);
  }

  saveShoppingCartImage(imageVo: ShoppingCartImage) {
    return this.http.post<any>(this.saveshoppingCartImageUrl, imageVo);
  }

  getImageFromKey(key) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.getshoppingCartImageUrl + key,
      httpOptions);
  }

  getShoppingCartNameUrl(name) {
    return this.http.get<any>(this.getshoppingCartNameAutoCompleteUrl + name);
  }

  getCartNames() {
    return this.http.get<any>(this.cartNamesUrl, this.tokenHeaderService.getHeader());
  }

  isAllowed(licenseVO) {
    return this.http.post<any>(this.isAllowedUrl, licenseVO);
  }

  getTableObjectNames() {
    return this.http.get<any[]>(this.getTableNameUrlForPage);
  }

  public getUserGroupList(): Observable<any> {
    return this.http.get<any>(this.getGroupListUrl);
  }
}
