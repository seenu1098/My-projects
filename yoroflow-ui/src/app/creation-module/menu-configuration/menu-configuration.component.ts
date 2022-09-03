import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { MenuVO, MenuDetailsVO } from './menu-vo';
import { MenuService } from './menu.service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { MatRightSheet } from 'mat-right-sheet';


// import { ApplicationProvisionService } from '../application-provision/application-provision-service';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Router, RouterEvent } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { Page } from '../shared/vo/page-vo';
import { debounceTime } from 'rxjs/operators';
import { Application } from '../shared/vo/appication-vo';
import { CustomPage } from '../shared/vo/custom-page-vo';
import { MatRightSheet } from 'mat-right-sheet';
import { YoroSecurityComponent } from '../yoro-security/yoro-security.component';

export class MenuName {
  index: number;
  value: string;
}

@Component({
  selector: 'app-menu-configuration',
  templateUrl: './menu-configuration.component.html',
  styleUrls: ['./menu-configuration.component.css']
})
export class MenuConfigurationComponent implements OnInit {
  form: FormGroup;
  menuVO = new MenuVO();
  applicationsList: Application[] = [];

  @Input() isFromPageCreation: boolean;
  @Input() applicationName: any;
  @Input() appId: any;
  @Output() response: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('MenuConfig', { static: false }) menuConfig: YorogridComponent;
  applicationCount: number;
  canDeactivateForm: boolean;
  urlData: any;
  pageNameOptions: Page[];
  parentNameOptions: MenuDetailsVO[];
  selectedDisplayNumber: number[] = [];
  deletedIDList: string[] = [];
  showMenuWarning: any;
  pageType = [] as any;
  isTabbedMenu: boolean;
  customPageList: CustomPage[];
  oldMenuName: any;
  hasParentMenu = false;
  validationMenuVO: MenuDetailsVO[];
  parentMenuEnable = false;
  isApplicationDisable = false;

  constructor(private fb: FormBuilder, private menuService: MenuService, private dialog: MatDialog
    , private router: Router, private snackBar: MatSnackBar, private rightSheet: MatRightSheet) {
    this.getRouterLink();
  }

  iconList = [{ value: 'groups', name: 'Team' },
  { value: 'engineering', name: 'Workflow' },
  { value: 'add_task', name: 'Tasks' },
  { value: 'important_devices', name: 'Application' },
  { value: 'admin_panel_settings', name: 'Administration' },
  { value: 'loop', name: 'Processes' },
  { value: 'dashboard', name: 'Dashboard' }];

  ngOnInit() {
    if (this.isFromPageCreation) {
      this.isTabbedMenu = true;
    }
    this.initialize();
    this.loadApplicationsList();
    this.loadCustomPageList();
    // this.checkApplicationCount();
    this.pageAutocomplete(0);
    // this.parentMenuAutoComplete(0);
    this.formValueChange();
    if (this.form.touched === false) {
      this.canDeactivateForm = false;
    }
    if (this.isFromPageCreation) {
      this.form.get('applicationName').setValue(this.applicationName);
    }
    this.enableParentMenu();
  }

  enableParentMenu() {
    if (this.parentNameOptions !== undefined && this.parentNameOptions.length > 0) {
      this.parentMenuEnable = true;
    } else {
      this.parentMenuEnable = false;
    }
  }

  omit_number(event) {
    let k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k === 32 || (k >= 48 && k <= 57));
  }

  loadCustomPageList() {
    this.menuService.getCustomPageList().subscribe(data => {
      this.customPageList = data;
    });
  }

  pageAutocomplete(i) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    const index = '' + i;
    const menuForm = formArray.get(index);
    const pageType = formArray.get(index);
    menuForm.get('pageName').valueChanges.pipe(debounceTime(1300)).subscribe(
      data => {
        if (menuForm.get('pageName').value !== '' && menuForm.get('pageName').value !== null
          && pageType.get('pageType').value === 'pageName') {
          this.menuService.getPageNames(menuForm.get('pageName').value).subscribe(result => {
            this.pageNameOptions = result;
          });
        }
      });
  }

  // parentMenuAutoComplete(i) {
  //   const formArray = (this.form.get('menuDetails') as FormArray);
  //   const index = '' + i;
  //   const menuForm = formArray.get(index);
  //   menuForm.get('parentMenu').valueChanges.pipe(debounceTime(1300)).subscribe(
  //     data => {
  //       if (menuForm.get('parentMenu').value !== '' || menuForm.get('parentMenu').value !== null) {
  //         this.menuService.getParentMenuNames(menuForm.get('parentMenu').value).subscribe(result => {
  //           this.parentNameOptions = result;
  //         });
  //       }
  //     });
  // }

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

  getColumnName(): MenuName[] {
    const formArray = this.form.get('menuDetails') as FormArray;
    const columnNames: MenuName[] = [];
    for (let i = 0; i < formArray.length; i++) {
      const columnName = formArray.get('' + i).get('menuName').value;
      if (columnName !== null && columnName !== undefined && columnName !== '') {
        columnNames.push({ index: i, value: columnName });
      }
    }
    return columnNames;
  }

  checkMenuDetailsNameExists(columnIndex, menuFormGroup: FormGroup) {
    this.parentMenuExistsOrNot(columnIndex, menuFormGroup);
    const formArray = (this.form.get('menuDetails') as FormArray);
    const group = this.form.get('menuDetails').get('' + columnIndex);
    const value = group.get('menuName').value;
    const menuName: MenuName[] = this.getColumnName();
    // formArray.get('' + columnIndex).get('menuName').setErrors({ alreadyExistMenuDetails: false });
    // for (let i = 0; i < formArray.length; i++) {
    //   if (i !== columnIndex) {
    //     const index = '' + i;
    //     const menuDetailsForm = formArray.get(index);
    //     if (menuDetailsForm.get('menuName').value === formArray.get('' + columnIndex).get('menuName').value) {
    //       formArray.get('' + columnIndex).get('menuName').setErrors({ alreadyExistMenuDetails: true });
    //     } else {
    //      // formArray.get('' + columnIndex).get('menuName').setErrors(null);
    //       menuDetailsForm.get('menuName').setErrors(null);
    //     }
    //   }
    // }
    for (let i = 0; i < formArray.length; i++) {
      const name = formArray.get('' + i).get('menuName');
      if (menuName.some(field => (field.value === value && field.index !== columnIndex))) {
        group.get('menuName').setErrors({ alreadyExistMenuDetails: true });
      }
      if (name.errors && name.errors.alreadyExistMenuDetails === true) {
        if (!menuName.some(field => (field.index !== i && field.value === name.value))) {
          name.setErrors(null);
        }
      }
    }
  }

  checkMenuNameExists() {
    if (this.form.get('menuName').value !== '' && this.form.get('menuName').value !== null
      && this.oldMenuName !== this.form.get('menuName').value) {
      this.menuService.checkMenuName(this.form.get('menuName').value).subscribe(data => {
        if (data.response !== 'New Name') {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.form.get('menuName').setErrors({ alreadyExist: true });
        }
      });
      this.form.get('menuName').setValue(this.form.get('menuName').value);
    }
  }

  validateFormGroupMenuName(menuFormGroup: FormGroup, columnIndex) {
    const menuName = menuFormGroup.get('menuName');
    const parentMenuName = menuFormGroup.get('parentMenu');
    this.validationMenuVO = (this.form.get('menuDetails') as FormArray).value;
    if (menuName.value && parentMenuName.value &&
      this.checkMenuNameExistInParentMenu(menuName.value, parentMenuName.value)) {
      console.error('Set validators');
      menuName.setErrors({ alreadyExistMenuDetails: true });
    } else {
      menuName.setErrors(null);
    }
  }

  checkMenuNameExistInParentMenu(menuName, parentMenuName) {
    const array = this.validationMenuVO.slice().sort((m1, m2) => m1.menuName.localeCompare(m2.menuName))
      .filter(m => m.menuName === menuName).slice().
      filter(m1 => m1.parentMenu === parentMenuName);
    return array.length > 1;
  }

  checkMenuExist() {
    if (this.appId !== null && this.appId !== '' && this.appId !== undefined) {
      this.form.get('applicationId').setValue(this.appId);
    }
    const appId = this.form.get('applicationId').value;
    const orientation = this.form.get('menuOrientation').value;
    if (appId != null && orientation !== undefined && orientation !== null) {
      this.menuService.checkMenuExistOrNot(this.form.get('applicationId').value, this.form.get('menuOrientation').value).subscribe(data => {
        if (data.exist === false) {
          const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
            width: '250px',
            data: { type: 'menuExist', response: data.response }
          });
          dialogRef.afterClosed().subscribe(afterClose => {
            if (afterClose === false) {
              this.form.get('menuOrientation').setValue(this.menuVO.menuOrientation);
            } else if (afterClose === true) {
              this.loadGrid(data.menuId);
            }
          });
        }
      });
    }
  }

  addMenuDetailsGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      menuName: ['', Validators.required],
      pageType: [],
      pageName: [],
      menuPath: [''],
      pageId: [],
      parentMenuId: [],
      parentMenu: [],
      displayOrder: ['', Validators.required],
      customPageId: [],
      dynamicMenus: [],
      version: [],
      icon: []
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

  removeMenuPath(event, formGroup: FormGroup) {
    if (event.isUserInput === true) {
      formGroup.get('menuPath').setValue(null);
      formGroup.get('customPageId').setValue(null);
    }
  }

  setMenuPath($event, customPage: CustomPage, formGroup: FormGroup) {
    const menuType = formGroup.get('pageType').value;
    if ($event.isUserInput === true) {
      if (menuType === 'customPage') {
        formGroup.get('pageId').setValue(null);
        formGroup.get('menuPath').setValue(customPage.menuPath);
        formGroup.get('customPageId').setValue(customPage.id);
      }
    }

    if (menuType === 'pageName') {
      formGroup.get('pageName').setValue(null);
      formGroup.get('customPageId').setValue(null);
    } else if (menuType === 'menuPath') {
      formGroup.get('menuPath').setValue(null);
      formGroup.get('customPageId').setValue(null);
      formGroup.get('pageId').setValue(null);
    }
  }

  selectPageType(event: MatSelectChange, i: number, formGroup) {
    this.pageType[i] = event.value;
    const menuType = formGroup.get('pageType').value;
    if (menuType === 'customPage') {
      formGroup.get('pageId').setValue(null);
      formGroup.get('menuPath').setValue(null);
      formGroup.get('customPageId').setValue(null);
      formGroup.get('pageName').setValue(null);
      formGroup.get('pageName').setValidators(Validators.required);
    }
    if (menuType === 'pageName') {
      formGroup.get('pageId').setValue(null);
      formGroup.get('menuPath').setValue(null);
      formGroup.get('pageName').setValue(null);
      formGroup.get('customPageId').setValue(null);
      formGroup.get('pageName').setValidators(Validators.required);
    } else if (menuType === 'menuPath') {
      formGroup.get('menuPath').setValue(null);
      formGroup.get('pageName').setValue(null);
      formGroup.get('customPageId').setValue(null);
      formGroup.get('pageId').setValue(null);
    } else if (menuType === '') {
      formGroup.get('pageId').setValue(null);
      formGroup.get('menuPath').setValue(null);
      formGroup.get('pageName').setValue(null);
      formGroup.get('customPageId').setValue(null);
      formGroup.get('pageName').setValidators(null);
    }
    if (menuType !== 'customPage' && menuType !== 'pageName') {
      formGroup.get('pageName').clearValidators();
      formGroup.get('pageName').updateValueAndValidity();
    }
  }

  setAutocompleteValidation(columnIndex) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    const index = '' + columnIndex;
    const menuForm = formArray.get(index);
    if (menuForm.get('pageName').value !== '' && menuForm.get('pageName').value !== null &&
      !this.pageNameOptions.some(pageName => pageName.pageName === menuForm.get('pageName').value)) {
      menuForm.get('pageName').setErrors({ invalidPageName: true });
    }
  }

  removePageId(event, columnIndex) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    const index = '' + columnIndex;
    const menuForm = formArray.get(index);
    if (event.isUserInput === true) {
      menuForm.get('pageId').setValue('');
    }
  }

  setPageId(columnIndex, id) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    const index = '' + columnIndex;
    const menuForm = formArray.get(index);
    menuForm.get('pageId').setValue(id);
    menuForm.get('menuPath').setValue(null);
    menuForm.get('customPageId').setValue(null);
  }

  parentMenuExistsOrNot(columnIndex, menuFormGroup: FormGroup) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    const index = '' + columnIndex;
    const menuForm = formArray.get(index);
    if (this.parentNameOptions !== undefined && this.parentNameOptions[columnIndex] !== undefined) {
      const parentMenuName = this.parentNameOptions[columnIndex].menuName;
      for (let j = 0; j < formArray.length; j++) {
        const columnIndexMenu = '' + j;
        const menuDetailsForm = formArray.get(columnIndexMenu);
        if (menuDetailsForm.get('parentMenu').value === parentMenuName) {
          menuDetailsForm.get('parentMenu').setValue(menuForm.get('menuName').value);
        }
        menuDetailsForm.markAllAsTouched();
        menuDetailsForm.updateValueAndValidity();
      }
      this.parentNameOptions[columnIndex].menuName = menuForm.get('menuName').value;
      formArray.markAllAsTouched();
      formArray.updateValueAndValidity();
      this.validateFormGroupMenuName(menuFormGroup, columnIndex);
    }
  }

  setParentId(columnIndex, option) {
    const formArray = (this.form.get('menuDetails') as FormArray);
    const index = '' + columnIndex;
    const menuForm = formArray.get(index);
    if (menuForm !== null) {
      menuForm.get('parentMenuId').setValue(option.id);
      menuForm.get('icon').setValue('');
    }
  }

  deletedList(i, form: FormArray, menuName) {
    form.removeAt(i);
    this.addMenuDetailsArray(form);
    if (this.parentNameOptions !== undefined) {
      let removeIndex = this.parentNameOptions.findIndex(x => x.menuName === menuName);
      if (removeIndex !== -1) {
        this.parentNameOptions.splice(removeIndex, 1);
      }
    }
    for (let j = 0; j < form.length; j++) {
      if (form.get(j + '').get('parentMenu').value === menuName) {
        this.removeMenuDetails(j, false);
        // if (this.parentNameOptions !== undefined) {
        //   let removeIndex = this.parentNameOptions.findIndex(x => x.parentMenu === menuName);
        //   if (removeIndex !== -1) {
        //     this.parentNameOptions.splice(removeIndex, 1);
        //   }
        // }
        // const delChildId = form.get(j + '').get('id').value;
        // this.deletedIDList.push(delChildId);
        // form.removeAt(j);
        // this.addMenuDetailsArray(form);
      }
    }
  }

  removeMenuDetails(i: number, checkConfirm: boolean) {
    const form = (this.form.get('menuDetails') as FormArray);
    const index = '' + i;
    const deletedID = form.get(index).get('id').value;
    const parentMenu = form.get(index).get('parentMenu').value;
    const menuName = form.get(index).get('menuName').value;
    this.hasParentMenu = false;
    for (let j = 0; j < form.length; j++) {
      const columnIndexMenu = '' + j;
      const menuDetailsForm = form.get(columnIndexMenu);
      if (menuDetailsForm.get('parentMenu').value === menuName) {
        this.hasParentMenu = true;
      }
    }
    //  if ((parentMenu === null || parentMenu === '')) {
    if (menuName && this.hasParentMenu) {
      if (checkConfirm) {
        const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
          width: '250px',
          data: { type: 'parentMenu', id: deletedID }
        });
        dialogRef.afterClosed().subscribe(data => {
          if (data === true) {
            if (deletedID !== null && deletedID !== '') {
              this.deletedIDList.push(deletedID);
              this.deletedList(i, form, menuName);
            }
            this.form.markAsDirty();
          }
        });
      } else {
        this.deletedIDList.push(deletedID);
        this.deletedList(i, form, menuName);
      }
    } else {
      if (deletedID !== null && deletedID !== '') {
        this.deletedIDList.push(deletedID);
        this.form.markAsDirty();
      }
      if (this.parentNameOptions !== undefined) {
        let removeIndex = this.parentNameOptions.findIndex(x => x.menuName === menuName);
        if (removeIndex !== -1) {
          this.parentNameOptions.splice(removeIndex, 1);
        }
      }
      form.removeAt(i);
      this.addMenuDetailsArray(form);
    }
  }

  addMenuDetailsArray(form: FormArray) {
    if (form.length === 0) {
      form.push(this.addMenuDetailsGroup());
      this.pageAutocomplete(0);
      this.enableParentMenu();
    }
  }

  formValueChange() {
    this.form.valueChanges.subscribe(data => {
      this.canDeactivateForm = true;
    });
  }


  // checkApplicationCount() {
  //   this.appplicationService.getApplicationCount().subscribe(data => {
  //     this.applicationCount = data.count;
  //   });
  // }


  loadApplicationsList() {
    this.menuService.getApplicationList().subscribe(data => {
      this.applicationsList = data;
    });
  }

  setApplicationId(event, id) {
    if (event.isUserInput === true) {
      this.form.get('applicationId').setValue(id);
    }
  }

  setIconName(i, name) {
    // const index = '' + i;
    // const form = (this.form.get('menuDetails') as FormArray).get(index);
    // form.get('icon').setValue(name);
  }

  receiveMessage($event) {
    this.loadGrid($event.col4);
  }
  loadGrid(menuId) {
    this.isApplicationDisable = true;
    this.menuService.getMenuInfo(menuId).subscribe(
      data => {
        if (data.isManaged === true) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'It is a Managed Menu',
          });
          this.ngOnInit();
        } else {
          this.menuVO = data;
          this.ngOnInit();
          this.oldMenuName = this.menuVO.menuName;
          if (this.menuVO.collapsible === 'Y') {
            this.form.get('collapsible').setValue(true);
          } else {
            this.form.get('collapsible').setValue(false);
          }
          if (this.menuVO.menuDetails !== null) {
            this.parentNameOptions = this.menuVO.menuDetails;
            this.deletedIDList = [];
            for (let i = 0; i < this.menuVO.menuDetails.length; i++) {
              if (i > 0) {
                this.addAnotherMenuDetails(i - 1);
              }
              const index = '' + i;
              const form = (this.form.get('menuDetails') as FormArray).get(index);
              this.pageType[i] = this.menuVO.menuDetails[i].pageType;
              form.patchValue(this.menuVO.menuDetails[i]);
              if (this.pageType[i] === 'pageName' || this.pageType[i] === 'customPage') {
                form.get('pageName').setValue(this.menuVO.menuDetails[i].pageName);
              }
              if (this.pageType[i] === 'customPage' || this.pageType[i] === 'menuPath') {
                form.get('menuPath').setValue(this.menuVO.menuDetails[i].menuPath);
              }
              form.updateValueAndValidity();
            }
            this.enableParentMenu();
          }
        }
      });

  }

  removeDuplicate(deletedIDList) {
    const columnNames: any[] = [];
    // tslint:disable-next-line:prefer-for-of
    deletedIDList.forEach(columnName => {
      if (!columnNames.some(field => (field === columnName))) {
        columnNames.push(columnName);
      }
    });
    return columnNames;
  }

  save(userForm) {
    this.menuVO = this.form.value;

    if (this.deletedIDList !== []) {
      this.menuVO.deleteMenuDetailsIdList = this.removeDuplicate(this.deletedIDList);
      // this.menuVO.deleteMenuDetailsIdList = this.deletedIDList;
    } else {
      this.menuVO.deleteMenuDetailsIdList = [];
    }
    if (this.isTabbedMenu === true && this.appId) {
      this.form.get('applicationName').setValue(this.applicationName);
      this.form.get('applicationId').setValue(this.appId);
    }

    if (userForm.valid) {
      for (let i = 0; i < this.menuVO.menuDetails.length; i++) {
        if (this.menuVO.menuDetails[i].pageName === null && this.menuVO.menuDetails[i].menuPath === null
          && this.menuVO.menuDetails[i].menuPath === '' && this.menuVO.menuDetails[i].pageName === '') {
          // alert("Page Name or MenuPath is required");
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Page Name or MenuPath is required',
          });
          return false;
        }
      }
      this.menuVO = this.form.value;

      for (let i = 0; i < this.menuVO.menuDetails.length; i++) {
        if (this.menuVO.menuDetails[i].parentMenu === null || this.menuVO.menuDetails[i].parentMenu === '') {
          this.menuVO.menuDetails[i].parentMenuId = null;
        }
      }

      this.menuVO.collapsible = this.getBooleanAsString(this.menuVO.collapsible);

      this.menuService.save(this.menuVO).subscribe(data => {
        // alert(data.response)
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
        if (this.isTabbedMenu === true) {
          this.response.emit(data);
        }
        if (!this.isTabbedMenu) {
          this.reset(userForm);
          this.canDeactivateForm = false;
          this.menuConfig.refreshGrid();
        }
      });

    }
  }

  reset(userForm) {
    this.menuVO = new MenuVO();
    userForm.resetForm();
    this.isApplicationDisable = false;
    this.initialize();
    this.deletedIDList = [];
    this.parentNameOptions = [];
    this.pageAutocomplete(0);
    // this.parentMenuAutoComplete(0);
    this.parentMenuEnable = false;
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
          form.get('displayOrder').setErrors({ alreadyExist: true });
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
      const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
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
        type: 'navigation', target: data.url
      };
    });
    return this.urlData;
  }
}
