import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';


@Injectable({
  providedIn: 'root'
})
export class DataSourceService {
  getClaimsListUrl = environment.baseURL + '/get-claim-list';
  constructor(private http: HttpClient) { }

  // getClaimsList(): Observable<> {
  //   return this.http.get(this.getClaimsListUrl);
  // }

}