import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { environment } from '../../../environments/environment';
import { Permission } from '../yoro-security/security-vo';
import { InstalledApps, MarketPlaceVO, TableObjectsVO } from './market-place.vo';

@Injectable({
  providedIn: 'root'
})
export class MarketPlaceService {

  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }

  private saveMarketPlaceUrl = environment.creationBaseUrl + '/market-place/v1/save';
  private getmarketPlaceUrl = environment.creationBaseUrl + '/market-place/v1/get/market-place';
  private getOrgNameUrl = environment.creationBaseUrl + '/customer/v1/get/org-names';
  private getWorkflowListUrl = environment.workflowBaseurl + '/flow/v1/get/upload/processDefinitionList/';
  private getPageListUrl = environment.renderingBaseUrl + '/page/v1/get/list';
  private getPageNameUrl = environment.creationBaseUrl + '/page/v1/get/pageNames/';
  private savePagesUrl = environment.creationBaseUrl + '/page/v1/save/import/pages/';
  getTableListVOUrl = environment.creationBaseUrl + '/table/v1/get-table-vo-list';
  saveTableListUrl = environment.creationBaseUrl + '/table/v1/save/table-list';
  getPagePermissionsUrl = environment.creationBaseUrl + '/page-security/v1/get/permission';
  savePagePermissionUrl = environment.creationBaseUrl + '/page-security/v1/save/permission';
  getTableNameUrl = environment.creationBaseUrl + '/table/v1/get/table-names';
  getWorkflowUrl = environment.workflowBaseurl + '/flow/v1/get/upload-workflow/';
  getInstalledAppsUrl = environment.creationBaseUrl + '/installed-apps/v1/get/apps';
  installAppsUrl = environment.creationBaseUrl + '/installed-apps/v1/install/app';
  private createWorkFlowUrl = environment.baseurl + '/flow/v1/create/workflow/';
  private uninstalledworkflowUrl = environment.baseurl + '/flow/v1/uninstall/workflow/';
  private yoroAdminuser = environment.creationBaseUrl + '/user-service/v1/check/user';
  private listWorkflowUrl = environment.workflowBaseurl + '/flow/v1/get/list/';
  private listWorkflowVersionUrl = environment.workflowBaseurl + '/flow/v1/get/workflow-version/';
  private uploadWorkflowUrl = environment.workflowBaseurl + '/flow/v1/save/upload/workflow/';
  private setInstallWorkflowUrl = environment.workflowBaseurl + '/flow/v1/save/install/workflow/';
  private approveOrDisableUrl = environment.creationBaseUrl + '/market-place/v1/save/app/';

  saveMarketPlace(marketPlaceVO: MarketPlaceVO) {
    return this.http.post<any>(this.saveMarketPlaceUrl, marketPlaceVO);
  }

  getMarketPlaceApps() {
    return this.http.get<any>(this.getmarketPlaceUrl);
  }

  getOrgNameList() {
    return this.http.get<any>(this.getOrgNameUrl);
  }

  getWorkflowList() {
    return this.http.get<any>(this.getWorkflowListUrl + this.workspaceService.workspaceID)
  }

  getPageList(exportPages) {
    return this.http.post<any>(this.getPageListUrl, exportPages);
  }

  getPageNameList() {
    return this.http.get<any>(this.getPageNameUrl + this.workspaceService.workspaceID);
  }

  savePages(pageVO) {
    return this.http.post<any>(this.savePagesUrl + this.workspaceService.workspaceID, pageVO);
  }

  getTableListVO(tableListVO) {
    return this.http.post<any>(this.getTableListVOUrl, tableListVO);
  }

  saveTableListVO(tableList: TableObjectsVO[]) {
    return this.http.post<any>(this.saveTableListUrl, tableList);
  }

  getPagePermissions(data) {
    return this.http.post<any>(this.getPagePermissionsUrl, data);
  }

  savePagePaermissions(permissionVO) {
    return this.http.post<any>(this.savePagePermissionUrl, permissionVO);
  }

  getTableNames() {
    return this.http.get<any>(this.getTableNameUrl);
  }

  getWorkflow(definitionName, version) {
    return this.http.get<any>(this.getWorkflowUrl + definitionName + '/' + version + '/' + this.workspaceService.workspaceID);
  }

  getInstalledApps() {
    return this.http.get<any>(this.getInstalledAppsUrl);
  }

  installApps(installApp: InstalledApps) {
    return this.http.post<any>(this.installAppsUrl, installApp);
  }

  createWorkFlow(workflow) {
    return this.http.post<any>(this.createWorkFlowUrl + this.workspaceService.workspaceID, workflow);
  }

  uninstalledworkflow(processDefinitionName: string, startKey: string) {
    return this.http.get<any>(this.uninstalledworkflowUrl + processDefinitionName + '/' + startKey);
  }

  getYoroAdmin() {
    return this.http.get<any>(this.yoroAdminuser)
  }

  getWorkFlowList() {
    return this.http.get<any>(this.listWorkflowUrl + this.workspaceService.workspaceID);
  }

  getWorkflowVersionList(key) {
    return this.http.get<any>(this.listWorkflowVersionUrl + key);
  }

  saveMarketPlaceManagement(name, version) {
    return this.http.get<any>(this.uploadWorkflowUrl + name + '/' + version);
  }

  setInstallWorkflow(definitionName, version, type) {
    return this.http.get<any>(this.setInstallWorkflowUrl + definitionName + '/' + version + '/' + type);
  }

  setApproveOrDisable(definitionName, type) {
    return this.http.get<any>(this.approveOrDisableUrl + definitionName + '/' + type);
  }
}
