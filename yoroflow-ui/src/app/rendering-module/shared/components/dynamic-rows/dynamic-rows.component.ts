import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Page, Row } from '../../vo/page-vo';

@Component({
  selector: 'app-dynamic-rows',
  template: `
  <ng-container  *ngFor="let row of rows">
  <div [fxLayoutAlign]="row.alignment" [style]="row.style">
  <div [fxLayout]="row.layoutDirection" [fxLayout.lt-sm]="row.layoutResponsiveDirection" [style.background-color]="row.rowBackground" [fxLayoutAlign]="row.alignment"
  [fxLayoutGap]="row.layoutGap+'px'" fxLayoutGap.lt-md="10px" fxLayoutGap.lt-sm="10px"
  *ngIf="row && row.alignment" [style.width.%]=row.rowWidth>
          <ng-container *ngFor="let field of row.columns;" dynamicField [fieldConfig]="field" [page]="page"
                [group]="group" (getComponentFromRow)="getChipComponentInstance($event)">
          </ng-container>
 </div>
 </div>
 </ng-container>
`,
  styles: []
})
export class DynamicRowsComponent implements OnInit {

  @Input() rows: Row[];
  @Input() group: FormGroup;
  @Input() page: Page;
  @Output() getComponentFromRow: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }
  ngOnInit() {
  }

  getChipComponentInstance($event) {
    this.getComponentFromRow.emit($event);
  }

}
