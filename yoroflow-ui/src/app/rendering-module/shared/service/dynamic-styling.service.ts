import { Injectable } from '@angular/core';
import { interval } from 'rxjs/internal/observable/interval';


@Injectable({
  providedIn: 'root'
})
export class DynamicStylingService {

  screenHeight: any;
  screenWidth: any;
  style: any;

  constructor() { }

  setDynamicHeight() {
    this.style = interval(500).subscribe((val) => {
      return window.innerHeight+'px';
    });
  }

  setDynamicWidth() {
    this.style = interval(500).subscribe((val) => {
      return window.innerWidth+'px';
    });
  }

}
