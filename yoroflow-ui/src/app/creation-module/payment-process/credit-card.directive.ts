import { Directive, HostListener, HostBinding, ElementRef, EventEmitter, Output } from '@angular/core';
import { cardTypes } from './card-types.value';
import { ICardType } from './payment-process.component';

@Directive({
  selector: '[appCardTypeDetector]'
})
export class CreditCardDirective {

  @Output() cardDetect = new EventEmitter<ICardType>();

  @HostListener('keyup', ['$event'])
  onKeyup($event: KeyboardEvent) {
    const input = $event.target as HTMLInputElement;
    const value = input.value;
    if (!value) {
      this.cardDetect.next(null);
      return;
    }

    cardTypes.forEach(type => {
      if (type.pattern.test(value)) {
        this.cardDetect.next(type);
      }
    });
  }
}
