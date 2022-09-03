import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'th[resizable]',
  templateUrl: './resizable.component.html',
})
export class ResizableComponent {
  constructor() {}
  @HostBinding('style.width.px')
  width: number | null = null;

  onResize(width: any) {
    this.width = width;
  }
}
