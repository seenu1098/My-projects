import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { ResponseStringVO } from "../vo/response-vo";
import { LookupDataVO } from "../../app/lookup-data/lookup-data-vo";

@Injectable({
    providedIn: 'root'
  })
  export class LookupDataService {
    lookupDataUrl = environment.baseURL + '/lookup-data/v1/';

    constructor(private http: HttpClient) { }

    save(lookupDataVO: LookupDataVO ) {
        return this.http.post<ResponseStringVO>(this.lookupDataUrl + 'save', lookupDataVO );
    }

    getLookupDataCodeList() {
      return this.http.get<LookupDataVO[]>(this.lookupDataUrl + 'get');
    }

    getLookupDataInfo(id: number) {
      return this.http.get<LookupDataVO>(this.lookupDataUrl + 'info/' + id);
    }

    deleteLookupData(id: number) {
      return this.http.get<ResponseStringVO>(this.lookupDataUrl + 'delete/' + id);
    }
  }
