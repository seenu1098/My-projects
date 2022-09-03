import { Component, ElementRef, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { Card, Field, OptionsValue } from '../../vo/page-vo';

@Component({
  selector: 'app-card',
  template: `
  <div [style]="field.style">
  <div [style.background-color]="field.rowBackground">
  <div *ngIf="showControl" style="margin-top:2%"  >
  <input type="hidden"/>
  <ng-container *ngFor="let itemArray of dynamicOptions;let i=index">
  <div fxLayout="row wrap">
  <ng-container *ngFor="let item of itemArray;let j=index">
  <div fxLayout="column">
    <label *ngIf="this.group.get(this.field.name).status === 'DISABLED'" class="form-control"
    [ngStyle]="{backgroundColor: (dynamicOptions[i][j].code === selectedIndex || previousIndex===dynamicOptions[i][j].code) ? field.control.hoverColor : 'white', 'border': '1px solid' + field.control.borderColor}">{{item.description}}</label>
  <label *ngIf="this.group.get(this.field.name).status !== 'DISABLED'" (click)="openCard(item.code)" [ngStyle]="{backgroundColor: (dynamicOptions[i][j].code === selectedIndex || previousIndex===dynamicOptions[i][j].code) ? field.control.hoverColor : 'white', 'border': '1px solid' + field.control.borderColor}"
  (mouseover)="showDivWithHoverStyles(item.code)" (mouseout)="showDivWithoutHoverStyles()" class="form-control">{{item.description}}</label>
  <ng-container *ngIf="item.valueDescription">
  <label class="form-control-label">{{item.valueDescription}}</label>
  </ng-container>
  </div>
  </ng-container>
  </div>
  </ng-container>
  </div>
  </div>
    
  </div>
  `,
  styles: [`.form-control {
    display: block;
    height: 70%;
    padding:  5px 25px;
    font-size: 1rem;
    font-weight: bold;
    line-height: 3.5;
    color: black;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid  #0078ff;
}
.form-control-label {
  display: block;
  height: 50%;
  padding:  5px 25px;
  font-size: 1rem;
  font-weight: bold;
  line-height: 1.5;
  color: black;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid  #1bef48;
}`]
})
export class CardComponent implements OnInit {
  field: Field;
  constructor(public el: ElementRef, public dynamicService: DynamicQueryBuilderService) { }


  group: FormGroup;
  publicPage = false;
  pageId: any;
  version: any;
  dynamicOptions: any[][] = [];
  showControl = false;
  selectedIndex: any;
  backGroundColor: any;
  previousIndex: any;
  ngOnInit(): void {
    this.el.nativeElement.style.width = '100%';
    this.el.nativeElement.style.marginTop = '3%';
    this.checkPublicPage();
    this.loadConstantOptions();
    this.formValueChanges();
    this.previousIndex = this.group.get(this.field.name).value;
  }

  formValueChanges() {
    this.group.get(this.field.name).valueChanges.subscribe(data => {
        if (data !== null && data !== '') {
          this.selectedIndex = data;
          this.previousIndex = data;
          this.group.markAsDirty();
        }
    });
}


  showDivWithHoverStyles(code) {
    this.selectedIndex = code;
  }

  openCard(code) {

    this.group.get(this.field.name).setValue(code);
    this.selectedIndex = code;
    this.previousIndex = code;
  }

  showDivWithoutHoverStyles() {
    this.selectedIndex = null;
    this.previousIndex = this.previousIndex;
  }

  checkPublicPage() {
    if (this.group.get('pageIdentifier') && this.group.get('version')) {
      this.pageId = this.group.get('pageIdentifier').value;
      this.version = this.group.get('version').value;
    } else if (this.group.parent && this.group.parent.get('pageIdentifier')) {
      this.pageId = this.group.parent.get('pageIdentifier').value;
      this.version = this.group.parent.get('version').value;
    } else if (this.group.parent && this.group.parent.parent && this.group.parent.parent.get('pageIdentifier')) {
      this.pageId = this.group.parent.parent.get('pageIdentifier').value;
      this.version = this.group.parent.parent.get('version').value;
    }

    if (this.group.get('publicpage')) {
      this.publicPage = true;
    } else if (this.group.parent && this.group.parent.get('publicpage')) {
      this.publicPage = true;
    } else if (this.group.parent && this.group.parent.parent && this.group.parent.parent.get('publicpage')) {
      this.publicPage = true;
    } else {
      this.publicPage = false;
    }
  }

  loadConstantOptions() {
    if (this.field.control.optionType === "s") {
      this.loadCardData(this.field.control.optionsValues);
    } else {
      if (this.publicPage) {
        this.dynamicService.getPublicListValues(this.pageId, this.field.name,
          this.version).subscribe(data => {
            this.loadCardData(data);
          });
      } else {
        this.dynamicService.getListValues(this.pageId, this.field.name,
          this.version).subscribe(data => {
            this.loadCardData(data);
          });
      }
    }

  }

  loadCardData(data) {
    const card = this.field.control as Card;
    if (data !== [] && data !== null && data.length > 0) {
      card.noOfRows = data.length / card.noOfColumns;
      for (let i = 0; i < card.noOfRows; i++) {
        let columns: any[] = []
        for (let j = 0; j < data.length; j++) {
          if (i === 0 && j < card.noOfColumns) {
            columns.push(data[j]);
          }
          if (i > 0) {
            const start = i * card.noOfColumns;
            const end = (i * card.noOfColumns) + card.noOfColumns;
            if (j >= start && j < end) {
              // columns.push(this.imagesList[j]);
              columns.push(data[j]);
            }
          }

        }
        if (columns.length > 0) {
          this.dynamicOptions.push(columns);
        }
        columns = [];
      }
      this.showControl = true;
      // if (this.field.control.optionType === 'd' && this.field.control.filter
      //   && this.field.control.filter.loadFirstOption && this.dynamicOptions.length === 1) {
      //   this.group.get(this.field.name).setValue(this.dynamicOptions[0].code);
      // }
    }
  }
}


