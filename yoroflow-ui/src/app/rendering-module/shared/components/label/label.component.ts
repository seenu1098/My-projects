import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';

@Component({
  selector: 'app-label',
  template: `
          <ng-container *ngIf="showControl === true">
          <div [style]="field.style" style="width:100%">
          <div *ngIf="field.label.labelPosition==='center'">
          <label [style.font-size.px]="field.label.labelSize" [style.background-color]="field.rowBackground" [style.font-family]="field.label.labelStyle"
            style="display: block;text-align: center;"  [style.height.px]="field.label.labelSize">
            {{field.label.labelName}}</label>
        </div>
        <div *ngIf="field.label.labelPosition==='left'|| field.label.labelPosition==='right'">
              <label [style.font-size.px]="field.label.labelSize" [style.background-color]="field.rowBackground" [style.font-family]="field.label.labelStyle"
              [style.float]="field.label.labelPosition"  [style.height.px]="field.label.labelSize">

                 {{field.label.labelName}}</label>
          </div>
          </div>
          </ng-container>
          `,
  styles: []
})
export class LabelComponent implements OnInit {
  @Input() field: Field;
  @Input() group: FormGroup;
  showControl = true;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
  }
  constructor(public el: ElementRef, public formService: CreateFormService) { }
  ngOnInit() {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    this.el.nativeElement.style.fontSize = this.field.label.labelSize + 'px';
    this.el.nativeElement.style.fontFamily = this.field.label.labelStyle;
    if (this.field.label.labelPosition === 'left' || this.field.label.labelPosition === 'right') {
      this.el.nativeElement.style.float = this.field.label.labelPosition;
    } else if (this.field.label.labelPosition === 'center') {
      this.el.nativeElement.style.display = 'block';
      this.el.nativeElement.style.textAlign = 'center';
    } else {
      this.el.nativeElement.style.float = 'left';
    }

    this.group.removeControl(undefined);
    if (this.field.name) {
      this.group.removeControl(this.field.name);
    }
  }

}
