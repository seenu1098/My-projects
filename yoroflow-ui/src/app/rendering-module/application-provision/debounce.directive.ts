import { Directive, OnInit, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appDebounce]'
})
export class DebounceDirective {
  constructor(
    private el: ElementRef<HTMLButtonElement>,
  ) { }

  @Input() appDebounce: number;

  @HostListener('click') onMouseEnter() {
    this.el.nativeElement.disabled = true;
    setTimeout(() => this.el.nativeElement.disabled = false, this.appDebounce)
  }
}