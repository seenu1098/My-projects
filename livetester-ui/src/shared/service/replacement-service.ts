import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ReplacementVO } from 'src/app/replacement-option-execute/replacment-vo';
import { TestCaseExecutionVO } from '../vo/testgroupnode-vo';
import { EnvironmentPresetVO, PAVO } from 'src/app/replacement-option-execute/EnvironmentPresetVO';
import { ResponseStringVO } from '../vo/response-vo';
// tslint:disable-next-line: import-spacing
import { ReplaceDetailsVO, UniqueBeneficiaryVO, UniquePayorVO, UniquePAVO, UniqueProviderVO }
 from 'src/app/replacement-option-execute/replace-detail.vo';


@Injectable({
  providedIn: 'root'
})
export class ReplacementService {

  testcaseGroupUrl = environment.baseURL + '/testcase-group/v1/' ;

  constructor(private http: HttpClient) { }

  getReplacementDetail(replacementVO: ReplacementVO) {
    return this.http.post<EnvironmentPresetVO[]>(this.testcaseGroupUrl + 'replacement', replacementVO);
  }

  getBeneficary(testCaseExecutionVO: TestCaseExecutionVO) {
    return this.http.post<UniqueBeneficiaryVO[]>(this.testcaseGroupUrl + 'beneficary', testCaseExecutionVO);
  }
  getProvider(testCaseExecutionVO: TestCaseExecutionVO) {
    return this.http.post<UniqueProviderVO[]>(this.testcaseGroupUrl + 'provider', testCaseExecutionVO);
  }
  getPayor(testCaseExecutionVO: TestCaseExecutionVO) {
    return this.http.post<UniquePayorVO[]>(this.testcaseGroupUrl + 'payor', testCaseExecutionVO);
  }

  getPA(testCaseExecutionVO: TestCaseExecutionVO) {
    return this.http.post<UniquePAVO[]>(this.testcaseGroupUrl + 'pa', testCaseExecutionVO);
  }

 replaceAndExecute(replaceDetail: ReplaceDetailsVO) {
  return this.http.post<ResponseStringVO>(this.testcaseGroupUrl + 'replace-execute', replaceDetail);
}
}
