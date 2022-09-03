import { Component, OnInit, ViewChild, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { MatRightSheet } from 'mat-right-sheet';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterEvent } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { Observable, identity } from 'rxjs';
import { YoroSecurityComponent } from '../yoro-security/yoro-security.component';
import { Page, Section, FieldConfig, Row, TabbedMenu, Grid, FieldName, ApplicationLayoutPage } from '../shared/vo/page-vo';
import { Application } from '../shared/vo/appication-vo';
import { RowDetailsComponent } from '../row-details/row-details.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { PageService } from '../page/page-service';
import { SectionComponent } from '../section/section.component';
import { ColumnComponent } from '../column/column.component';
import { FormfieldComponent } from '../formfield/formfield.component';
import { NestedSectionComponent } from '../nested-section/nested-section.component';
import { CreatePageComponent } from '../create-page/create-page.component';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Component({
  selector: 'app-application-layout-page',
  templateUrl: './application-layout-page.component.html',
  styleUrls: ['./application-layout-page.component.scss']
})
export class ApplicationLayoutPageComponent implements OnInit {
  @ViewChild('rowDetailsRef', { static: true })
  rowDetailsRef: RowDetailsComponent;
  @Input() yoroflowVO: any;
  @Output() emitPageId: EventEmitter<any> = new EventEmitter<any>();
  @Output() isChanged: EventEmitter<any> = new EventEmitter<any>();
  page = new Page();
  showDiv: boolean[] = [];
  form: FormGroup;
  fieldWidth = [];
  formControlName: string[] = [];
  fieldName: FieldName[] = [];
  bColorEnable = false;
  showSectionAddIcon = false;
  buttonVisible = false;
  allowSubmitbutton = false;
  sectionBoolean = false;
  securityOptionEnable = true;
  publishOptionEnable = true;
  pageNameOptions: Page[];
  canDeactivateForm: boolean;
  returnvalue: any;
  pageIdentifier: string;
  applicationsList: Application[] = [];
  urlData: any;
  applicationCount: number;
  boxCss = '1px 1px 3px 3px #ff9999';
  isSubmitted = false;
  manageFlag = true;
  isFromWorkflow: boolean;
  isUpdate: boolean;
  workflowapplication = new Application();
  enableSubmit = false;
  versionValue: any;
  isLoadForm = false;
  isWorkflow = false;
  loadControlForPage = false;
  showButtons: boolean[] = [];
  leftFormFields = [
    // { name: '', img: '', disabled: true },
    // { name: 'Text Field', img: 'input', disabled: false, iconName: 'text_fields' },
    // { name: 'Date', img: 'date', disabled: false, iconName: 'today' },
    // { name: 'Text Area', img: 'textarea', disabled: false, iconName: 'short_text' },
    // { name: 'Select-Multiple', img: 'multipleselect', disabled: false, iconName: 'more_vert' },
    // { name: 'Radio Button', img: 'radiobutton', disabled: false, iconName: 'radio_button_unchecked' },
    // { name: 'Chip', img: 'chip', disabled: false, iconName: 'settings_ethernet' },
    { name: $localize`:leftFormFieldsLabel:Label`, img: 'label', disabled: false, iconName: 'label' },
    { name: $localize`:leftFormFieldspara:Paragraph`, img: 'paragraph', disabled: false, iconName: 'notes' },
    { name: $localize`:leftFormFieldsHLink:Hyper Link`, img: 'hyperlink', disabled: false, iconName: 'bookmark' },
    // { name: 'Grid List', img: 'grid', disabled: false, iconName: 'list' },
    // { name: 'File Upload', img: 'fileupload', disabled: false, iconName: 'file_copy' },
    // { name: 'Hidden Control', img: 'hiddencontrol', iconName: 'lock' },
  ];
  rightFormFields = [
    // { name: '', img: '', disabled: true },
    // { name: 'Telephone', img: 'tel', disabled: false, iconName: 'phone' },
    // { name: 'Email', img: 'email', disabled: false, iconName: 'email' },
    // { name: 'Select', img: 'select', disabled: false, iconName: 'arrow_drop_down' },
    // { name: 'Auto Complete', img: 'autocomplete', disabled: false, iconName: 'format_indent_increase' },
    // { name: 'Check Box', img: 'checkbox', disabled: false, iconName: 'check_box' },
    { name: $localize`:rightFormFieldsbtn:Button`, img: 'button', disabled: false, iconName: 'save_alt' },
    { name: $localize`:rightFormFieldsdiv:Divider`, img: 'divider', disabled: false, iconName: 'remove' },
    { name: $localize`:rightFormFieldspage:Page`, img: 'page', disabled: false, iconName: 'ballot' },
    // { name: 'Tabbed Menu', img: 'tabbedmenu', disabled: false, iconName: 'view_list' },
  ];
  rightFormFieldsWorkflow = [
    // { name: '', img: '', disabled: true },
    { name: $localize`:rightFormFieldsWorkflowtel:Telephone`, img: 'tel', disabled: false, iconName: 'phone' },
    { name: $localize`:rightFormFieldsWorkflowem:Email`, img: 'email', disabled: false, iconName: 'email' },
    { name: $localize`:rightFormFieldsWorkflowSel:Select`, img: 'select', disabled: false, iconName: 'arrow_drop_down' },
    { name: $localize`:rightFormFieldsWorkflowAc:Auto Complete`, img: 'autocomplete', disabled: false, iconName: 'format_indent_increase' },
    { name: $localize`:rightFormFieldsWorkflowCb:Check Box`, img: 'checkbox', disabled: false, iconName: 'check_box' },
    { name: $localize`:rightFormFieldsWorkflowpara:Paragraph`, img: 'paragraph', disabled: false, iconName: 'notes' },
    { name: $localize`:rightFormFieldsWorkflowtdiv:Divider`, img: 'divider', disabled: false, iconName: 'remove' },
    { name: $localize`:rightFormFieldsWorkflowHl:Hyper Link`, img: 'hyperlink', disabled: false, iconName: 'bookmark' },
    { name: $localize`:rightFormFieldsWorkflowTm:Tabbed Menu`, img: 'tabbedmenu', disabled: false, iconName: 'view_list' },
  ];
  navigateBoolean;
  controlsShow = true;
  width: any;
  screenHeight: any;

  constructor(private rightSheet: MatRightSheet, private fb: FormBuilder, private pageService: PageService,
    // tslint:disable-next-line: max-line-length
    private activeRoute: ActivatedRoute, private workspaceService: WorkspaceService,
    private snackBar: MatSnackBar, private dialog: MatDialog, private router: Router, private cd: ChangeDetectorRef) {
    this.getRouterLink();
  }

  ngOnInit() {
    this.width = Math.round((80 / 100) * window.innerWidth) + 'px';
    this.screenHeight = Math.round((81 / 100) * window.innerHeight) + 'px';
    this.page.layoutType = 'applicationPageLayout';
    this.form = this.fb.group({
      pageName: ['', Validators.required],
      pageId: [],
      description: [],
      applicationName: ['', Validators.required],
      applicationId: [],
      qualifier: ['external'],
      status: ['draft'],
      manageFlag: [this.page.manageFlag],
      layoutType: [this.page.layoutType]
    });
    // if (this.yoroflowVO) {
    //   this.isFromWorkflow = this.yoroflowVO.isFromYoroFlow;
    //   if (this.yoroflowVO.id !== null) {
    //     this.page.version = this.yoroflowVO.version;
    //     this.pageService.getPageByPageIdentifier(this.yoroflowVO.id, this.yoroflowVO.version).subscribe(data => {
    //       this.loadPage(data);
    //     });
    //   }
    // }

    this.activeRoute.paramMap.subscribe(params => {
      if (params.get('id') === 'external-table') {
        this.manageFlag = false;
        this.form.get('pageName').enable({ onlySelf: true });
        this.form.get('pageId').enable({ onlySelf: true });
        this.form.reset();
        this.page = new Page();
      } else {
        if (this.form.touched === false) {
          this.canDeactivateForm = false;
        }
        const pageId = params.get('id');
        if (pageId !== null) {
          this.pageService.getPage(pageId).subscribe(data => {
            this.loadPage(data);
          });
        }
      }

    });

    this.loadApplicationsList();
    // this.checkApplicationCount();
  }

  open() {
    this.controlsShow = true;
    this.width = Math.round((80 / 100) * window.innerWidth) + 'px';
    this.screenHeight = Math.round((81 / 100) * window.innerHeight) + 'px';
  }

  close() {
    this.controlsShow = false;
    this.width = Math.round((94 / 100) * window.innerWidth) + 'px';
    this.screenHeight = Math.round((81 / 100) * window.innerHeight) + 'px';
  }


  omit_number(event) {
    let k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k === 32 || (k >= 48 && k <= 57));
  }

  loadPage(data) {
    this.isLoadForm = true;
    if (data.version === undefined || data.version === null) {
      this.versionValue = 1;
    } else {
      this.versionValue = data.version;
    }
    this.isWorkflow = data.isWorkflowForm;
    this.page.yorosisPageId = data.yorosisPageId;
    this.form.get('pageName').disable({ onlySelf: true });
    this.form.get('pageName').setValue(data.pageName);
    this.form.get('pageId').setValue(data.pageId);
    this.form.get('pageId').disable({ onlySelf: true });
    this.form.get('description').setValue(data.description);
    this.form.get('applicationName').setValue(data.applicationName);
    this.form.get('applicationId').setValue(data.applicationId);
    this.page = data;
    this.pageIdentifier = this.page.pageId;
    this.securityOptionEnable = false;
    this.publishOptionEnable = false;
    this.manageFlag = data.manageFlag;
    this.formValueChange();
    this.loadPageData(data);
    this.loadFormControlsName(this.page.sections);
  }

  publishPage() {
    if (this.page.yorosisPageId) {
      this.pageService.publishPage(this.page.yorosisPageId).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
      });
    }
  }

  getColumnBoxProperty(column: FieldConfig, userForm) {
    if (this.isSubmitted === true) {
      if (column.field.label.labelName !== null && column.field.label.labelName !== undefined) {
        return '1px dotted #bfbfbf';
      } else {
        if (column.controlType !== 'divider') {
          return '1px dotted #e60000';
        } else {
          return '1px dotted #bfbfbf';
        }
      }
    } else {
      return '1px dotted #bfbfbf';
    }
  }

  // checkApplicationCount() {
  //   this.pageService.getApplicationCount().subscribe(data => {
  //     this.applicationCount = data.count;
  //     this.cd.markForCheck();
  //   });
  // }

  formValueChange() {
    this.form.valueChanges.subscribe(data => {
      this.canDeactivateForm = true;
      // this.isChanged.emit(true);
    });
  }

  formValueChangeWorkflow() {
    this.form.valueChanges.subscribe(data => {
      this.isChanged.emit(true);
    });
  }


  setApplicationId(event, id) {
    if (event.isUserInput === true) {
      this.form.get('applicationId').setValue(id);
    }
  }

  loadApplicationsList() {
    this.pageService.getApplicationList().subscribe(data => {
      if (this.isFromWorkflow) {
        data.forEach(app => {
          if (app.applicationName === 'Yoroflow') {
            this.workflowapplication = app;
            this.form.get('applicationName').setValue(app.applicationName);
            this.form.get('applicationId').setValue(app.id);
          }
        });
        this.formValueChangeWorkflow();
      } else {
        this.applicationsList = data;
      }
    });
  }

  loadPageData(page: Page) {
    for (let sections = 0; sections < page.sections.length; sections++) {
      this.page.sections[sections] = page.sections[sections];
      this.showDiv[sections] = true;
      this.showButtons[sections] = true;
      for (let rows = 0; rows < page.sections[sections].rows.length; rows++) {
        for (let columns = 0; columns < page.sections[sections].rows[rows].columns.length; columns++) {
          this.page.sections[sections].rows = page.sections[sections].rows;
          this.page.sections[sections].rows[rows].columns[columns] = page.sections[sections].rows[rows].columns[columns];
        }
      }
    }
    this.showSectionAddIcon = true;
    this.buttonVisible = true;
  }

  loadFormControlsName(sections: Section[]) {
    sections.forEach(mainSection => {
      mainSection.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.field.name && column.controlType !== 'button' && column.controlType !== 'divider') {
            this.formControlName.push(column.field.name);
            let fieldNameArr = new FieldName();
            fieldNameArr.label = column.field.label.labelName;
            fieldNameArr.name = column.field.name;
            this.fieldName.push(fieldNameArr);
            this.loadControlForPage = true;
          }
        });
      });
      if (mainSection.sections) {
        this.loadFormControlsName(mainSection.sections);
      }
    });
  }
  openPagePermissions() {
    let version = this.page.version;
    if (this.page.version === null) {
      version = 1;
    }
    const pagePermissionsSheet = this.rightSheet.open(YoroSecurityComponent, {
      disableClose: true,
      // tslint:disable-next-line: object-literal-key-quotes
      data: { 'id': this.page.yorosisPageId, 'securityType': 'page', 'pageName': this.page.pageName, 'pageVersion': version },
      panelClass: 'dynamic-right-sheet-container',
    });
  }




  getAccessForSubmitButton(): boolean {
    return this.getAccessForSectionSubmitButton(this.page.sections);
  }

  getAccessForSectionSubmitButton(sections: Section[]): boolean {
    let returnValue;
    sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.field.control.buttonType === 'submit') {
            this.allowSubmitbutton = true;
            returnValue = true;
            return returnValue;
          } else {
            this.allowSubmitbutton = false;

          }
        });
      });
      //  if (section.sections) {
      //    this.getAccessForSectionSubmitButton(section.sections);
      //  }
    });
    return returnValue;
  }


  showBorder(section: Section): string {
    if (section.border === false) {
      return 'none';
    }
  }
  /*highlightForColumn() {
    this.page.sections.forEach(mainSection => {
      mainSection.rows.forEach(rows => {
        rows.columns.forEach(column => {
          if (column.controlType === undefined) {
            return 'red';
          } else { return 'white'; }
        });
      });
    });
 
  }*/
  removeColumn(index: number, columns: FieldConfig[], row: number, sections: Section) {
    const totalColumns = sections.rows[row].totalColumns;
    sections.rows[row].totalColumns = totalColumns - 1;
    const sectionRow = sections.rows[row];
    this.enableSubmit = true;
    this.isChanged.emit(true);
    for (let column = 0; column < sectionRow.totalColumns; column++) {
      sectionRow.columns[column].field.fieldWidth = Math.round(sectionRow.rowWidth / sectionRow.totalColumns);
    }
    if (sections.rows[row].totalColumns === 0) {
      sections.rows.splice(row, 1);
    }
    const nameIndex = this.formControlName.indexOf(columns[index].field.name);
    this.formControlName.splice(nameIndex, 1);
    columns.splice(index, 1);

    // need to remove array for FormFields when removing column
    let removeObj = this.fieldName.map(function (item) {
      return item.label;
    }).indexOf('' + nameIndex);
    this.fieldName.splice(removeObj, 1);
  }

  getAccessForPageCreation(): boolean {
    let returnValue = false;

    if (this.page.sections.length === 0) {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Add Section to Proceed',
      });
      return false;
    } else {


      // tslint:disable-next-line: prefer-for-of
      for (let sections = 0; sections < this.page.sections.length; sections++) {

        if (this.page.sections[sections].rows.length === 0) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'Empty sections are not allowed. Either remove section or add row to proceed',
          });
          return false;
        } else {
          // tslint:disable-next-line: prefer-for-of
          for (let rows = 0; rows < this.page.sections[sections].rows.length; rows++) {
            if (this.page.sections[sections].rows[rows].totalColumns === 0) {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'Empty sections are not allowed. Either remove section or add row to proceed',
              });
              return false;
            }

            for (let column = 0; column < this.page.sections[sections].rows[rows].totalColumns; column++) {
              const columnsValue = this.page.sections[sections].rows[rows].columns[column];
              if (!columnsValue.controlType) {
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: 'Either remove column, that doesn\'t have control or add control to the columns to create page',
                });
                return false;
              }

              /*else if (columnsValue.controlType !== 'grid') {
                if ((columnsValue.field.label.labelName === undefined || columnsValue.field.label.labelName === null)) {
                  this.snackBar.openFromComponent(SnackbarComponent, {
                    data: 'Add control properties',
                  });
                  return false;
                }
              }*/
              // tslint:disable-next-line: one-line
              else {
                returnValue = true;
              }

            }
          }

        }

        if (this.page.sections[sections].sections) {
          // tslint:disable-next-line: prefer-for-of
          for (let nestedSection = 0; nestedSection < this.page.sections[sections].sections.length; nestedSection++) {
            if (this.page.sections[sections].sections[nestedSection].rows.length === 0) {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'Empty sub-sections are not allowed. Either remove section or add row to proceed',
              });
              return false;
            } else {
              // tslint:disable-next-line: prefer-for-of
              for (let rows = 0; rows < this.page.sections[sections].sections[nestedSection].rows.length; rows++) {
                for (let column = 0; column < this.page.sections[sections].sections[nestedSection].rows[rows].totalColumns; column++) {
                  const columnsValue = this.page.sections[sections].sections[nestedSection].rows[rows].columns[column];

                  if (!columnsValue.controlType) {
                    this.snackBar.openFromComponent(SnackbarComponent, {
                      data: 'Either remove column, that doesn\'t have control or add control to the columns to create page',
                    });
                    return false;
                  } /*else if (columnsValue.field.label.labelName === undefined || columnsValue.field.label.labelName === null) {
                      this.snackBar.openFromComponent(SnackbarComponent, {
                        data: 'Add control properties',
                      });
  
                      return false;
                    }*/
                  // tslint:disable-next-line: one-line
                  else {
                    returnValue = true;
                  }

                }
              }
              //  }
            }
            // Sub of Sub Sections
            if (this.page.sections[sections].sections[nestedSection].sections) {
              // tslint:disable-next-line: max-line-length
              for (let nestedSubSection = 0; nestedSubSection < this.page.sections[sections].sections[nestedSection].sections.length; nestedSubSection++) {

                if (this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows.length === 0) {
                  this.snackBar.openFromComponent(SnackbarComponent, {
                    data: 'Empty Sub of sub-sections are not allowed. Either remove section or add row to proceed',
                  });
                  return false;
                } else {
                  // tslint:disable-next-line: max-line-length
                  for (let rows = 0; rows < this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows.length; rows++) {
                    // tslint:disable-next-line: max-line-length
                    for (let column = 0; column < this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows[rows].totalColumns; column++) {
                      // tslint:disable-next-line: max-line-length
                      const columnsValue = this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows[rows].columns[column];

                      if (!columnsValue.controlType) {
                        this.snackBar.openFromComponent(SnackbarComponent, {
                          data: 'Either remove column, that doesn\'t have control or add control to the columns to create page',
                        });
                        return false;
                      } else {
                        returnValue = true;
                      }

                    }
                  }
                }
              }
            }

          }
        }

      }

    }
    // this.highlightForColumn();
    return returnValue;
  }


  createPage(userForm) {
    this.isSubmitted = false;
    if (this.getAccessForPageCreation() === false) {
      this.isSubmitted = true;
    }
    if (this.getAccessForPageCreation() === true && userForm.valid) {
      if (this.getAccessForSubmitButton() !== true && this.page.isWorkflowForm && this.page.version >= 1) {
        const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
          width: '250px',
          data: { type: 'version' }
        });
        dialogRef.afterClosed().subscribe(data => {
          if (data === true) {
            this.allowSubmitbutton = true;
            this.canDeactivateForm = false;
            this.isUpdate = false;
            this.createPageForm(userForm);
          } else if (data === 'update') {
            this.allowSubmitbutton = true;
            this.canDeactivateForm = false;
            this.isUpdate = true;
            this.createPageForm(userForm);
          }
        });
      } else {
        if (this.page.yorosisPageId === null || this.page.yorosisPageId === undefined) {
          this.page.pageName = this.form.get('pageName').value;
          this.page.pageId = this.form.get('pageId').value;
          this.page.applicationId = this.form.get('applicationId').value;
          this.page.applicationName = this.form.get('applicationName').value;
          if (this.page.isWorkflowForm === undefined || this.page.isWorkflowForm === null) {
            this.page.isWorkflowForm = false;
          }


          this.pageService.checkPageName(this.page.pageName).subscribe(data => {
            if (data.response.includes('already exist')) {
              this.showSectionAddIcon = false;
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: data.response,
              });
              this.buttonVisible = false;
              this.canDeactivateForm = false;
            } else {
              if (this.isFromWorkflow === true) {
                this.page.isWorkflowForm = this.isFromWorkflow;
              }
              if (this.page.isWorkflowForm === true && this.page.version >= 1) {
                this.page.version = this.page.version;
              } else {
                this.page.version = 0;
              }

              this.pageService.savePage(this.page).subscribe(dataResponse => {
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: dataResponse.response,
                });
                if (this.isFromWorkflow === true) {
                  this.emitPageId.emit(dataResponse);
                }
                userForm.resetForm();
                this.page = new Page();
                this.showSectionAddIcon = false;
                this.buttonVisible = false;
                this.canDeactivateForm = false;
              });
            }
          });
        } else {
          this.page.description = this.form.get('description').value;
          this.page.applicationId = this.form.get('applicationId').value;
          this.page.applicationName = this.form.get('applicationName').value;
          if (this.page.isWorkflowForm === undefined || this.page.isWorkflowForm === null) {
            this.page.isWorkflowForm = false;
          }
          if (this.isFromWorkflow === true) {
            this.page.isWorkflowForm = this.isFromWorkflow;
          }

          this.pageService.updatePage(this.page, this.page.yorosisPageId).subscribe(updateResponse => {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: updateResponse.response,
            });
            if (this.isFromWorkflow === true) {
              this.emitPageId.emit(updateResponse);
            }
            if (!this.isFromWorkflow) {
              this.canDeactivateForm = false;
              this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/app-layout-page-list']);
            }
          });
        }
      }
      this.formControlName = [];
      this.fieldName = [];
    }



  }

  createPageForm(userForm) {
    if (userForm.valid) {
      this.canDeactivateForm = false;
      //if (this.page.yorosisPageId === null || this.page.yorosisPageId === undefined) {
      if (this.page.yorosisPageId && this.isUpdate === false || (this.page.yorosisPageId === null || this.page.yorosisPageId === undefined)) {
        this.page.pageName = this.form.get('pageName').value;
        this.page.pageId = this.form.get('pageId').value;
        this.page.description = this.form.get('description').value;
        this.page.applicationId = this.form.get('applicationId').value;
        this.page.applicationName = this.form.get('applicationName').value;
        if (this.page.isWorkflowForm === undefined || this.page.isWorkflowForm === null) {
          this.page.isWorkflowForm = false;
        }


        this.pageService.checkPageName(this.page.pageName).subscribe(data => {
          if (this.page.version === 0) {
            if (data.response.includes('already exist')) {
              this.showSectionAddIcon = false;
              this.canDeactivateForm = false;
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: data.response,
              });
            }
          } else {
            if (this.isFromWorkflow === true) {
              this.page.isWorkflowForm = this.isFromWorkflow;
            }
            if (this.page.isWorkflowForm === true && this.page.version >= 1) {
              this.page.version = this.page.version;
            } else {
              this.page.version = 0;
            }

            this.pageService.savePage(this.page).subscribe(dataResponse => {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: dataResponse.response,
              });

              userForm.resetForm();
              if (this.isFromWorkflow === true) {
                this.emitPageId.emit(dataResponse);
              }
              if (!this.isFromWorkflow) {
                this.canDeactivateForm = false;
                this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/app-layout-page-list']);
              }
              this.isSubmitted = false;
              this.canDeactivateForm = false;
              this.page = new Page();
              this.buttonVisible = false;
            });
          }
        });
      } else if (this.isUpdate === true && this.page.yorosisPageId) {
        this.page.description = this.form.get('description').value;
        this.page.applicationId = this.form.get('applicationId').value;
        this.page.applicationName = this.form.get('applicationName').value;
        if (this.page.isWorkflowForm === undefined || this.page.isWorkflowForm === null) {
          this.page.isWorkflowForm = false;
        }
        if (this.isFromWorkflow === true) {
          this.page.isWorkflowForm = this.isFromWorkflow;
        }

        this.pageService.updatePage(this.page, this.page.yorosisPageId).subscribe(updateResponse => {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: updateResponse.response,
          });
          if (this.isFromWorkflow === true) {
            this.emitPageId.emit(updateResponse);
          }
          if (!this.isFromWorkflow) {
            this.canDeactivateForm = false;
            this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/app-layout-page-list']);
          }
        });
      }
    } else {
      this.canDeactivateForm = true;
    }
  }

  addSection() {
    if (this.page.yorosisPageId === null || this.page.yorosisPageId === undefined) {
      this.page.sections.push(new Section());
      const sectionIndex = this.page.sections.length - 1;
      this.showDiv[sectionIndex] = true;
      this.showButtons[sectionIndex] = true;
      this.sectionDetails(sectionIndex, 0);
    } else {
      const sectionIndex = this.page.sections.length;
      this.showDiv[sectionIndex] = true;
      this.showButtons[sectionIndex] = true;
      this.sectionDetails(sectionIndex, 1);
    }
    this.buttonVisible = true;

  }

  removeRowFormSection(index: number, rows: Row[]) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: { type: 'remove-row' }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        this.enableSubmit = true;
        this.isChanged.emit(true);
        rows.splice(index, 1);
      }
    });
    for (let columns = 0; columns < rows[index].totalColumns; columns++) {
      const nameIndex = this.formControlName.indexOf(rows[index].columns[columns].field.name);

      this.formControlName.splice(nameIndex, 1);
      let removeObj = this.fieldName.map(function (item) {
        return item.label;
      }).indexOf('' + nameIndex);
      this.fieldName.splice(removeObj, 1);
    }

  }


  sectionDetails(section: number, edit: number) {
    this.canDeactivateForm = true;
    if (edit === 0) {
      this.page = this.form.value;
    }
    if (section === 0) {
      this.page.sections = [];
    }
    const sectionObj = new Section();
    this.page.manageFlag = this.manageFlag;
    const bottomSheetRef = this.rightSheet.open(SectionComponent, {
      disableClose: true,
      data: [sectionObj, this.page],
      panelClass: 'bottom-sheet-container'
    });
    bottomSheetRef.instance.onAdd.subscribe((data) => {
      if (data === 'cancel' && edit === 0) {
        this.page.sections.pop();
      } else {
        this.enableSubmit = true;
        this.isChanged.emit(true);
        this.page.sections[section] = data;
        this.page.sections[section].rows = [];
      }
    });
    this.showSectionAddIcon = true;
  }

  rowAddAbove(section: Section, j) {
    section.rows.splice(j + 1, 0, new Row());
    const index = j;
    let row = section.rows[index + 1];
    row.row = index + 2;
    let background;
    let style;
    const bottomSheetRef = this.rightSheet.open(ColumnComponent, {
      disableClose: true,
      data: [row, section],
      panelClass: 'bottom-sheet-container'
    });
    bottomSheetRef.instance.onAdd.subscribe((data) => {
      if (data !== 'cancel') {
        this.enableSubmit = true;
        this.isChanged.emit(true);
        let noOfColumns;
        noOfColumns = data.totalColumns;
        row = data;
        row.columns = [];
        for (let k = 0; k < noOfColumns; k++) {
          const fieldConfig = new FieldConfig();
          fieldConfig.field.fieldWidth = Math.round(row.rowWidth / data.totalColumns);
          fieldConfig.field.rowBackground = '#ffffff';
          row.columns.push(fieldConfig);
          background = row.rowBackground;
          style = row.style;
        }

        this.fieldWidth = [];
        row.rowBackground = background;
        row.style = style;
        section.rows[index + 1] = row;
      } else {
        section.rows.splice(j + 1, 1);
      }

    });

  }

  rowAdd(section: Section, j) {
    this.canDeactivateForm = true;
    let row;
    if (j === 0) {
      section.rows.unshift(new Row());
      row = section.rows[0];
      row.row = 1;
    } else {
      section.rows.push(new Row());
      row = section.rows[section.rows.length - 1];
      row.row = section.rows.length;
    }
    this.createRow(section, row, j);
  }


  createRow(section: Section, row: Row, j) {
    const bottomSheetRef = this.rightSheet.open(ColumnComponent, {
      disableClose: true,
      data: [row, section],
      panelClass: 'bottom-sheet-container'
    });
    bottomSheetRef.instance.onAdd.subscribe((data) => {
      if (data !== 'cancel') {
        this.enableSubmit = true;
        this.isChanged.emit(true);
        let noOfColumns;
        let background;
        let style;
        noOfColumns = data.totalColumns;
        row = data;
        row.columns = [];
        for (let k = 0; k < noOfColumns; k++) {
          const fieldConfig = new FieldConfig();
          fieldConfig.field.fieldWidth = Math.round(row.rowWidth / data.totalColumns);
          fieldConfig.field.rowBackground = '#ffffff';
          row.columns.push(fieldConfig);
          background = row.rowBackground;
          style = row.style;
        }

        this.fieldWidth = [];
        if (j === 0) {
          row.rowBackground = background;
          row.style = style;
          section.rows[0] = row;
        } else {
          row.rowBackground = background;
          row.style = style;
          section.rows[section.rows.length - 1] = row;
        }
      } else {
        if (j !== 0) {
          section.rows.pop();
        } else {
          section.rows.splice(j, 1);
        }

      }

    });
  }

  dropped(event: CdkDragDrop<string[]>, row: number, column: number, sections: Section, columns: FieldConfig, mainSection: boolean) {
    this.canDeactivateForm = true;
    if (columns.controlType === 'page') {
      this.loadControlForPage = false;
    } else {
      this.loadControlForPage = true;
    }
    if (!columns.controlType) {
      this.createField(event, row, column, sections, columns, mainSection);
    } else {
      const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '250px',
        data: { type: 'field-dropped', name: columns.field.label.labelName }
      });

      dialogRef.afterClosed().subscribe(data => {
        if (data === true) {
          this.removeFieldWhenControlChange(columns.field.name);
          const newField = new FieldConfig();
          newField.field.rowBackground = '#ffffff';
          this.createField(event, row, column, sections, newField, mainSection);
        }
      });
    }
  }

  removeFieldWhenControlChange(fieldName) {
    let removeIndex = this.formControlName.findIndex(x => x === fieldName);
    if (removeIndex !== -1) {
      this.formControlName.splice(removeIndex, 1);
    }
    let removeFieldIndex = this.fieldName.findIndex(x => x.name === fieldName);
    if (removeFieldIndex !== -1) {
      this.fieldName.splice(removeFieldIndex, 1);
    }
  }

  createField(event: CdkDragDrop<string[]>, row: number, column: number, sections: Section, columns: FieldConfig, mainSection: boolean) {
    this.canDeactivateForm = true;
    this.enableSubmit = true;
    const field = event.previousContainer.data[event.previousIndex] as any;
    columns.controlType = field.img;
    sections.rows[row].columns[column] = columns;
    if (field.img !== 'divider') {
      this.createFormField(field, row, column, sections, mainSection);
    } else {
      columns.field.control = 'divider';
      columns.controlType = field.img;
    }
  }


  createFormField(fieldName: any, row: number, column: number, sections: Section, mainSection: boolean) {
    this.canDeactivateForm = true;
    const rowWidth = sections.rows[row].rowWidth;
    const totalColumns = sections.rows[row].totalColumns;
    const columns = sections.rows[row].columns[column];
    const updateFieldName = columns.field.name;
    if (columns.controlType !== 'divider') {
      if (columns.controlType !== undefined) {
        // fieldWidth Calculation for each Column
        if (fieldName.controlType !== null && fieldName.controlType !== '') {
          if (columns.field.fieldWidth === 0) {
            let tempFieldWidth = 0;

            if (this.fieldWidth.length > 0) {
              for (let i = 0; i < this.fieldWidth.length; i++) {
                if (this.fieldWidth[i] !== undefined) {
                  tempFieldWidth += this.fieldWidth[i];
                  columns.field.fieldWidth = Math.round((rowWidth - tempFieldWidth) / (totalColumns - column));
                }
              }
            } else {
              columns.field.fieldWidth = Math.round(rowWidth / totalColumns);
            }
          }
          if (fieldName.img === 'page') {
            const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
              width: '470px',
              data: 'app-layout'
            });
            dialogRef.afterClosed().subscribe(data => {
              if (data === true) {
                const dialog = this.dialog.open(CreatePageComponent, {
                  disableClose: true,
                  height: '97%',
                  width: '100vw',
                  maxWidth: '90vw',
                  maxHeight: '100vh',
                  panelClass: 'full-screen-modal',
                  data: true,
                });
                dialog.afterClosed().subscribe(createPageData => {
                  if (createPageData === false) {
                    sections.rows[row].columns[column].controlType = '';
                    this.fieldWidth[column] = '';
                    this.formControlName.push(null);
                  } else if (createPageData !== null && createPageData.responseId && createPageData.version) {
                    sections.rows[row].columns[column].field.control = {
                      pageId: createPageData.responseId,
                      pageName: createPageData.pageName,
                      version: createPageData.version
                    };
                    this.loadControlForPage = true;
                    // this.openControl(columns, row, column, sections, mainSection);
                  }
                });
              } else if (data === 'selecte existing form') {
                const bottomSheetRef = this.rightSheet.open(FormfieldComponent, {
                  disableClose: true,
                  data: [columns, this.formControlName, mainSection,
                    this.page.pageId, this.page.manageFlag, this.fieldName, this.page.version, this.page.layoutType],
                  panelClass: 'bottom-sheet-container'
                });
                bottomSheetRef.instance.onAdd.subscribe((data) => {
                  if (data === false) {
                    sections.rows[row].columns[column].controlType = '';
                    this.fieldWidth[column] = '';
                    this.formControlName.push(null);
                    // this.fieldName.push(null);
                  } else {
                    this.enableSubmit = true;
                    this.isChanged.emit(true);
                    sections.rows[row].columns[column] = data;
                    this.fieldWidth[column] = data.field.fieldWidth;
                    this.getFormControlList(updateFieldName, data.field.name);
                    if (data.field.name !== '' && data.field.name !== null) {
                      let fieldNameArr = new FieldName();
                      fieldNameArr.label = data.field.label.labelName;
                      fieldNameArr.name = data.field.name;
                      if (!this.fieldName.some(fieldNames => fieldNames.name === data.field.name)) {
                        if (updateFieldName !== undefined && data.field.name !== updateFieldName) {
                          let removeIndex = this.fieldName.findIndex(x => x.name === updateFieldName);
                          if (removeIndex !== -1) {
                            this.fieldName.splice(removeIndex, 1, fieldNameArr);
                          }
                        } else {
                          this.fieldName.push(fieldNameArr);
                        }
                      }
                    }
                    this.loadControlForPage = true;
                  }
                });
              } else if (data === false) {
                sections.rows[row].columns[column].controlType = '';
                this.fieldWidth[column] = '';
                this.formControlName.push(null);
                // this.fieldName.push(null);
              }
            });
          } else {
            this.openControl(columns, row, column, sections, mainSection);
          }
        }
      }
    }
  }

  openControl(columns: any, row: number, column: number, sections: Section, mainSection: boolean) {
    const updateFieldName = columns.field.name;
    const bottomSheetRef = this.rightSheet.open(FormfieldComponent, {
      disableClose: true,
      data: [columns, this.formControlName, mainSection, this.page.pageId,
        this.page.manageFlag, this.fieldName, this.page.version, this.page.layoutType],
      panelClass: 'bottom-sheet-container'
    });
    bottomSheetRef.instance.onAdd.subscribe((data) => {
      if (data === false) {
        sections.rows[row].columns[column].controlType = '';
        this.fieldWidth[column] = '';
        this.formControlName.push(null);
        // this.fieldName.push(null);
      } else {
        this.enableSubmit = true;
        this.isChanged.emit(true);
        sections.rows[row].columns[column] = data;
        this.fieldWidth[column] = data.field.fieldWidth;
        this.getFormControlList(updateFieldName, data.field.name);
        if (data.field.name !== '' && data.field.name !== null) {
          let fieldNameArr = new FieldName();
          fieldNameArr.label = data.field.label.labelName;
          fieldNameArr.name = data.field.name;
          if (!this.fieldName.some(fieldNames => fieldNames.name === data.field.name)) {
            if (updateFieldName !== undefined && data.field.name !== updateFieldName) {
              let removeIndex = this.fieldName.findIndex(x => x.name === updateFieldName);
              if (removeIndex !== -1) {
                this.fieldName.splice(removeIndex, 1, fieldNameArr);
              }
            } else {
              this.fieldName.push(fieldNameArr);
            }
          }
        }
      }
    });
  }

  getFormControlList(oldName, NewName) {
    if (NewName !== '' && NewName !== null &&
      !this.formControlName.some(fieldNames => fieldNames === NewName)) {
      if (oldName !== undefined && NewName !== oldName) {
        let removeIndex = this.formControlName.findIndex(x => x === oldName);
        if (removeIndex !== -1) {
          this.formControlName.splice(removeIndex, 1, NewName);
        }
      } else {
        this.formControlName.push(NewName);
      }
    }
  }

  rowUpdate(section: Section, row: Row, rowNumber: number) {
    let background: any;
    this.canDeactivateForm = true;
    row.row = rowNumber + 1;
    section.rows.forEach(rowColor => {
      if (rowColor.row === row.row) {
        background = row.rowBackground;
      }
    });
    if (background) {
      row.rowBackground = background;
    } else {
      row.rowBackground = '#ffffff';
    }
    const prevoiusColumn = row.totalColumns;
    const bottomSheetRef = this.rightSheet.open(ColumnComponent, {
      disableClose: true,
      panelClass: 'bottom-sheet-container',
      data: [row, section]
    });

    bottomSheetRef.instance.onAdd.subscribe((data) => {
      // data.row - index
      // section.rows[data.row] = data;
      if (data !== 'cancel') {
        this.enableSubmit = true;
        this.isChanged.emit(true);
        section.rows[data.row].rowWidth = data.rowWidth;
        section.rows[data.row].totalColumns = data.totalColumns;
        section.rows[data.row].layoutDirection = data.layoutDirection;
        section.rows[data.row].layoutResponsiveDirection = data.layoutResponsiveDirection;
        section.rows[data.row].layoutGap = data.layoutGap;
        section.rows[data.row].alignment = data.alignment;
        section.rows[data.row].rowBackground = data.rowBackground;
        section.rows[data.row].style = data.style;

        const updatedColumn = data.totalColumns;

        if (prevoiusColumn < updatedColumn) {

          for (let i = 0; i < updatedColumn - prevoiusColumn; i++) {
            const fieldConfig = new FieldConfig();
            fieldConfig.field.fieldWidth = 0;
            section.rows[data.row].columns.push(fieldConfig);
          }
        } else {
          const remainingColumn = prevoiusColumn - updatedColumn;
          for (let i = 0; i < remainingColumn; i++) {
            section.rows[data.row].columns.pop();
          }
        }
        for (let column = 0; column < section.rows[data.row].totalColumns; column++) {
          // tslint:disable-next-line: max-line-length
          section.rows[data.row].columns[column].field.fieldWidth = Math.round(section.rows[data.row].rowWidth / section.rows[data.row].totalColumns);
        }


      }
    });
  }

  sectionUpdate(section: Section, sectionIndex: number) {
    this.canDeactivateForm = true;
    const bottomSheetRef = this.rightSheet.open(SectionComponent, {
      disableClose: false,
      panelClass: 'bottom-sheet-container',
      data: [section, this.page, this.fieldName]
    });
    bottomSheetRef.instance.onAdd.subscribe((data) => {
      if (data !== 'cancel') {
        this.enableSubmit = true;
        this.isChanged.emit(true);
        this.page.sections[sectionIndex].name = data.name;
        this.page.sections[sectionIndex].border = data.border;
        this.page.sections[sectionIndex].collapsible = data.collapsible;
        this.page.sections[sectionIndex].width = data.width;
        this.page.sections[sectionIndex].border = data.border;
        this.page.sections[sectionIndex].style = data.style;
        if (data.groupValidation) {
          this.page.sections[sectionIndex].groupValidation = data.groupValidation;
        }
      }
    });
  }

  removeSection(index: number, section: Section[]) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: 'remove-section'
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        this.canDeactivateForm = true;
        this.enableSubmit = true;
        this.isChanged.emit(true);
        section.splice(index, 1);
      }
    });
  }

  resetPage(userForm) {
    if (this.page.yorosisPageId === null || this.page.yorosisPageId === undefined) {
      const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '250px',
        data: 'reset-page'
      });
      this.isSubmitted = false;
      dialogRef.afterClosed().subscribe(data => {
        if (data === true) {
          this.page.sections = [];
          this.showSectionAddIcon = false;
          this.ngOnInit();
          userForm.resetForm();
          this.buttonVisible = false;
          this.canDeactivateForm = false;
          this.publishOptionEnable = true;
          this.securityOptionEnable = true;
        }
      });
    } else {
      this.isSubmitted = false;
      this.ngOnInit();
      userForm.resetForm();
      this.buttonVisible = true;
      this.canDeactivateForm = false;
    }
  }



  nestedSectionAdd(section: Section, nestedSection: boolean) {
    // nestedSection -> get parent table, Sub Section - PageId as Parent Table
    // NestedSubSection -> section's tableName as ParentTable
    this.canDeactivateForm = true;
    if (section.sections === undefined || section.sections === null) {
      section.sections = [];
      section.sections.push(new Section());
    } else {
      section.sections.push(new Section());
    }
    const sectionObj = new Section();
    const bottomSheetRef = this.rightSheet.open(NestedSectionComponent, {
      disableClose: true,
      panelClass: 'bottom-sheet-container',
      // tslint:disable-next-line: object-literal-shorthand
      data: { sectionObj: sectionObj, pageDetails: section, page: this.page, nestedSection }
    });
    bottomSheetRef.instance.onAdd.subscribe((data) => {
      if (data === 'cancel') {
        section.sections.pop();
      } else {
        const sectionsLength = section.sections.length - 1;
        section.sections[sectionsLength] = data;
        section.sections[sectionsLength].rows = [];
        // section.sections[sectionsLength].rows.push(new Row());
      }
    });
  }
  nestedSectionUpdate(section: Section, parentSection: Section, nestedSection: boolean) {
    this.canDeactivateForm = true;
    let sectionDetails;
    const sectionObject = section;
    if (parentSection === null) { sectionDetails = section; } else { sectionDetails = parentSection; }

    const bottomSheetRef = this.rightSheet.open(NestedSectionComponent, {
      disableClose: true,
      panelClass: 'bottom-sheet-container',
      data: { sectionObj: sectionObject, pageDetails: sectionDetails, page: this.page, nestedSection }
    });
    bottomSheetRef.instance.onAdd.subscribe((data) => {
      if (data !== 'cancel') {
        section = data;
      }

    });
  }

  focusOutForFormElement($event) {
    const pageName = this.form.get('pageName').value;
    this.form.get('pageId').setValue((pageName).trim().toLowerCase().replace(/ +/g, ''));
    if (pageName !== '') {
      this.pageService.checkPageName(pageName).subscribe(data => {
        if (data.response.includes('already exist')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.showSectionAddIcon = false;
          this.canDeactivateForm = true;
          this.buttonVisible = false;
        } else {
          this.showSectionAddIcon = true;
          this.canDeactivateForm = true;
          this.buttonVisible = true;
        }
      });
    }
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



