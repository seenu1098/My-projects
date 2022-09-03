import { Directive, ElementRef, EventEmitter, Host, HostListener, Input, Output } from "@angular/core";
import { TaskboardConfigurationComponent } from "./taskboard-configuration.component";

@Directive({
  selector: "[appScrollable]",
  exportAs: "appScrollable"
})
export class ScrollableDirective {
  show_east: boolean;
  show_west: boolean;
  constructor(
    private elementRef: ElementRef,
    @Host() private taskboardConfig: TaskboardConfigurationComponent
  ) { }

  @Input() scrollUnit: number;
  @Input() groupByName: string;

  private get element() {
    return this.elementRef.nativeElement;
  }
  get isOverflow() {
    return this.element.scrollWidth > this.element.clientWidth;
  }
  scroll(direction: number, val: boolean) {
    this.element.scrollLeft += this.scrollUnit * direction;
  }
  get left() {
    return this.element.scrollLeft;
  }
  get canScrollStart() {
    return this.element.scrollLeft > 0;
  }
  get canScrollEnd() {
    return this.element.scrollLeft + this.element.clientWidth != this.element.scrollWidth;
  }

  @HostListener("window:resize")
  onWindowResize() { } // required for update view when windows resized
}
