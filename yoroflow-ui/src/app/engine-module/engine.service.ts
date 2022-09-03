import { EventEmitter, Injectable, Output } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class YoroflowEngineService {

  constructor() { }

  @Output() public menuCloseEmitter: EventEmitter<any> = new EventEmitter<any>();

  invokeMenuCloseEmit(): void {
    this.menuCloseEmitter.emit(true);
  }
}
