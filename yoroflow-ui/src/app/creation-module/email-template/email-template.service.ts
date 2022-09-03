import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ResponseString } from '../shared/vo/response-vo';
import { EmailTemplateVO } from './email-template-vo';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {

  constructor(private http: HttpClient) { }

  private saveEnailTemplateUrl = environment.creationBaseUrl + '/email-template/v1/save';
  private getEmailTemplateDetailsUrl = environment.creationBaseUrl + '/email-template/v1/';
  private getCheckTempalteId = environment.creationBaseUrl + '/email-template/v1/';

  save(customPageVo) {
    return this.http.post<ResponseString>(this.saveEnailTemplateUrl, customPageVo);
}

getEmailTemplate(id) {
  return this.http.get<EmailTemplateVO>(this.getEmailTemplateDetailsUrl + 'get/' + id);
}

checkTempalteId(templateId) {
  return this.http.post<ResponseString>(this.getCheckTempalteId + 'check', templateId);
}

}
