import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA } from 'mat-right-sheet';
import { FormGroup } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DynamicQueryBuilderService } from '../shared/service/dynamic-query-builder.service';
import { LoadFormService } from '../shared/service/form-service/load-form.service';


@Component({
  selector: 'app-application-right-sheet',
  templateUrl: './application-right-sheet.component.html',
  styleUrls: ['./application-right-sheet.component.css']
})
export class ApplicationRightSheetComponent implements OnInit {

  constructor(private rightSheetRef: MatRightSheetRef<ApplicationRightSheetComponent>, @Inject(MAT_RIGHT_SHEET_DATA) public data: any,
    private dataService: DynamicQueryBuilderService, private loadFormService: LoadFormService) { }

  form: FormGroup;


  ngOnInit() {

  }

  getFormAndsubmitEvent($event) {

  }

  close() {
    this.rightSheetRef.dismiss();
  }

}
