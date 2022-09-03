import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateConfigService {
  private lang: string;
  private changelang = 'en';

  constructor(private translateService: TranslateService) {
    translateService.setDefaultLang(localStorage.getItem('translate_lang'));
    this.lang = localStorage.getItem('translate_lang');
    this.changelang = this.lang;
    const browserLang = translateService.getBrowserLang();
    if (this.lang != null) {
      translateService.use(this.lang);
    } else {
      translateService.use(browserLang.match(/en|fr|es/) ? browserLang : 'en');
    }
  }

  changeLanguage(language: string) {
    this.translateService.use(language);
    localStorage.setItem('translate_lang', language);
    this.changelang = localStorage.getItem('translate_lang');
  }
}
