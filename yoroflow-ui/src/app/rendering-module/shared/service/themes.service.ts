import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ThemesVO } from '../vo/themes-vo';

@Injectable({
  providedIn: 'root'
})
export class ThemesService {

  constructor(private http: HttpClient) { }

  getThemesListUrl = environment.renderingBaseUrl + '/themes/v1/get-list';

  getThemesList() {
    return this.http.get<ThemesVO[]>(this.getThemesListUrl);
  }

}
