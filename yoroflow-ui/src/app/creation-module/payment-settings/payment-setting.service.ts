import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentSettingService {
  private getPublishKeyUrl = environment.creationBaseUrl + '/payment-settings/v1/get/publish-key';
  private savePaymentSettingsUrl = environment.creationBaseUrl + '/payment-settings/v1/save-payment-settings';
  private getPaymentSettingsUrl = environment.creationBaseUrl + '/payment-settings/v1/get/payment-settings/';
  constructor(private http: HttpClient) { }

  getPublishKey() {
    return this.http.get<any>(this.getPublishKeyUrl);
  }

  savePaymentSettings(vo) {
    return this.http.post<any>(this.savePaymentSettingsUrl, vo);
  }

  getPaymentSettings(id) {
    return this.http.get<any>(this.getPaymentSettingsUrl + id);
  }
}
