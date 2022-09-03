import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '../../vo/page-vo';

@Component({
  selector: 'app-paragraph',
  template: `
  <div [style]="field.style" style="width:100%">
       <ng-container [style.background-color]="field.rowBackground">
         <div [innerHTML]="field.control.paragraph"></div>
      </ng-container>
      </div>
          `,
  styles: []
})
export class ParagraphComponent implements OnInit {
  @Input() field: Field;
  @Input() group: FormGroup;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
  }

  constructor(public el: ElementRef) { }
  ngOnInit() {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    this.group.removeControl(undefined);
    if (this.field.name) {
      this.group.removeControl(this.field.name);
    }
  }
}
