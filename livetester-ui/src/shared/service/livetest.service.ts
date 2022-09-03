import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResponseStringVO } from '../vo/response-vo';
import {
  ClaimVO, TemplateVO, TestGroupVO, ClaimTypeVO,
  ClaimEntityVO, ProviderVO, PayorVO, DuplicateClaimVO, DuplicateTemplateVO, BeneficiaryVO
} from '../vo/claim-vo';
import { environment } from 'src/environments/environment';
import { EnvironmentVO, EnvironmentListVO } from '../vo/environment-vo';
import { ElementConfigListVO, ElementConfigVO } from '../vo/element-config-vo';
import { BatchTestcaseResultVO } from '../vo/batch-testcase-result-vo';
import { LookupDataVO, ClaimTypeHeaderVO } from '../../app/lookup-data/lookup-data-vo';
import { EnvironmentPresetVO, PaVO } from '../vo/environment-preset-vo';
import { TestCaseExecutionVO } from '../vo/testgroupnode-vo';



@Injectable({
  providedIn: 'root'
})
export class LivetestService {

  userAccess: boolean;

  testcaseUrl = environment.baseURL + '/testcase/v1/';
  claimtypeUrl = environment.baseURL + '/claim-type/v1/';
  saveEnvironmentUrl = environment.baseURL + '/environment/v1/save';
  getEnvironmentNames = environment.baseURL + '/environment/v1/get';
  getEnvironmentInfo = environment.baseURL + '/environment/v1/get';
  saveElementConfigUrl = environment.baseURL + '/element-config/v1/save';
  getElementConfigNames = environment.baseURL + '/element-config/v1/get-list';
  getElementConfigInfo = environment.baseURL + '/element-config/v1/get';
  getBatchTestCaseResultUrl = environment.baseURL + '/batch-result/v1/get';
  deleteEnvironmentUrl = environment.baseURL + '/environment/v1/delete';
  deleteElementConfigUrl = environment.baseURL + '/element-config/v1/delete';
  deleteTemplateUrl = environment.baseURL + '/template/v1/delete';

  getBatchTestCasesUrl = environment.baseURL + '/batch-result/v1/get-batch-rerun-testcases/';
  demoPassOrFailUrl = environment.baseURL + '/batch-result/v1/demo-pass-fail/';

  saveEnvironmentBeneficiaryDetailsUrl = environment.baseURL + '/environment-preset/v1/save-beneficiary-details';
  getEnvironmentBeneficiaryDetailsUrl = environment.baseURL + '/environment-preset/v1/get-beneficiary-info';
  deleteEnvironmentBeneficiaryDetailsUrl = environment.baseURL + '/environment-preset/v1/delete-beneficiary-details';

  saveEnvironmentProviderDetailsUrl = environment.baseURL + '/environment-preset/v1/save-provider-details';
  getEnvironmentProviderDetailsUrl = environment.baseURL + '/environment-preset/v1/get-provider-info';
  deleteEnvironmentProviderDetailsUrl = environment.baseURL + '/environment-preset/v1/delete-provider-details';

  saveEnvironmentPayorDetailsUrl = environment.baseURL + '/environment-preset/v1/save-payor-details';
  getEnvironmentPayorDetailsUrl = environment.baseURL + '/environment-preset/v1/get-payor-info';
  deleteEnvironmentPayorDetailsUrl = environment.baseURL + '/environment-preset/v1/delete-payor-details';

  saveEnvironmentPaDetailsUrl = environment.baseURL + '/environment-preset/v1/save-pa-details';
  getEnvironmentPaDetailsUrl = environment.baseURL + '/environment-preset/v1/get-pa-info';
  deleteEnvironmentPaDetailsUrl = environment.baseURL + '/environment-preset/v1/delete-pa-details';

  getclaimTypeNamesUrl = environment.baseURL + '/claim-type/v1/get';

  getBeneficiaryVOListUrl = environment.baseURL + '/environment-preset/v1/get-beneficiary-list';
  getProviderVOListUrl = environment.baseURL + '/environment-preset/v1/get-provider-list';
  getPayorVOListUrl = environment.baseURL + '/environment-preset/v1/get-payor-list';
  getPaVOListUrl = environment.baseURL + '/environment-preset/v1/get-pa-vo-list';
  getAccessForTemplateWithId = environment.baseURL + '/template/v1/get-access-info/';

  saveDuplicateTemplateUrl = environment.baseURL + '/template/v1/save-duplicate';

  constructor(private http: HttpClient) { }

  save(claimVo: ClaimVO) {
    return this.http.post<ResponseStringVO>(environment.baseURL + '/template/v1/save', claimVo);
  }

  getTemplateNames() {
    return this.http.get<TemplateVO[]>(environment.baseURL + '/template/v1/get-list');
  }

  getTemplateInfo(id: number) {
    return this.http.get<ClaimVO>(environment.baseURL + '/template/v1/get-info/' + id);
  }

  saveClaim(claimEntityVO: ClaimEntityVO) {
    return this.http.post<ResponseStringVO>(this.testcaseUrl + 'save', claimEntityVO);
  }

  updateClaim(claimEntityVO: ClaimEntityVO) {
    return this.http.post<ResponseStringVO>(this.testcaseUrl + 'update', claimEntityVO);
  }

  getTestCaseGroup() {
    return this.http.get<TestGroupVO[]>(this.testcaseUrl + 'testgroup');
  }

  saveEnvironment(environmentVO) {
    return this.http.post<ResponseStringVO>(this.saveEnvironmentUrl, environmentVO);
  }

  getEnvironmentNamesList() {
    return this.http.get<EnvironmentListVO[]>(this.getEnvironmentNames);
  }

  getEnvironmentData(id) {
    return this.http.get<EnvironmentVO>(this.getEnvironmentInfo + '/' + id);
  }
  /* claim type */
  saveClaimType(claimTypeVO: ClaimTypeVO) {
    return this.http.post<ResponseStringVO>(this.claimtypeUrl + 'save', claimTypeVO);
  }
  deleteClaimType(id: number) {
    return this.http.delete<ResponseStringVO>(this.claimtypeUrl + 'delete/' + id);
  }
  getClaimTypeList() {
    return this.http.get<ClaimTypeVO[]>(this.claimtypeUrl + 'get');
  }
  getClaimType(claimTypeId) {
    return this.http.get<ClaimTypeVO>(this.claimtypeUrl + 'get/' + claimTypeId);
  }
  getClaimNames() {
    return this.http.get<ClaimEntityVO>(this.claimtypeUrl + 'get-claim-list');
  }

  checkBacthName(batchname: string) {
    return this.http.get<number>(environment.baseURL + '/testcase-group/v1/check/' + batchname);
  }


  saveElementConfig(elementVO) {
    return this.http.post<ResponseStringVO>(this.saveElementConfigUrl, elementVO);
  }

  getClaimDetail(claimId) {
    return this.http.get<ClaimEntityVO>(this.testcaseUrl + 'get-details/' + claimId);
  }

  getClaimInfo(id: number) {
    return this.http.get<ClaimVO>(this.testcaseUrl + 'get-info/' + id);
  }

  getElementConfigList(type: string) {
    return this.http.get<ElementConfigListVO[]>(this.getElementConfigNames + '/' + type);
  }

  getElementConfigData(id) {
    return this.http.get<ElementConfigVO>(this.getElementConfigInfo + '/' + id);
  }

  getBatchTestcaseResultData(id) {
    return this.http.get<BatchTestcaseResultVO>(this.getBatchTestCaseResultUrl + '/' + id);
  }

  getBatchTestCases(batchname) {
    return this.http.get<TestCaseExecutionVO>(this.getBatchTestCasesUrl + batchname);
  }

  demoPassOrFail(batchId, passOrFail) {
    return this.http.get<ResponseStringVO>(this.demoPassOrFailUrl + passOrFail + '/' + batchId);
  }

  deleteTemplate(id: number) {
    return this.http.delete<ResponseStringVO>(this.deleteTemplateUrl + '/' + id);
  }

  deleteEnvironment(id: number) {
    return this.http.delete<ResponseStringVO>(this.deleteEnvironmentUrl + '/' + id);
  }

  deleteElementConfig(id: number) {
    return this.http.delete<ResponseStringVO>(this.deleteElementConfigUrl + '/' + id);
  }


  deleteClaimInfo(id: number) {
    return this.http.delete<ResponseStringVO>(this.testcaseUrl + 'delete/' + id);
  }

  getLookupDataList(type: string) {
    return this.http.get<LookupDataVO>(environment.baseURL + '/lookup-data/v1/get/' + type);
  }

  getClaimTypeNameList() {
    return this.http.get<ClaimTypeHeaderVO>(this.getclaimTypeNamesUrl);
  }

  saveEnvironmentBeneficiaryDetails(environmentPresetVO) {
    return this.http.post<ResponseStringVO>(this.saveEnvironmentBeneficiaryDetailsUrl, environmentPresetVO);
  }

  getEnvironmentBeneficiaryDetails(envName: string, identifier: string) {
    return this.http.get<EnvironmentPresetVO>(this.getEnvironmentBeneficiaryDetailsUrl + '/' + envName + '/' + identifier);
  }

  deleteEnvironmentBeneficiaryDetails(id) {
    return this.http.delete<ResponseStringVO>(this.deleteEnvironmentBeneficiaryDetailsUrl + '/' + id);
  }

  saveEnvironmentProviderDetails(environmentPresetVO) {
    return this.http.post<ResponseStringVO>(this.saveEnvironmentProviderDetailsUrl, environmentPresetVO);
  }

  getEnvironmentProviderDetails(envName: string, npi: string) {
    return this.http.get<EnvironmentPresetVO>(this.getEnvironmentProviderDetailsUrl + '/' + envName + '/' + npi);
  }

  deleteEnvironmentProviderDetails(id) {
    return this.http.delete<ResponseStringVO>(this.deleteEnvironmentProviderDetailsUrl + '/' + id);
  }

  saveEnvironmentPayorDetails(environmentPresetVO) {
    return this.http.post<ResponseStringVO>(this.saveEnvironmentPayorDetailsUrl, environmentPresetVO);
  }

  getEnvironmentPayorDetails(envName: string, identifier: string) {
    return this.http.get<EnvironmentPresetVO>(this.getEnvironmentPayorDetailsUrl + '/' + envName + '/' + identifier);
  }

  deleteEnvironmentPayorDetails(id) {
    return this.http.delete<ResponseStringVO>(this.deleteEnvironmentPayorDetailsUrl + '/' + id);
  }

  saveEnvironmentPaDetails(environmentPresetVO) {

    return this.http.post<ResponseStringVO>(this.saveEnvironmentPaDetailsUrl, environmentPresetVO);
  }

  getEnvironmentPaDetails(envName: string, number: string) {
    return this.http.get<EnvironmentPresetVO>(this.getEnvironmentPaDetailsUrl + '/' + envName + '/' + number);
  }

  deleteEnvironmentPaDetails(id) {
    return this.http.delete<ResponseStringVO>(this.deleteEnvironmentPaDetailsUrl + '/' + id);
  }

  saveDuplicateClaim(duplicateClaimVO: DuplicateClaimVO) {
    return this.http.post<ResponseStringVO>(this.testcaseUrl + 'save-duplicate', duplicateClaimVO);
  }

  saveDuplicateTemplate(duplicateTemplateVO: DuplicateTemplateVO) {
    return this.http.post<ResponseStringVO>(this.saveDuplicateTemplateUrl, duplicateTemplateVO);
  }
  getBeneficiaryVOList(key: string) {
    return this.http.get<BeneficiaryVO[]>(this.getBeneficiaryVOListUrl + '/' + key);
  }

  getProviderVOList(key: string) {
    return this.http.get<ProviderVO[]>(this.getProviderVOListUrl + '/' + key);
  }

  getPayorVOList(key: string) {
    return this.http.get<PayorVO[]>(this.getPayorVOListUrl + '/' + key);
  }

  getPaVOList(key: string) {
    return this.http.get<PaVO[]>(this.getPaVOListUrl + '/' + key);
  }

  getAccessForTemplateInfo(id: number) {
    return this.http.get<boolean>(this.getAccessForTemplateWithId + id);
  }

}
