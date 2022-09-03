import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogEmitterService {
  @Output() dialogEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }
}
