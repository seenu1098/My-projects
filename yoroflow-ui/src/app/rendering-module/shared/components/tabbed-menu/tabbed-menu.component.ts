import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';

@Component({
  selector: 'lib-tabbed-menu',
  template: `
          <ng-container *ngIf="showControl === true">
          <div [style]="field.style" style="width:100%">
          <div style="margin-top:1%" [style.background-color]="field.rowBackground">
          <app-dynamic-menu-tab [menuId]="field.control.menuId" [menuType]="field.control.menuOrientation"
           [passingParameterFormGroup]="group" [parameterControlName]="field.control.parameterControlName"></app-dynamic-menu-tab>
          <ng-container *ngIf="field.control.menuOrientation === 'horizontal'">
          <router-outlet></router-outlet>
          </ng-container>
          </div>
          </div>
          </ng-container>
          `,
  styles: []
})
export class TabbedMenuComponent implements OnInit {
  @Input() field: Field;
  @Input() group: FormGroup;
  showControl = true;
  uuid: string;

  constructor(public el: ElementRef, public formService: CreateFormService) { }
  ngOnInit() {
    this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    // this.group.removeControl(undefined);
    // if (this.field.name) {
    //   this.group.removeControl(this.field.name);
    // }

    this.group.get(this.field.control.parameterControlName).valueChanges.subscribe(data => {
      this.uuid = data;
    });
  }
}
