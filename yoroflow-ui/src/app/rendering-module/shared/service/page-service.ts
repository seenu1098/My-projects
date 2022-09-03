import { Injectable } from '@angular/core';
import { ResponseString } from '../vo/response-vo';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Page, Grid, PageField, ImageKeysVO } from '../vo/page-vo';
import { TokenHeaderService } from '../../../shared-module/services/token-header.service';
import { CacheService } from './cache.service';
import { of } from 'rxjs/internal/observable/of';
import { environment } from 'src/environments/environment';
import { FilesVO } from '../components/file-upload/file-upload.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageService {

  pageUrl = environment.renderingBaseUrl + '/page/v1';
  getPageNamesUrl = environment.renderingBaseUrl + '/page/v1/get/page-name/';
  getGridNameUrl = environment.renderingBaseUrl + '/grids/v1/get/grid-name/';
  getPageByPageIdUrl = environment.renderingBaseUrl + '/page/v1/get-page/';
  getTargetPageCoulmnsUrl = environment.renderingBaseUrl + '/dynamic-page/v1/get/fields/for/page/';
  publishPageUrl = environment.renderingBaseUrl + '/page/v1/publish/';
  private completeWorkflowUrl = environment.workflowBaseurl + '/flow/v1/complete/step';
  publicFormUrl = environment.renderingBaseUrl + '/public/get-page/';
  private getPagePermissionUrl = environment.renderingBaseUrl + '/page-security/v1/get-permission';
  private getGridImagesUrl = environment.renderingBaseUrl + '/file-manager/v1/download/images';
  private getImagesFromUrl = environment.renderingBaseUrl + '/file-manager/v1/download-image/';
  private getImagesFromPublicUrl = environment.renderingBaseUrl + '/public/download-image/';
  private getStepperInfoUrl = environment.renderingBaseUrl + '/shopping-cart/v1/get/cart-details/';
  private downloadFileUrl = environment.renderingBaseUrl + '/dynamic-page/v1/download/file/';
  private deleteFileUrl = environment.renderingBaseUrl + '/dynamic-page/v1/delete/file';
  private getSignatureFileUrl = environment.creationBaseUrl + '/user-signature/v1/get/logged-in/user-signature';

  constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService, private cacheService: CacheService) { }

  getStepperInfo(steppserName) {
    return this.http.get<Page>(this.getStepperInfoUrl + steppserName);
  }

  completeWorkflow(taskDetailsRequest) {
    return this.http.post<any>(this.completeWorkflowUrl, taskDetailsRequest);
  }

  savePage(pageVO: Page) {
    return this.http.post<ResponseString>(this.pageUrl + '/save', pageVO);
  }

  checkPageName(pageName: string) {
    return this.http.post<ResponseString>(this.pageUrl + '/check-page-name', pageName, this.tokenHeaderService.getHeader());
  }

  getPage(id: number) {
    return this.http.get<Page>(this.pageUrl + '/get/' + id, this.tokenHeaderService.getHeader());
  }

  getPageNames() {
    return this.http.get<any>(this.pageUrl + '/get/page-names', this.tokenHeaderService.getHeader());
  }

  updatePage(page: Page, id: number) {
    return this.http.put<ResponseString>(this.pageUrl + '/update/' + id, page, this.tokenHeaderService.getHeader());
  }

  getAutoCompletePageName(pageName: string) {
    return this.http.get<Page[]>(this.getPageNamesUrl + pageName, this.tokenHeaderService.getHeader());
  }
  getGridName(gridName: string) {
    return this.http.get<Grid>(this.getGridNameUrl + gridName, this.tokenHeaderService.getHeader());
  }

  getPageByPageIdentifier(id, version) {
    // const url = this.getPageByPageIdUrl + id + '/' + version;
    // const pageResponseCache = this.cacheService.responseCache.get(url);
    // if (pageResponseCache) {
    //   return of(pageResponseCache);
    // }
    // const response = this.http.get<Page>(url);
    // response.subscribe(page => this.cacheService.responseCache.set(url, page));
    // return response;
    return this.http.get<Page>(this.getPageByPageIdUrl + id + '/' + version);
  }

  getTargetPageColums(pageIdentifier, version) {
    return this.http.get<PageField[]>(this.getTargetPageCoulmnsUrl + pageIdentifier + '/' + version);
  }

  publishPage(id) {
    return this.http.get<ResponseString>(this.publishPageUrl + id);
  }

  callWebServiceCall(value, webServiceUrl) {
    return this.http.post<any>(webServiceUrl, value);
  }

  getPublicForm(pageId) {
    return this.http.get<any>(this.publicFormUrl + pageId);
  }

  getPagePermission(permission) {
    return this.http.post<ResponseString>(this.getPagePermissionUrl, permission);
  }

  getGridImages(imageKeyList: ImageKeysVO) {
    return this.http.post<any>(this.getGridImagesUrl, imageKeyList);
  }

  getImagesFromKey(key) {
    return this.http.get<any>(this.getImagesFromUrl + key);
  }

  getImageFromKey(key) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.getImagesFromUrl + key,
      httpOptions);
  }

  getImageFromKeyFromPublicForm(key) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.getImagesFromPublicUrl + key,
      httpOptions);
  }

  public downloadAttachedFile(fileId: string): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.downloadFileUrl + fileId, httpOptions);
  }

  public deleteFile(filesVO: FilesVO): Observable<any> {
    return this.http.post<any>(this.deleteFileUrl, filesVO);
  }

  public getSignatureList(): Observable<any> {
    return this.http.get<any>(this.getSignatureFileUrl);
  }
}