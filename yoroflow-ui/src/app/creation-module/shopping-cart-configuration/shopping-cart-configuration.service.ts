import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenHeaderService } from '../../shared-module/services/token-header.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartConfigurationService {

  constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService) { }
  saveshoppingCartUrl = environment.creationBaseUrl + '/shopping-cart/v1/save';
  getShoppingCartUrl = environment.creationBaseUrl + '/shopping-cart/v1/get/cart-details/';
  checkShoppingCartUrl = environment.creationBaseUrl + '/shopping-cart/v1/check/cart-name/';
  
  saveShoppingCart(cartVo) {
    return this.http.post<any>(this.saveshoppingCartUrl, cartVo);
  }

  getShoppingCart(cartName) {
    return this.http.get<any>(this.getShoppingCartUrl + cartName);
  }

  checkShoppingCart(cartName) {
    return this.http.get<any>(this.checkShoppingCartUrl + cartName);
  }
}
