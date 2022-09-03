import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponseString } from '../shared/vo/response-vo';


@Injectable({
  providedIn: 'root'
})
export class PaymentProcessService {

  constructor(private http: HttpClient) { }

  private processPaymentUrl = environment.creationBaseUrl + '/customer/v1/save-customer-payment';
  private addUsersPaymentPaymentUrl = environment.creationBaseUrl + '/customer/v1/add-users-payment';
  private updatePaymentCardDetailsUrl = environment.creationBaseUrl + '/customer/v1/update-card-details';


  processPayment(paymentInfo) {
    return this.http.post<ResponseString>(this.processPaymentUrl, paymentInfo);
  }

  addUsersPayment(paymentInfo) {
    return this.http.post<ResponseString>(this.addUsersPaymentPaymentUrl, paymentInfo);
  }

  updateCardDetails(customerPaymentVo) {
    return this.http.post<ResponseString>(this.updatePaymentCardDetailsUrl, customerPaymentVo);
  }


}
