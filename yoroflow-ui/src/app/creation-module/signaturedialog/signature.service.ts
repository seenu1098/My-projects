import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private addSignature = environment.creationBaseUrl + '/user-signature/v1/upload-file'
  private showSignature = environment.creationBaseUrl + '/user-signature/v1/download/file/'
  private deleteSignatureUrl = environment.creationBaseUrl + '/user-signature/v1/get/user-signature/'
  private viewSignatureUrl = environment.creationBaseUrl + '/user-signature/v1/get/logged-in/user-signature'
  constructor(private http: HttpClient) { }

  public addSign(signfiles: FormData): Observable<any> {
    return this.http.post<any>(this.addSignature, signfiles);
  }
  public showSign(key) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.showSignature + key, httpOptions)
  }
  deleteSignature(id) {
    return this.http.get<any>(this.deleteSignatureUrl + id);
  }
  getSignature() {
    return this.http.get<any>(this.viewSignatureUrl);
  }
}
