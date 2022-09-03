import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { ResponseStringVO } from '../vo/response-vo';
import { TestGroupVO } from '../vo/claim-vo';
import { TestGroupVOList } from 'src/app/list-test-groups/test-group-vo';
import { TestCaseExecutionVO } from '../vo/testgroupnode-vo';
import { environment } from 'src/environments/environment';
import { BatchReportVO } from 'src/shared/vo/batch-report-vo';
import { PrintTestResultsVO } from '../vo/print-test-results-vo';
import { Observable } from 'rxjs';
import { PdfResponseVO } from '../vo/pdf-response-vo';

@Injectable({
  providedIn: 'root'
})
export class TestGroupService {
  constructor(private http: HttpClient) { }

  testcaseGroupUrl = environment.baseURL + '/testcase-group/v1/';
  requeryResultUrl = environment.baseURL + '/batch-result/v1/requery-result';
  printResultUrl = environment.baseURL + '/batch-result/v1/get-pdf';
  printResultResponseUrl = environment.baseURL + '/batch-result/v1/get-pdf-response';
  getFileNameurl = environment.baseURL + '/batch-result/v1/get-file-name';

  save(testGroupVO: TestGroupVO) {
    return this.http.post<ResponseStringVO>(this.testcaseGroupUrl + 'save', testGroupVO);
  }

  getClaimTestGroup() {
    return this.http.get<TestGroupVOList[]>(this.testcaseGroupUrl + 'get');
  }
  getTestCaseGroupList() {
    return this.http.get<TestGroupVO[]>(this.testcaseGroupUrl + 'list');
  }

  deleteTestCaseGroupInfo(id: number) {
    return this.http.get<ResponseStringVO>(this.testcaseGroupUrl + 'delete/' + id);
  }

  getTestReport(testReportGenerateVO: BatchReportVO) {
    return this.http.post<BatchReportVO>(environment.baseURL + '/test-report/v1/get', testReportGenerateVO);
  }

  getTestCaseGroupInfo(id: number) {
    return this.http.get<TestGroupVO>(this.testcaseGroupUrl + 'testcase/' + id);
  }

  requeryResult(requeryResultVO) {
    return this.http.post<ResponseStringVO>(this.requeryResultUrl, requeryResultVO);
  }

  getFileName(printTestResultsVO: PrintTestResultsVO) {
    return this.http.post<PdfResponseVO>(this.getFileNameurl, printTestResultsVO);
  }

  printResultWithResponse(printTestResultsVO: PrintTestResultsVO) {
    const httpOptions = {
      'responseType': 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.post<any>(this.printResultResponseUrl, printTestResultsVO, httpOptions);
  }
}
