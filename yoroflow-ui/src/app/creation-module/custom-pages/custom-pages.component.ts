import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomPageService } from './custom-page.service';
import { CustomPageVo } from './custom-page-vo';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { YoroSecurityComponent } from '../yoro-security/yoro-security.component';
import { MatRightSheet } from 'mat-right-sheet';


@Component({
  selector: 'lib-custom-pages',
  templateUrl: './custom-pages.component.html',
  styleUrls: ['./custom-pages.component.css']
})
export class CustomPagesComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private service: CustomPageService,
    private rightSheet: MatRightSheet) { }
  customPageForm: FormGroup;
  jsonValue: any;
  customPageVo = new CustomPageVo();
  ngOnInit(): void {
    this.initializeCustomPageForm();
  }

  initializeCustomPageForm() {
    this.customPageForm = this.formBuilder.group({
      id: [this.customPageVo.id],
      pageId: [this.customPageVo.pageId, [Validators.required]],
      pageName: [this.customPageVo.pageName, [Validators.required]],
      menuPath: [this.customPageVo.menuPath],
      jsonText: [this.customPageVo.jsonText],
    });
  }

  submit(userForm) {
    if (userForm.valid) {
      this.customPageVo = this.customPageForm.getRawValue();
      this.customPageVo.jsonText = this.jsonValue;
      this.service.save(this.customPageVo).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response
        });
        userForm.resetForm();
      });
    }
  }

  openPagePermissions(id: string) {
    const pagePermissionsSheet = this.rightSheet.open(YoroSecurityComponent, {
      disableClose: true,
      // tslint:disable-next-line: object-literal-key-quotes
      data: { 'id': id, 'securityType': 'custom-page' },
      panelClass: 'dynamic-right-sheet-container',
    });
  }

  reset(userForm) {
    userForm.resetForm();
  }

  getJsonText() {
    const json = this.customPageForm.get('jsonText');
    if (json.value) {
      try {
        JSON.parse(json.value);
        this.jsonValue = JSON.parse(json.value);
      } catch (e) {
        json.setErrors({ validationError: true });
      }
    }

  }

  receiveMessage($event): void {
    this.service.getCustomPageDetails($event.col1).subscribe(data => {
      this.customPageVo = data;
      this.ngOnInit();
    });
  }

}
