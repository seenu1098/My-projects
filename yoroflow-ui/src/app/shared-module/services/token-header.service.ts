import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TokenHeaderService {

  constructor() { }

  getToken() {
    return localStorage.getItem('token');
  }

  getHeader() {
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: this.getToken()
        })
    };

    return httpOptions;
  }
}
