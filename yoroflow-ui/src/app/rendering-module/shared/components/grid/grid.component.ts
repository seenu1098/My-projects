import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Field } from '../../vo/page-vo';
import { ActivatedRoute } from '@angular/router';
import { DynamicQueryBuilderService } from '../../service/dynamic-query-builder.service';
import { LoadFormService } from '../../service/form-service/load-form.service';
import { YorogridComponent } from '../../../../shared-module/yorogrid/yorogrid.component';
import { MatDialog } from '@angular/material/dialog';
import { RenderingConfirmDialogBoxComponent } from '../../../rendering-confirm-dialog-box-component/rendering-confirm-dialog-box-component.component';




@Component({
  selector: 'app-grid',
  template: `  <div [style]="field.style" style="width:100%">
  <div style="margin-top:1%" [style.background-color]="field.rowBackground">
                <app-yorogrid [gridId]="field.control.gridId" #gridConfig
                (individualSelect)="individualSelectCheckbox($event)"
                (isSelect)="isSelectAll($event)" (messageEvent)="receiveMessage($event)" style="width: 100%"></app-yorogrid>
            </div>
            </div>
`,
  styles: []
})
export class GridComponent implements OnInit {
  @Output() public isAllow = new EventEmitter<any>();
  field: Field;
  group: FormGroup;
  pageIdentifier: string;
  version: any;
  @ViewChild('gridConfig', { static: true }) gridConfig: YorogridComponent;
  isEdit: boolean;

  constructor(public el: ElementRef, public activateRoute: ActivatedRoute, private dialog: MatDialog
    , public service: DynamicQueryBuilderService, public loadFormService: LoadFormService, public changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    this.group.removeControl(this.field.name);
    this.isEdit = this.group.get('update').value;
    this.activateRoute.paramMap.subscribe(params => {
      if (params.get('id') !== null) {
        this.pageIdentifier = params.get('id');
      }
      if (params.get('version') !== null) {
        this.version = params.get('version');
      } else {
        this.version = this.group.get('version').value;
      }
    });
    this.changeDetectorRef.markForCheck();
  }

  receiveMessage($event) {
    // this.loadFormService.testsetFormValues(this.group, this.getJsonObject(), this.pageIdentifier);
    this.service.getGridData(this.field.control.targetPageId, $event.col1, this.version).subscribe(data => {
      this.isAllow.emit(true);
      this.loadFormService.testsetFormValues(this.group, data.data, this.field.control.targetPageId, this.isEdit,
        null, this.version);
      // this.loadFormService.setFormValues(this.group, data.data);
    });

    // if (this.field.control && this.field.control.targetPageId && $event.col1 &&
    //   this.field.control.targetPageId === 'priorauthorization') {
    //   this.openEligibility($event.col1);
    // }
  }

  openEligibility(priorAuthId) {
    const dialogRef = this.dialog.open(RenderingConfirmDialogBoxComponent, {
      width: '440px',
      data: {
        type: 'pa-utilization',
        id: priorAuthId
      }
    });
  }


  isSelectAll(event) {
  }

  individualSelectCheckbox(event: any): void {
  }

  getJsonObject() {
    return {
      yorosisPageId: 56,
      id: 1,
      toothCode: '001',
      toothStatus: 'cleaned',
      nestedNumber: 3,
      nestedText: 'test',
      codes: [
        {
          code: 1,
          codeName: 'name'
        },
        {
          code: 2,
          codeName: 'name2'
        },
        {
          code: 3,
          codeName: 'name3'
        }]
    };
  }
}
