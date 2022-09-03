import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray } from '@angular/forms';
import { MenuVO, MenuDetailsVO } from './menu-vo';
import { MenuService } from './menu.service';
import { SnackbarComponent } from '../shared/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRightSheet } from 'mat-right-sheet';

import { Application } from '../application-provision/appication-vo';
import { DashboardService } from '../dashboard/dashboard.service';
import { ApplicationProvisionService } from '../application-provision/application-provision-service';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterEvent } from '@angular/router';
import { Observable } from 'rxjs';
// tslint:disable-next-line: max-line-length
import { RenderingConfirmDialogBoxComponent } from '../rendering-confirm-dialog-box-component/rendering-confirm-dialog-box-component.component';
import { Page } from '../shared/vo/page-vo';
import { debounceTime } from 'rxjs/operators';
import { YorogridComponent } from '../yorogrid/yorogrid.component';



@Component({
  selector: 'app-rendering-menu-configuration',
  templateUrl: './rendering-menu-configuration.component.html',
  styleUrls: ['./rendering-menu-configuration.component.css']
})
export class RenderingMenuConfigurationComponent implements OnInit {
  form: FormGroup;
  menuVO = new MenuVO();
  applicationsList: Application[] = [];
  @ViewChild('MenuConfig', { static: true }) menuConfig: YorogridComponent;
  applicationCount: number;
  canDeactivateForm: boolean;
  urlData: any;
  pageNameOptions: Page[];
  parentNameOptions: MenuDetailsVO[];
  selectedDisplayNumber: number[] = [];

  constructor(private fb: FormBuilder, private menuService: MenuService, private service: DashboardService
    , private dialog: MatDialog, private router: Router
    , private snackBar: MatSnackBar, private rightSheet: MatRightSheet, private appplicationService: ApplicationProvisionService, ) {
    this.getRouterLink();
  }

  ngOnInit() {
    this.initialize();
    this.loadApplicationsList();
    this.checkApplicationCount();
    this.pageAutocomplete(0);
    this.parentMenuAutoComplete(0);
    this.formValueChange();
    if (this.form.touched === false) {
      this.canDeactivateForm = false;
    }
  }

  pageAutocomplete(i) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    const index = '' + i;
    const menuForm = formArray.get(index);
    menuForm.get('pageName').valueChanges.pipe(debounceTime(1300)).subscribe(
      data => {
        if (menuForm.get('pageName').value !== '') {
          this.menuService.getPageNames(menuForm.get('pageName').value).subscribe(result => {
            this.pageNameOptions = result;
          });
        }
      });

  }

  parentMenuAutoComplete(i) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    const index = '' + i;
    const menuForm = formArray.get(index);
    menuForm.get('parentMenu').valueChanges.pipe(debounceTime(1300)).subscribe(
      data => {
        if (menuForm.get('parentMenu').value !== '' || menuForm.get('parentMenu').value !== null) {
          this.menuService.getParentMenuNames(menuForm.get('parentMenu').value).subscribe(result => {
            this.parentNameOptions = result;
          });
        }
      });
  }

  initialize() {
    this.form = this.fb.group({
      menuId: [this.menuVO.menuId],
      menuName: [this.menuVO.menuName, Validators.required],
      menuOrientation: [this.menuVO.menuOrientation, Validators.required],
      collapsible: [this.menuVO.collapsible],
      applicationName: [this.menuVO.applicationName, Validators.required],
      applicationId: [this.menuVO.applicationId],
      menuDetails: this.fb.array([
        this.addMenuDetailsGroup()
      ]),
    });
  }

  addMenuDetailsGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      menuName: ['', Validators.required],
      pageName: ['', Validators.required],
      pageId: [],
      parentMenuId: [],
      parentMenu: [''],
      displayOrder: [''],
      dynamicMenus: []
    });
  }

  getBooleanAsString(value): any {
    if (value === null || value === false || value === '') {
      return 'N';
    } else {
      return 'Y';
    }
  }

  getMenuDetailsFormArray() {
    return (this.form.get('menuDetails') as FormArray).controls;
  }

  addAnotherMenuDetails(i) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    formArray.push(this.addMenuDetailsGroup());
    this.pageAutocomplete((i + 1));
  }


  setPageId(columnIndex, id) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    const index = '' + columnIndex;
    const menuForm = formArray.get(index);
    menuForm.get('pageId').setValue(id);
  }

  setParentId(columnIndex, id) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    const index = '' + columnIndex;
    const menuForm = formArray.get(index);
    menuForm.get('parentMenuId').setValue(id);
  }

  removeMenuDetails(i: number) {
    const form = (this.form.get('menuDetails') as FormArray);
    form.removeAt(i);
  }

  formValueChange() {
    this.form.valueChanges.subscribe(data => {
      this.canDeactivateForm = true;
    });
  }


  checkApplicationCount() {
    this.appplicationService.getApplicationCount().subscribe(data => {
      this.applicationCount = data.count;
    });
  }


  loadApplicationsList() {
    this.service.getApplicationList().subscribe(data => {
      this.applicationsList = data;
    });
  }

  setApplicationId(event, id) {
    if (event.isUserInput === true) {
      this.form.get('applicationId').setValue(id);
    }
  }
  receiveMessage($event) {
    this.menuService.getMenuInfo($event.col4).subscribe(
      data => {
        this.menuVO = data;
        this.ngOnInit();
        if (this.menuVO.collapsible === 'Y') {
          this.form.get('collapsible').setValue(true);
        } else {
          this.form.get('collapsible').setValue(false);
        }

        for (let i = 0; i < this.menuVO.menuDetails.length; i++) {
          if (i > 0) {
            this.addAnotherMenuDetails(i - 1);
          }
          const index = '' + i;
          const form = (this.form.get('menuDetails') as FormArray).get(index);
          form.setValue(this.menuVO.menuDetails[i]);
          form.updateValueAndValidity();
        }
      });


  }

  save(userForm: NgForm) {
    this.menuVO = this.form.value;
    if (userForm.valid) {
      this.menuVO = this.form.value;
      this.menuVO.collapsible = this.getBooleanAsString(this.menuVO.collapsible);
      this.menuService.save(this.menuVO).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });

        this.reset(userForm);
        this.canDeactivateForm = false;
        this.menuConfig.refreshGrid();
      });
    }
  }

  reset(userForm: NgForm) {
    this.menuVO = new MenuVO();
    this.initialize();
    userForm.resetForm();
    this.pageAutocomplete(0);
    this.parentMenuAutoComplete(0);
    this.canDeactivateForm = false;
  }

  addValidatorDisplayOrder(i: number) {
    const index = '' + i;
    const formArray = (this.form.get('menuDetails') as FormArray);
    const form = formArray.get(index);
    form.get('displayOrder').valueChanges.pipe(debounceTime(1000))
      .subscribe(data => {
        const displayNumberIndex = this.selectedDisplayNumber.indexOf(data);
        if (displayNumberIndex > -1 && data !== null && displayNumberIndex !== i) {
          form.get('displayOrder').setErrors({ 'alreadyExist': true });
        } else {
          if (data !== '') {
            this.selectedDisplayNumber[i] = data;
          }
        }
      });
  }

  canDeactivate(): Observable<boolean> | boolean {


    if (this.canDeactivateForm) {
      this.canDeactivateForm = false;
      const dialogRef = this.dialog.open(RenderingConfirmDialogBoxComponent, {
        width: '250px',
        data: this.urlData
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data === false) {
          this.canDeactivateForm = true;
        }
      });
      return false;
    }
    return true;
  }

  getRouterLink(): any {
    this.router.events.subscribe((data: RouterEvent) => {
      this.urlData = {
        'type': 'navigation', 'target': data.url
      };
    });
    return this.urlData;
  }
}
