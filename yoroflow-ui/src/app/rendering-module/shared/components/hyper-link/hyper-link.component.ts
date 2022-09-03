import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';

@Component({
  selector: 'app-hyper-link',
  template: `
          <ng-container *ngIf="showControl === true">
          <div [style]="field.style" style="width:100%">
            <div fxLayout="row wrap" [style.background-color]="field.rowBackground">
            <ng-container *ngFor="let linkObj of field.control.hyperLink">
            <a mat-button id="button" [href]="linkObj.link" target="_blank" color="primary" style="margin-top:4%">{{linkObj.linkName}}</a>
            </ng-container>
            </div>
            </div>
          </ng-container>
          `,
  styles: []
})
export class HyperLinkComponent implements OnInit {
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
    this.group.removeControl(undefined);
  }

}
