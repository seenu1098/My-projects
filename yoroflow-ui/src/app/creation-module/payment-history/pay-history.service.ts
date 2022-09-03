import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayHistoryService {
  private payHistoryUrl = environment.creationBaseUrl + '/customer/v1/get/payment-history/';
  private downloadFileUrl = environment.creationBaseUrl + '/customer/v1/download/file/';

  constructor(private http: HttpClient) { }

  getPayHistory(id) {
    return this.http.get<any>(this.payHistoryUrl + id);
  }


  public downloadFile(id: string) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.downloadFileUrl + id, httpOptions);
  }
}
