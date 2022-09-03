import { Injectable, OnInit } from '@angular/core';

@Injectable()
export class LoaderService implements OnInit {
  public showLoader = false;

  constructor() { }

  ngOnInit() {
  }

  getShowLoader() {
    return this.showLoader;
  }

  show() {
    this.showLoader = true;
  }

  hide() {
    this.showLoader = false;
  }

}
