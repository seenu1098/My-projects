import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';

@Component({
  selector: 'app-embedded-page',
  template: `
          <ng-container *ngIf="showControl === true">
          <lib-app-layout-page [id]="field.control.pageId" [version]="field.control.version" ></lib-app-layout-page>
          </ng-container>
          `,
  styles: []
})
export class EmbeddedPageComponent implements OnInit {
  @Input() field: Field;
  @Input() group: FormGroup;
  showControl = true;

  constructor(public el: ElementRef, public formService: CreateFormService) { }
  ngOnInit() {
    this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    this.group.removeControl(undefined);
    if (this.field.name) {
      this.group.removeControl(this.field.name);
    }
  }

}