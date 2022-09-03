import { Component, OnInit, ViewChild, ChangeDetectorRef, Output, EventEmitter, Input, ElementRef, HostListener, NgZone } from '@angular/core';
import { MatRightSheet } from 'mat-right-sheet';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ColumnComponent } from '../column/column.component';
import { FormfieldComponent } from '../formfield/formfield.component';
import { PageSettingsComponent } from '../page-settings/page-settings.component';
import { Row, Page, FieldConfig, Section, Field, Grid, FieldName, TabbedMenu, Security, LabelType, Column } from '../shared/vo/page-vo';
import { SectionComponent } from '../section/section.component';
import { PageService } from './page-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { NestedSectionComponent } from '../nested-section/nested-section.component';
import { ActivatedRoute, Router, RouterEvent } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogBoxComponentComponent } from '../confirmation-dialog-box-component/confirmation-dialog-box-component.component';
import { RowDetailsComponent } from '../row-details/row-details.component';
import { Observable } from 'rxjs';
import { PageGridConfigurationComponent } from '../page-grid-configuration/page-grid-configuration.component';
import { Application } from '../shared/vo/appication-vo';
import { YoroSecurityComponent } from '../yoro-security/yoro-security.component';
import { MenuConfigurationComponent } from '../menu-configuration/menu-configuration.component';
import { SectionSecurityComponent } from '../section-security/section-security.component';
import decode from 'jwt-decode';
import { JwtHelperService } from '@auth0/angular-jwt';
import 'rxjs/add/observable/interval';
import { PrintConfigurationComponent } from '../print-configuration/print-configuration.component';
import { interval } from 'rxjs/internal/observable/interval';
import { TableListVO } from '../table-objects/table-object-vo';
import { ImportDialogComponent } from '../import-dialog/import-dialog.component';
import { GridConfigurationService } from '../grid-configuration/grid-configuration.service';
import { SecurityService } from '../yoro-security/security.service';
import { Permission } from '../yoro-security/security-vo';
import { ShoppingCardStepNameComponent } from '../shopping-card-step-name/shopping-card-step-name.component';
import { ResizeEvent } from 'angular-resizable-element';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MatMenuTrigger } from '@angular/material/menu';
import { LicenseVO } from 'src/app/shared-module/vo/license-vo';
import { AlertmessageComponent } from 'src/app/shared-module/alert-message/alert-message.component';
import { ThemeService } from 'src/app/services/theme.service';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
//import { ComponentCanDeactivate } from '../../services/core/authentication/component-can-deactivate';
@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})

export class PageComponent implements OnInit {
  // canDeactivate(): boolean {
  //   if (
  //     !this.canDeactivateForm

  //   )
  //     return true;
  //   else {
  //     return confirm(
  //       "You have unsaved changes! If you leave, your changes will be lost."
  //     );

  //   }
  // }
  @Input() yoroflowVO: any;
  @Input() isApplicationLayout: any;
  @Output() emitPageId: EventEmitter<any> = new EventEmitter<any>();
  @Output() isChanged: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('myIdentifier')
  myIdentifier: ElementRef;

  contextMenuPosition = { x: '0px', y: '0px' };

  data: any[] = [];
  newSectionData: any[] = [];

  @Input() workflowForm: any;

  @ViewChild('rowDetailsRef', { static: true })
  rowDetailsRef: RowDetailsComponent;
  page = new Page();
  showDiv: boolean[] = [];
  form: FormGroup;
  row = new Row();
  fieldWidth = [];
  formControlName: string[] = [];
  formControlNameForNestedSections: string[] = [];

  formControlNamePasswordField: FieldName[] = [];
  dateFieldName: FieldName[] = [];
  fieldName: FieldName[] = [];
  numberField: FieldName[] = [];
  bColorEnable = false;
  showSectionAddIcon = false;
  buttonVisible = false;
  allowSubmitbutton = false;
  sectionBoolean = false;
  securityOptionEnable = true;
  publishOptionEnable: any;
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
  isFromApplicationLayout = false;
  importFileToken: any;
  tokenArray: any[] = [];
  managedPage = false;
  appId: any;
  appPrefix: any;
  hasWorkflowPageId = false;
  workflowName: any;
  workflowKey: any;
  published = false;
  fieldConfig: any;
  field = new Field();
  label = new LabelType();
  section: any;
  isButon = false;
  showButtons: boolean[] = [];
  printConfigurEnable = false;
  repeatableSecetionNames: any[] = [];
  repeatableFieldNames: any[] = [];
  tableList: any[] = [];
  tableListVO = new TableListVO();
  importType: string;
  importAs: string;
  pagePermissionsVOList: Permission[];
  content: any;
  connectedTo: string[] = [];
  connectedToList = [];
  layoutType: string;

  leftFormFields = [

    { name: $localize`:leftFormFieldsInField:Input Field`, img: 'input', disabled: false, iconName: 'text_fields' },
    { name: $localize`:leftFormFieldsGlist:Grid List`, img: 'grid', disabled: false, iconName: 'list' },
    { name: $localize`:leftFormFieldsfile:File Upload`, img: 'fileupload', disabled: false, iconName: 'file_copy' },
    { name: $localize`:leftFormFieldshidden:Hidden Control`, img: 'hiddencontrol', iconName: 'lock' },
    // { name: $localize`:leftFormFieldsextract:Extract as Pdf`, img: 'extractaspdf', disabled: false, iconName: 'picture_as_pdf' },
    { name: $localize`:leftFormFieldsimg:Image`, img: 'image', disabled: false, iconName: 'perm_media' },
    { name: $localize`:leftFormFieldscard:Card`, img: 'card', disabled: false, iconName: 'line_style' },
    // { name: $localize`:leftFormFieldsshpnCrt:Shopping Cart`, img: 'shoppingcart', disabled: false, iconName: 'shopping_cart' },


  ];
  rightFormFields = [

    { name: $localize`:rightFormFieldsbtn:Button`, img: 'button', disabled: false, iconName: 'save_alt' },
    { name: $localize`:rightFormFieldsdiv:Divider`, img: 'divider', disabled: false, iconName: 'remove' },
    { name: $localize`:rightFormFieldshl:Hyper Link`, img: 'hyperlink', disabled: false, iconName: 'bookmark' },
    { name: $localize`:rightFormFieldstable:Table`, img: 'table', iconName: 'table_chart' },
    { name: $localize`:rightFormFieldstm:Tabbed Menu`, img: 'tabbedmenu', disabled: false, iconName: 'view_list' },
    { name: $localize`:rightFormFieldssigCntrl:Signature Control`, img: 'signaturecontrol', disabled: false, iconName: 'vpn_key' },
    { name: $localize`:rightFormFieldsimgGrid:Image Grid`, img: 'imagegrid', disabled: false, iconName: 'developer_board' },

  ];
  rightFormFieldsWorkflow = [

    { name: $localize`:rightFormFieldsWorkflowdiv:Divider`, img: 'divider', disabled: false, iconName: 'remove' },
    { name: $localize`:rightFormFieldsWorkflowhl:Hyper Link`, img: 'hyperlink', disabled: false, iconName: 'bookmark' },
    { name: $localize`:rightFormFieldsWorkflowbtn:Button`, img: 'button', disabled: false, iconName: 'save_alt' },
    { name: $localize`:rightFormFieldsWorkflowtable:Table`, img: 'table', iconName: 'table_chart' },
    { name: $localize`:rightFormFieldsWorkflowsigCntrl:Signature Control`, img: 'signaturecontrol', disabled: false, iconName: 'vpn_key' },
    { name: $localize`:rightFormFieldsWorkflowimgGrid:Image Grid`, img: 'imagegrid', disabled: false, iconName: 'developer_board' },
  ];

  fieldTypeList1 = [{ value: 'input', name: $localize`:fieldTypeList1txt:Text`, icon: '' },
  { value: 'tel', name: $localize`:fieldTypeList1tel:Telephone`, icon: '' },
  { value: 'textarea', name: $localize`:fieldTypeList1txtarea:Textarea`, icon: '' },
  { value: 'paragraph', name: $localize`:fieldTypeList1para:Paragraph`, icon: '' },
  { value: 'label', name: $localize`:fieldTypeList1label:Label`, icon: '' }];

  fieldTypeList2 = [
    { value: 'select', name: $localize`:fieldTypeList2sel:Select`, icon: '' },
    { value: 'multi', name: $localize`:fieldTypeList2mulsel:Multi Select`, icon: '' },
    { value: 'radiobutton', name: $localize`:fieldTypeList2radBtn:Radio Button`, icon: '' },
    { value: 'checkbox', name: $localize`:fieldTypeList2cb:Check Box`, icon: '' },
    { value: 'chip', name: $localize`:fieldTypeList2chip:Chip`, icon: '' },
  ];

  fieldTypeList3 = [
    { value: 'date', name: $localize`:fieldTypeList3date:Date`, icon: '' },
    { value: 'email', name: $localize`:fieldTypeList3mail:Mail`, icon: '' },
    { value: 'password', name: $localize`:fieldTypeList3pwd:Password`, icon: '' },
  ];

  navigateBoolean;
  width: any;
  controlsCardWidth: any;
  screenHeight: any;
  sub: any;
  importedPage = false;

  height: any;
  selectedRow: any;
  selectedColumn: any;
  selectedSection: any;
  fieldSettings: boolean = false;
  sectionSettings: boolean = false;
  pagesettings: boolean = false;
  controlsShow: boolean = true;
  nestedSectionSettings: boolean = false;
  isNestedSection: boolean = false;
  selectedNestedSection: any;
  rowSettings: boolean = false;
  openSidenav: boolean = true;
  public style: object = {};
  column = new FieldConfig();
  formBuilderHeight: any;
  userPermissionData: any;
  userPermission: boolean = false;
  sectionSecurity: boolean = false;
  formBuilder: boolean = true;
  pageSecurityVO = new Security();
  publish: boolean = false;
  submitEnable: boolean = false;
  selectedNestedSectionindex: any;
  newNestedSectionData: any;
  nestedSection: any;
  rowData: any;
  // enableSave: boolean = false;
  open: boolean = true;
  dragRowIndex: any;
  dragSectionIndex: any;
  dragIndexNested: any;
  dragIndexNestedSection: any;
  @ViewChild('menuTrigger4') versionMenu;
  @ViewChild('menuTrigger5') contextMenu;
  rowWidth: any;

  pageVersionList: any[] = [];


  licenseVO = new LicenseVO();
  isSignatureAllowed = true;
  dragColumnIndex: any;
  dragRow: any;
  constructor(private rightSheet: MatRightSheet, private fb: FormBuilder, private pageService: PageService,
    private activeRoute: ActivatedRoute,
    private snackBar: MatSnackBar, private dialog: MatDialog, private workspaceService: WorkspaceService,
    private router: Router, private cd: ChangeDetectorRef, private jwtHelper: JwtHelperService
    , private service: GridConfigurationService, private pageSecurityService: SecurityService, private ngZone: NgZone, public themeService: ThemeService) {

    this.getRouterLink();
  }
  @Output() columndata: EventEmitter<any> = new EventEmitter<any>();
  @Output() public sectionData = new EventEmitter<any>();
  @Output() public nestedSectionData = new EventEmitter<any>();
  @Output() public newRowData = new EventEmitter<any>();
  public config: PerfectScrollbarConfigInterface = {};

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.loadDynamicLayout();
  }

  ngOnInit() {
    this.loadDynamicLayout();
    this.themeService.layoutEmitter.subscribe(data => {
      this.loadDynamicLayout();
    });
    this.page.layoutType = 'managedPage';
    this.publishOptionEnable = 'published';
    this.form = this.fb.group({
      pageName: ['', Validators.required],
      pageId: [],
      description: [],
      applicationName: ['', Validators.required],
      applicationId: [],
      qualifier: ['external'],
      status: ['draft'],
      manageFlag: [this.page.manageFlag],
      layoutType: [this.page.layoutType],
      exporttoPdf: [],
      searchControls: [],
      fieldType: [],
    });

    if (this.yoroflowVO) {
      this.workflowName = this.yoroflowVO.workflowName;
      this.workflowKey = this.yoroflowVO.key;
      this.isFromWorkflow = this.yoroflowVO.isFromYoroFlow;
      if (this.yoroflowVO.publicForm || this.yoroflowVO.isPublicform || (this.page && this.page.layoutType === 'publicForm')) {
        this.page.layoutType = 'publicForm';
        this.layoutType = 'publicForm';
      } else {
        this.page.layoutType = 'workflowForms';
        this.layoutType = 'workflowForms';
      }
      this.form.get('layoutType').setValue(this.page.layoutType);

      if (this.yoroflowVO.id !== null) {
        this.hasWorkflowPageId = true;
        this.page.version = this.yoroflowVO.version;
        this.pageService.getPageByPageIdentifier(this.yoroflowVO.id, this.yoroflowVO.version).subscribe(data => {
          this.loadPage(data);
        });
        let type = 'false';
        if (this.page.layoutType === 'publicForm') {
          type = 'true';
        }
        this.pageService.getPageVersion(this.yoroflowVO.id, type).subscribe(data => {
          if (data) {
            this.pageVersionList = data;
          }
        });
      }
    } else {
      this.workflowName = false;
      this.workflowKey = false;
    }

    if (this.isApplicationLayout === true) {
      this.isFromApplicationLayout = this.isApplicationLayout;
    }

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
            let type = 'false';
            if (data.layoutType === 'publicForm') {
              type = 'true';
            }
            this.pageService.getPageVersion(data.pageId, type).subscribe(version => {
              if (version) {
                this.pageVersionList = version;
              }
            });
            this.form.get('layoutType').setValue(data.layoutType);
            this.loadPage(data);
          });
        }
      }

    });

    if (this.workflowForm && this.page.layoutType !== 'publicForm') {
      this.isFromWorkflow = true;
      this.isWorkflow = true;
      this.form.get('layoutType').setValue('workflowForms');
    }

    if (window.location.href.includes('create') || window.location.href.includes('app-layout')) {
      this.managedPage = true;
    } else {
      this.managedPage = false;
    }
    this.setRowDropElementWidth();
    this.loadApplicationsList();
    this.formValueChanges();
    this.checkSignatureLicense();
    // this.form.valueChanges.subscribe(data => {
    //   if(data){
    //     this.canDeactivate()
    //   }
    // })
  }

  loadDynamicLayout(): void {
    if (this.themeService.layoutName === 'simple') {
      this.screenHeight = (window.innerHeight - 66) + 'px';
      this.formBuilderHeight = (window.innerHeight - 150) + 'px';
    } else {
      this.screenHeight = (window.innerHeight - 1) + 'px';
      this.formBuilderHeight = (window.innerHeight - 85) + 'px';
    }
  }

  loadSelectedVersion(version: number) {
    this.pageService.getPageByPageIdentifier(this.form.get('pageId').value, version).subscribe(data => {
      this.loadPage(data);
      this.versionMenu.closeMenu();
    });
  }

  checkSignatureLicense() {
    this.licenseVO.category = 'workflow_and_automations';
    this.licenseVO.featureName = 'scheduled_workflow';
    this.pageService.isAllowed(this.licenseVO).subscribe(data => {
      if (data.isAllowed === 'N') {
        this.isSignatureAllowed = false;
      }
    });
  }

  formValueChanges() {
    this.form.get('description').valueChanges.subscribe(data => {
      if (data) {
        this.submitEnable = true;
      }
    });
  }




  omit_number(event) {
    let k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k === 32 || (k >= 48 && k <= 57));
  }

  createApplication() {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '60%',
      data: 'createApp'
    });
    dialog.afterClosed().subscribe(data => {
      if (data === true) {
        this.loadApplicationsList();
      }
    });
  }


  addSectionInternally() {
    this.section = new Section();
    const control = {
      buttonType: 'action',
    };
    const column = new FieldConfig();
    column.controlType = 'button';
    column.field.label.labelName = 'Submit';
    column.field.label.labelOption = 'floating';
    column.field.fieldWidth = 100;
    column.field.control = control;
    column.field.rowBackground = '#ffffff';
    const row = new Row();
    row.row = 1;
    row.layoutDirection = 'row';
    row.layoutResponsiveDirection = 'column';
    row.layoutGap = 20;
    row.alignment = 'end end';
    row.style = null;
    row.rowWidth = 50;
    row.totalColumns = 1;
    row.columns.push(column);
    this.section.width = 100;
    this.section.primaryKey = 'uuid';
    this.section.rows.push(row);
  }

  allowExporttoPdf(event) {
    if (event.checked === true) {
      this.page.exportAsPdf = true;
    } else {
      this.page.exportAsPdf = false;
    }
    this.submitEnable = true;
  }

  copyPage() {
    if (this.page.isWorkflowForm) {
      this.importType = 'workflow-import';
    } else {
      this.importType = 'page-import';
    }
    this.checkPagePermission(this.page);
    const dialog = this.dialog.open(ImportDialogComponent, {
      disableClose: true,
      width: '800px',
      data: { page: this.page, type: this.importType, applicationList: this.applicationsList, importAs: 'copy' }
    });
    dialog.afterClosed().subscribe(data => {
      if (data.data) {
        this.savePageInfo(data);
        this.pageService.savePage(data.page).subscribe(dataResponse => {
          if (dataResponse.response.includes('successfully')) {

            if (data.userPermission === true && this.pagePermissionsVOList !== null
              && this.pagePermissionsVOList !== undefined && this.pagePermissionsVOList.length > 0) {
              if (data.importAs === 'copy') {
                this.pagePermissionsVOList.forEach(element => {
                  element.securityId = dataResponse.pageId;
                });
              }
              this.pageSecurityService.savePagePermissionsList(this.pagePermissionsVOList).subscribe(permissionData => {
                if (permissionData.response.includes('Successfully')) {
                  this.snackBar.openFromComponent(SnackbarComponent, {
                    data: 'Page Copied Successfully',
                  });
                }
              });
            } else {
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: 'Page Copied Successfully',
              });
            }
          }
        });
      }
    });
  }

  savePageInfo(data) {
    this.saveOrUpdateGrid(data);
  }

  saveOrUpdateGrid(data) {
    if (data.gridInfo !== null && data.gridInfo !== undefined && data.gridInfo.length > 0) {
      this.service.getGridInfoByGridName(data.gridInfo[0].oldGridName).subscribe(gridData => {
        if (gridData && gridData.gridId) {
          gridData.gridId = null;
          gridData.gridName = data.gridInfo[0].newGridName;
          gridData.moduleName = data.gridInfo[0].moduleName;
          this.service.saveAndUpdateGridData(gridData).subscribe(gridResponse => {
            if (gridResponse.response.includes('successfully') && this.importedPage === true) {
              this.loadPage(data.page);
            }
          });
        } else {
          if (data.page.gridVO) {
            data.page.gridVO.gridId = null;
            if (data.gridInfo[0].newGridName) {
              data.page.gridVO.gridName = data.gridInfo[0].newGridName;
            } else {
              data.page.gridVO.gridName = data.gridInfo[0].oldGridName;
            }
            data.page.gridVO.moduleName = data.gridInfo[0].moduleName;
            this.service.saveAndUpdateGridData(data.page.gridVO).subscribe(gridResponse => {
              if (gridResponse.response.includes('successfully') && this.importedPage === true) {
                this.loadPage(data.page);
              }
            });
          }
        }
      });
    } else if (this.importedPage === true) {
      this.loadPage(data.page);
    }

  }

  fileImport(event: any) {
    this.form.reset();
    this.page = new Page();
    if (event.target.files[0].type.includes('/json')) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (_event) => {
        this.importFileToken = reader.result;
        this.tokenArray = this.importFileToken.split(',');
        const decodedJwtJsonData = window.atob(this.tokenArray[1]);
        const decodedJwtData = JSON.parse(decodedJwtJsonData);

        this.page = decodedJwtData;
        this.importedPage = true;

        if (this.page.isWorkflowForm === true && (this.page.layoutType === 'workflowForms' || this.page.layoutType === 'publicForm')
          && (this.isFromWorkflow === undefined || this.isFromWorkflow === false)) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'This imported page is not a managed page',
          });
        } else if (this.page.isWorkflowForm === false && this.page.layoutType === 'managedPage' && this.isFromWorkflow === true) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: 'This imported form is not a workflow form ',
          });
        } else {
          this.importPage(this.page);
        }
      }
    } else {
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: 'Invalid file',
      });
    }
  }

  importPage(pageData) {
    if (pageData.isWorkflowForm) {
      this.importType = 'workflow-import';
    } else {
      this.importType = 'page-import';
    }

    const dialog = this.dialog.open(ImportDialogComponent, {
      disableClose: true,
      width: '800px',
      data: { page: pageData, type: this.importType, applicationList: this.applicationsList, importAs: 'import' }
    });


    dialog.afterClosed().subscribe(data => {
      if (data.data) {
        data.page.yorosisPageId = null;
        if (this.importType === 'page-import') {
          data.page.layoutType = 'managedPage';
          this.form.get('layoutType').setValue('managedPage');
        } else if (this.importType === 'workflow-import') {
          this.layoutType = this.layoutType === undefined ? 'workflowForms' : this.layoutType;
          data.page.layoutType = this.layoutType;
          this.form.get('layoutType').setValue(this.layoutType);
        }
        if (this.importType === 'page-import') {
          data.page.isWorkflowForm = false;
          data.page.version = 0;
        } else {
          data.page.isWorkflowForm = true;
          data.page.version = 1;
        }
        if (data.importAs === 'copy') {
          data.page.description = null;
          data.page.workflowKey = null;
          data.page.workflowVersion = null;
          data.page.exportAsPdf = null;
          data.page.publicAccess = null;
        }
        if (data.page.tableObjectListVO !== null && data.page.tableObjectListVO !== undefined && data.page.tableObjectListVO.length > 0) {
          this.pageService.saveTableListVO(data.page.tableObjectListVO).subscribe(tableData => {
            if (tableData.response.includes('Table Objects Created Successfully')) {
              this.savePageInfo(data);
            }
          });
        } else {
          this.savePageInfo(data);
        }
      }
    });
  }

  checkPagePermission(page) {
    if (page.yorosisPageId !== null) {
      this.pageSecurityService.getPagePermissions(page.yorosisPageId).subscribe(data => {
        this.pagePermissionsVOList = data;

      });
    }
  }

  checkTableExist(page) {
    page.sections.forEach(mainSection => {
      mainSection.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'select' || column.controlType === 'multipleselect' ||
            column.controlType === 'radiobutton') {
            if (column.field.control.optionType === 'd' && column.field.control.filter.tableName) {
              if (this.tableList.indexOf(column.field.control.filter.tableName) === -1) {
                this.tableList.push(column.field.control.filter.tableName);
              }
            }
          } else if (column.controlType === 'autocomplete') {
            if (column.field.control.tableName) {
              if (this.tableList.indexOf(column.field.control.tableName) === -1) {
                this.tableList.push(column.field.control.tableName);
              }
            }
          } else if (column.controlType === 'input') {
            if (column.field.enableHyperlink === true && column.field.control.targetPageId) {
              if (this.tableList.indexOf(column.field.control.targetPageId) === -1) {
                this.tableList.push(column.field.control.targetPageId);
              }
            }
          } else if (column.controlType === 'grid') {
            if (page.pageIdWithPrefix && this.tableList.indexOf(page.pageIdWithPrefix) === -1) {
              this.tableList.push(page.pageIdWithPrefix);
              this.service.getGridInfoByGridName(column.field.control.gridId).subscribe(gridData => {
                page.gridVO = gridData;
              });
            }
          } else if (column.controlType === 'table') {
            if (column.field.control.tableId && this.tableList.indexOf(column.field.control.tableId) === -1) {
              this.tableList.push(column.field.control.tableId);
            }
          } else if (column.controlType === 'button' && column.field.control.buttonType &&
            column.field.control.buttonType === 'action') {
            if (column.field.control.screenType && column.field.control.screenType !== 'webServiceCall'
              && column.field.control.screenType !== 'callWorkflow' && this.tableList.indexOf(column.field.control.targetPageId) !== -1) {
              this.tableList.push(column.field.control.targetPageId);
            }

          }
        });
      });
      if (mainSection.sections && mainSection.sections.length > 0) {
        this.checkTableExist(mainSection);
      }
    });
  }

  getSubSectionAndFieldName() {
    this.page.sections.forEach(section => {
      if (section.sections) {
        section.sections.forEach(subsection => {
          if (subsection.repeatableName !== null
            && subsection.repeatableName !== ''
            && subsection.repeatableName !== undefined) {
            this.repeatableSecetionNames.push(subsection.repeatableName);
          }
          subsection.rows.forEach(row => {
            row.columns.forEach(column => {
              this.repeatableFieldNames.push(column.field.name);
            });
          });
        });
      }
    });
  }

  printConfigur() {
    this.repeatableFieldNames = [];
    this.repeatableSecetionNames = [];
    this.getSubSectionAndFieldName();
    const fieldNames = this.formControlName;
    this.repeatableFieldNames.forEach(fieldName => {
      const index = fieldNames.indexOf(fieldName);
      if (index >= 0) {
        fieldNames.splice(index, 1);
      }
    });
    const dialog = this.dialog.open(PrintConfigurationComponent, {
      disableClose: true,
      width: '1200px',
      panelClass: 'scroll',
      maxHeight: '600px',
      data: {
        page: this.page, fieldNames: fieldNames,
        repeatableSectionNames: this.repeatableSecetionNames, repeatableFieldNames: this.repeatableFieldNames
      }
    });
    dialog.afterClosed().subscribe(data => {
      if (data.value !== false) {
        this.form.markAsDirty();
      }
      this.page = data.page;
    });
  }

  loadPage(data) {
    if (this.importedPage === true) {
      this.form.get('pageName').disable({ onlySelf: true });
      this.form.get('pageName').setValue(data.pageName);
      this.form.get('pageId').setValue(data.pageId);
      this.form.get('pageId').disable({ onlySelf: true });
      this.form.get('description').setValue(data.description);
      this.form.get('applicationName').disable({ onlySelf: true });
      this.form.get('applicationName').setValue(data.applicationName);
      this.form.get('applicationId').setValue(data.applicationId);

      this.loadPageData(data);
    } else {
      this.isButon = true;
      this.isLoadForm = true;
      this.printConfigurEnable = true;
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
      this.form.get('exporttoPdf').setValue(data.exportAsPdf);
      this.page = data;
      this.pageIdentifier = this.page.pageId;
      this.appId = this.page.applicationId;
      this.securityOptionEnable = false;
      this.publishOptionEnable = this.page.status;
      if (this.page.status === 'published') {
        this.published = true;
      }
      if ((this.isFromWorkflow === undefined || this.isFromWorkflow === false) && this.page.isWorkflowForm && this.page.layoutType !== 'publicForm') {
        this.isWorkflow = true;
        this.form.get('layoutType').setValue('workflowForms');
      }
      this.manageFlag = data.manageFlag;
      this.formValueChange();
      this.loadPageData(data);
      this.loadFormControlsName(this.page.sections);
      this.connectedToArray();
    }
  }

  connectedToArray() {
    this.page.sections.forEach(section => {
      section.rows.forEach(row => {
        this.connectedTo.push('row_' + this.connectedTo.length)
      })
    });
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



  formValueChange() {
    this.form.valueChanges.subscribe(data => {
      this.canDeactivateForm = true;
    });
  }

  formValueChangeWorkflow() {
    this.form.valueChanges.subscribe(data => {
      if (this.form.get('pageName').value !== '' || this.form.get('pageId').value !== ''
        || this.form.get('description').value !== null || this.enableSubmit) {
        this.isChanged.emit(true);
      } else {
        this.isChanged.emit(false);
      }
    });
  }


  setApplicationId(event, app) {
    if (event.isUserInput === true) {
      this.form.get('applicationId').setValue(app.id);
      this.appId = app.id;
      this.appPrefix = app.appPrefix;
    }
  }

  loadApplicationsList() {
    this.pageService.getApplicationList().subscribe(data => {
      if (this.isFromWorkflow) {

        this.form.get('applicationName').setValue('Yoroflow-App');
        this.form.get('applicationId').setValue('511401b9-1300-45c7-99cc-36e8b95aae52');

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
            const fieldNameArr = new FieldName();
            fieldNameArr.label = column.field.label.labelName;
            fieldNameArr.name = column.field.name;
            if (column.controlType === 'date') {
              this.fieldName.push(fieldNameArr);
            }
            if (column.controlType === 'password' && column.field.control.isConfirmPassword === false) {
              this.formControlNamePasswordField.push(fieldNameArr);
            }
            if (column.controlType === 'date') {
              this.dateFieldName.push(fieldNameArr);
            }
            if (column.controlType === 'input' && column.field.dataType !== 'string') {
              this.numberField.push(fieldNameArr);
            }
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
          if (column.field.control && column.field.control.buttonType &&
            column.field.control.buttonType !== undefined && column.field.control.buttonType !== null &&
            column.field.control.buttonType !== '' && column.field.control.buttonType === 'submit') {
            this.allowSubmitbutton = true;
            returnValue = true;
            return returnValue;
          } else {
            this.allowSubmitbutton = false;

          }
        });
      });
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

  removeDateAndPasswordFieldValues(fieldName) {
    const removeIndex = this.formControlNamePasswordField.findIndex(x => x.name === fieldName);
    if (removeIndex !== -1) {
      this.formControlNamePasswordField.splice(removeIndex, 1);
    }
    const removeIndexDate = this.dateFieldName.findIndex(x => x.name === fieldName);
    if (removeIndexDate !== -1) {
      this.dateFieldName.splice(removeIndexDate, 1);
    }
    const removeIndexInput = this.numberField.findIndex(x => x.name === fieldName);
    if (removeIndexInput !== -1) {
      this.numberField.splice(removeIndexInput, 1);
    }
  }
  removeColumn(index: number, columns: FieldConfig[], row: number, sections: Section) {
    const totalColumns = sections.rows[row].totalColumns;
    sections.rows[row].totalColumns = totalColumns - 1;
    const sectionRow = sections.rows[row];
    this.enableSubmit = true;
    this.isChanged.emit(true);
    if (sections.rows[row].totalColumns === 0) {
      sections.rows.splice(row, 1);
    }
    this.removeDateAndPasswordFieldValues(columns[index].field.name);
    const nameIndex = this.formControlName.indexOf(columns[index].field.name);
    this.formControlName.splice(nameIndex, 1);
    columns.splice(index, 1);
    for (let column = 0; column < sectionRow.totalColumns; column++) {
      sectionRow.columns[column].field.fieldWidth = Math.round(sectionRow.rowWidth / sectionRow.totalColumns);
    }
    const removeObj = this.fieldName.map(function (item) {
      return item.label;
    }).indexOf('' + nameIndex);
    this.fieldName.splice(removeObj, 1);
  }


  setColumnSplice(columnsValue: FieldConfig) {
    if (columnsValue.controlType === 'divider') {
      return false;
    } else if (columnsValue.controlType === 'table') {
      if (columnsValue.field.control && columnsValue.field.control.tableId) {
        return false;
      }
      return true;
    } else if (columnsValue.controlType === 'shoppingcart') {
      if (columnsValue.field.control && columnsValue.field.control.shoppingCartLabel) {
        return false;
      }
      return true;
    } else if (columnsValue.controlType === 'page') {
      if (columnsValue.field.control && columnsValue.field.control.pageName) {
        return false;
      }
      return true;
    } else if (columnsValue.controlType === 'grid') {
      if (columnsValue.field.control && columnsValue.field.control.gridId) {
        return false;
      }
      return true;
    } else if (columnsValue.controlType === 'button') {
      if (columnsValue.field.label.labelName) {
        return false;
      }
      return true;
    } else if (columnsValue.controlType === 'label') {
      if (columnsValue.field.label.labelName) {
        return false;
      }
      return true;
    } else if (columnsValue.controlType === 'paragraph') {
      if (columnsValue.field.control.paragraph) {
        return false;
      }
      return true;
    } else if (columnsValue.controlType === 'fileupload'
      || columnsValue.controlType === 'extractaspdf'
      || columnsValue.controlType === 'signaturecontrol'
      || columnsValue.controlType === 'hiddencontrol') {
      if (columnsValue.field.label.labelName) {
        return false;
      }
      return true;
    } else if (columnsValue.controlType === 'imagegrid') {
      if (columnsValue.field.control && columnsValue.field.control.imageGridLabel) {
        return false;
      }
      return true;
    } else if (columnsValue.controlType === 'tabbedmenu') {
      if (columnsValue.field.control && columnsValue.field.control.menuId) {
        return false;
      }
      return true;
    } else if (!columnsValue.controlType || !columnsValue.field.name) {
      return true;
    }
    return false;
  }

  getAccessForPageCreation(): boolean {
    let returnValue = false;



    for (let sections = 0; sections < this.page.sections.length; sections++) {
      if (this.page.sections[sections].sections && this.page.sections[sections].sections.length > 0) {
        for (let nestedSection = 0; nestedSection < this.page.sections[sections].sections.length; nestedSection++) {
          if (this.page.sections[sections].sections[nestedSection].rows.length === 0) {

            this.page.sections[sections].sections.splice(nestedSection, 1);
            return true;
          } else {
            if (this.page.sections[sections].sections) {
              for (let rows = 0; rows < this.page.sections[sections].sections[nestedSection].rows.length; rows++) {
                for (let column = 0; column < this.page.sections[sections].sections[nestedSection].rows[rows].columns.length; column++) {
                  const columnsValue = this.page.sections[sections].sections[nestedSection].rows[rows].columns[column];


                  if (this.setColumnSplice(columnsValue)) {

                    this.page.sections[sections].sections[nestedSection].rows[rows].columns.splice(column, 1);
                    if (this.page.sections[sections].sections[nestedSection].rows[rows].columns.length === 0) {
                      this.page.sections[sections].sections[nestedSection].rows.splice(rows, 1);
                      this.pagesettings = false;
                      this.sectionSettings = false;
                      this.controlsShow = true;
                      this.nestedSectionSettings = false;
                      this.rowSettings = false;
                    }
                    return true;
                  }
                  else {
                    returnValue = true;
                  }

                }
              }
            }
            if (this.page.sections[sections].sections[nestedSection].sections) {
              for (let nestedSubSection = 0; nestedSubSection < this.page.sections[sections].sections[nestedSection].sections.length; nestedSubSection++) {

                if (this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows.length === 0) {

                  this.page.sections[sections].sections[nestedSection].sections.splice(nestedSubSection, 1);
                  return true;
                } else {
                  for (let rows = 0; rows < this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows.length; rows++) {
                    for (let column = 0; column < this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows[rows].columns.length; column++) {
                      const columnsValue = this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows[rows].columns[column];

                      if (this.setColumnSplice(columnsValue)) {
                        this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows[rows].columns.splice(column, 1);
                        if (this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows[rows].columns.length === 0) {
                          this.page.sections[sections].sections[nestedSection].sections[nestedSubSection].rows.splice(rows, 1);
                          this.pagesettings = false;
                          this.sectionSettings = false;
                          this.controlsShow = true;
                          this.nestedSectionSettings = false;
                          this.rowSettings = false;
                        }

                        return true;
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

      if (this.page.sections[sections]) {
        if (this.page.sections[sections].rows.length === 0) {

          if (this.page.sections.length > 1) {
            this.page.sections.splice(sections, 1);
          } else {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: 'Section is empty, add atleast one column to proceed',
            });
            return false;
          }
          return true;
        } else {
          for (let rows = 0; rows < this.page.sections[sections].rows.length; rows++) {
            if (this.page.sections[sections].rows[rows].columns.length === 0) {

              if (this.page.sections.length > 1) {
                this.page.sections.splice(sections, 1);
              } else {
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: 'Section is empty, add atleast one column to proceed',
                });
                return false;
              }
              return true;
            }

            for (let column = 0; column < this.page.sections[sections].rows[rows].columns.length; column++) {
              const columnsValue = this.page.sections[sections].rows[rows].columns[column];
              if (this.setColumnSplice(columnsValue)) {
                this.page.sections[sections].rows[rows].columns.splice(column, 1);
                if (this.page.sections[sections].rows[rows].columns.length === 0) {
                  this.page.sections[sections].rows.splice(rows, 1);
                  this.pagesettings = false;
                  this.sectionSettings = false;
                  this.controlsShow = true;
                  this.nestedSectionSettings = false;
                  this.rowSettings = false;
                }

                return true;
              }


              else {
                returnValue = true;
              }

            }
          }

        }
      }



    }


    return returnValue;
  }

  tokenExpires() {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '450px',
      data: { type: 'export', data: this.page }
    });
    dialog.afterClosed().subscribe(data => {
      if (data === true) {
        const jsondata = JSON.stringify(this.page);
        const a = document.createElement('a');
        const file = new Blob([jsondata], { type: 'text/json' });
        a.href = URL.createObjectURL(file);
        a.download = this.form.get('pageName').value + '-' + this.page.version + '.json';
        a.click();
      }
      this.router.navigate(['/login']);
    });
  }

  export() {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      disableClose: true,
      width: '450px',
      data: { type: 'export-table' }
    });

    dialog.afterClosed().subscribe(data => {
      if (data.data === true && data.type === 'include') {
        this.checkTableExist(this.page);
        if (this.tableList !== null && this.tableList !== undefined && this.tableList.length > 0) {
          this.tableListVO.tableList = this.tableList;
          this.pageService.getTableListVO(this.tableListVO).subscribe(tableData => {
            this.page.tableObjectListVO = tableData;
            this.exportFile(this.page);
          });
        } else {
          this.page.tableObjectListVO = null;
          this.exportFile(this.page);
        }
      } else if (data.data === true && data.type === 'exclude') {
        this.page.tableObjectListVO = null;
        this.exportFile(this.page);
      }
    });


  }

  getGridConfig() {

  }

  exportFile(page) {
    const jsondata = JSON.stringify(page);
    const a = document.createElement('a');
    const file = new Blob([jsondata], { type: 'text/json' });
    a.href = URL.createObjectURL(file);
    if (page.version) {
      a.download = this.form.get('pageName').value + '-' + page.version + '.json';
    } else {
      a.download = this.form.get('pageName').value + '.json';
    }

    a.click();
  }


  createPage(userForm) {
    this.isSubmitted = false;
    if (this.workflowKey && this.page.layoutType === 'publicForm') {
      this.page.workflowKey = this.workflowKey;
      this.page.workflowVersion = 'latest';
    }
    this.page.sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'button' && this.page.layoutType === 'publicForm') {
            column.field.control.buttonType = 'action';
            column.field.control.screenType = 'callWorkflow';
            column.field.control.saveAndCallWorkflow = true;
            column.field.control.workflowKey = this.workflowKey;
            column.field.control.workflowVersion = 'latest';
          }
        });
      });
    });

    if (this.getAccessForPageCreation() === false) {
      this.isSubmitted = true;
    }
    if (this.isFromWorkflow || this.isWorkflow) {
      this.form.get('applicationName').setValidators(null);
      this.form.updateValueAndValidity();
    }

    if (this.workflowForm) {
      this.allowSubmitbutton = true;
      this.canDeactivateForm = false;
      this.isUpdate = false;
      this.createPageForm(userForm);
    } else {
      if (this.applicationsList.length === 0 && !this.yoroflowVO && !this.page.isWorkflowForm) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Create application to save page',
        });
      }
      if (this.getAccessForPageCreation() === true && userForm.valid) {
        if (this.getAccessForSubmitButton() !== true && !this.yoroflowVO && !this.page.isWorkflowForm) {
          const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
            width: '250px',
            data: { type: 'allow-submit-button-action' }
          });
          dialogRef.afterClosed().subscribe(data => {
            if (data === true) {
              this.allowSubmitbutton = true;
              this.canDeactivateForm = false;
              this.isUpdate = true;
              this.createPageForm(userForm);
            }
          });
        } else if (this.getAccessForSubmitButton() !== true && this.page.isWorkflowForm && this.page.version >= 1) {
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
            this.page.layoutType = this.form.get('layoutType').value;
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

                if (this.jwtHelper.isTokenExpired(localStorage.getItem('token'))) {
                  this.tokenExpires();
                } else {
                  this.pageService.savePage(this.page).subscribe(dataResponse => {
                    this.snackBar.openFromComponent(SnackbarComponent, {
                      data: dataResponse.response,
                    });


                    if (this.isFromWorkflow === true || this.isFromApplicationLayout === true) {
                      this.emitPageId.emit(dataResponse);
                    } else if (this.isFromWorkflow === false && this.page.isWorkflowForm) {
                      this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/workflow-page-list']);
                    } else {
                      this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/page-list']);
                    }
                    userForm.resetForm();
                    this.page = new Page();
                    this.showSectionAddIcon = false;
                    this.buttonVisible = false;
                    this.canDeactivateForm = false;
                  });
                }
              }
            });
          } else {
            this.page.description = this.form.get('description').value;
            this.page.applicationId = this.form.get('applicationId').value;
            this.page.applicationName = this.form.get('applicationName').value;
            this.page.layoutType = this.form.get('layoutType').value;
            if (this.page.isWorkflowForm === undefined || this.page.isWorkflowForm === null) {
              this.page.isWorkflowForm = false;
            }
            if (this.isFromWorkflow === true) {
              this.page.isWorkflowForm = this.isFromWorkflow;
            }

            if (this.jwtHelper.isTokenExpired(localStorage.getItem('token'))) {
              this.tokenExpires();
            } else {
              this.pageService.updatePage(this.page, this.page.yorosisPageId).subscribe(updateResponse => {
                this.snackBar.openFromComponent(SnackbarComponent, {
                  data: updateResponse.response,
                });
                if (this.isFromWorkflow === true || this.isFromApplicationLayout === true) {
                  this.emitPageId.emit(updateResponse);
                }
                if (!this.isFromWorkflow && !this.isFromApplicationLayout) {
                  this.canDeactivateForm = false;
                  this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/page-list']);
                }
              }, error => {
                if (error.includes('has null values which cannot be modified to a required for the existing data')) {
                  this.snackBar.openFromComponent(SnackbarComponent, {
                    data: error,
                  });
                }
              });
            }
          }
        }
        this.formControlName = [];
        this.fieldName = [];
      }
    }
  }

  createPageForm(userForm) {
    if (userForm.valid && this.getAccessForPageCreation() === true) {
      this.canDeactivateForm = false;
      if (this.page.yorosisPageId && this.isUpdate === false || (this.page.yorosisPageId === null || this.page.yorosisPageId === undefined)) {
        this.page.pageName = this.form.get('pageName').value;
        this.page.pageId = this.form.get('pageId').value;
        this.page.description = this.form.get('description').value;
        this.page.applicationId = this.form.get('applicationId').value;
        this.page.applicationName = this.form.get('applicationName').value;
        this.page.layoutType = this.form.get('layoutType').value;
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
            } else if (this.importedPage) {
              this.saveNewPageInfo(userForm);
            }
          } else {
            this.saveNewPageInfo(userForm);
          }
        });
      } else if (this.isUpdate === true && this.page.yorosisPageId) {
        this.page.description = this.form.get('description').value;
        this.page.applicationId = this.form.get('applicationId').value;
        this.page.applicationName = this.form.get('applicationName').value;
        this.page.layoutType = this.form.get('layoutType').value;
        if (this.page.isWorkflowForm === undefined || this.page.isWorkflowForm === null) {
          this.page.isWorkflowForm = false;
        }
        if (this.isFromWorkflow === true) {
          this.page.isWorkflowForm = this.isFromWorkflow;
        }

        if (this.jwtHelper.isTokenExpired(localStorage.getItem('token'))) {
          this.tokenExpires();
        } else {
          this.pageService.updatePage(this.page, this.page.yorosisPageId).subscribe(updateResponse => {
            this.snackBar.openFromComponent(SnackbarComponent, {
              data: updateResponse.response,
            });
            if (this.isFromWorkflow === true) {
              this.emitPageId.emit(updateResponse);
            }
            if ((this.isFromWorkflow === undefined || this.isFromWorkflow === false) && this.page.isWorkflowForm) {
              this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/workflow-page-list']);
            } else if (this.isFromApplicationLayout === true) {
              this.emitPageId.emit(updateResponse);
            } else if (!this.isFromWorkflow && !this.isFromApplicationLayout && !this.isWorkflow) {
              this.canDeactivateForm = false;
              this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/page-list']);
            }
          });
        }
      }
    } else {
      this.canDeactivateForm = true;
    }
  }

  saveNewPageInfo(userForm) {
    if (this.isFromWorkflow === true) {
      this.page.isWorkflowForm = this.isFromWorkflow;
    }
    if (this.page.isWorkflowForm === true && this.page.version >= 1) {
      this.page.version = this.page.version;
    } else {
      this.page.version = 0;
    }

    if (this.jwtHelper.isTokenExpired(localStorage.getItem('token'))) {
      this.tokenExpires();
    } else {


      this.page.sections.forEach(section => {
        section.tableName = this.page.pageId;
      });
      this.pageService.savePage(this.page).subscribe(dataResponse => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: dataResponse.response,
        });

        userForm.resetForm();
        if (window.location.href.includes('/workflow-page') ||
        ((this.isFromWorkflow === undefined || this.isFromWorkflow === false) && this.page.isWorkflowForm)) {
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/workflow-page-list']);
        } else if (this.isFromWorkflow === true) {
          this.emitPageId.emit(dataResponse);
        }  else if (this.isFromApplicationLayout === true) {
          this.emitPageId.emit(dataResponse);
        } else if (!this.isFromWorkflow && !this.isFromApplicationLayout && !this.isWorkflow) {
          this.canDeactivateForm = false;
          this.router.navigate([this.workspaceService.getWorkSpaceKey() + '/page-list']);
        }
        this.isSubmitted = false;
        this.canDeactivateForm = false;
        this.page = new Page();
        this.buttonVisible = false;
      });
    }
  }

  addSection() {
    if (this.page.yorosisPageId === null || this.page.yorosisPageId === undefined) {
      this.page.sections.push(new Section());
      const sectionIndex = this.page.sections.length - 1;
      this.showDiv[sectionIndex] = false;
      this.showButtons[sectionIndex] = true;
      this.sectionDetails(sectionIndex, 0);
      this.showButtons[sectionIndex] = true;
    } else {
      const sectionIndex = this.page.sections.length;
      this.showDiv[sectionIndex] = true;
      this.showButtons[sectionIndex] = true;
      this.sectionDetails(sectionIndex, 1);
      this.showButtons[sectionIndex] = true;
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
      const removeObj = this.fieldName.map(function (item) {
        return item.label;
      }).indexOf('' + nameIndex);
      this.fieldName.splice(removeObj, 1);
      this.removeDateAndPasswordFieldValues(rows[index].columns[columns].field.name);
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
      if (data === 'cancel') {
        this.isChanged.emit(false);
        this.page.sections.splice(section, 1);

      } else {
        this.enableSubmit = true;
        this.isChanged.emit(true);
        this.showDiv[section] = true;
        this.showButtons[section] = true;
        this.page.sections[section] = data;
        this.page.sections[section].rows = [];
      }
    });
    this.showSectionAddIcon = true;
  }

  rowAddAbove(section: Section, j) {
    if (this.yoroflowVO && this.yoroflowVO.publicForm && j === 'rowAdd') {
      section.rows.splice(1, 0, new Row());
      const row = section.rows[1];
      row.row = 2;
      row.totalColumns = 1;
      row.columns.push(this.fieldConfig);
    } else {
      section.rows.splice(j + 1, 0, new Row());
      const index = j;
      let row = section.rows[index + 1];
      let background;
      let style;
      row.row = index + 2;

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
        let isButton = false;
        section.rows.forEach(row => {
          row.columns.forEach(column => {
            if (column.controlType === 'button' && this.page.layoutType === 'publicForm') {
              isButton = true;
            }
          });
        });

        if (this.yoroflowVO && (this.yoroflowVO.publicForm || this.yoroflowVO.isPublicform) && j === 0 && !this.isButon) {
          this.addSectionInternally();
          this.isButon = true;
          this.page.sections.push(this.section);
          this.showDiv[1] = true;
          this.showButtons[1] = false;
        }

        this.fieldWidth = [];
        if (j === 0) {
          row.rowBackground = background;
          row.style = style;
          section.rows[0] = row;
        } else {
          row.style = style;
          row.rowBackground = background;
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



  removeFieldWhenControlChange(fieldName) {
    const removeIndex = this.formControlName.findIndex(x => x === fieldName);
    if (removeIndex !== -1) {
      this.formControlName.splice(removeIndex, 1);
    }
    const removeFieldIndex = this.fieldName.findIndex(x => x.name === fieldName);
    if (removeFieldIndex !== -1) {
      this.fieldName.splice(removeFieldIndex, 1);
    }
    const removePasswordIndex = this.formControlNamePasswordField.findIndex(x => x.name === fieldName);
    if (removePasswordIndex !== -1) {
      this.formControlNamePasswordField.splice(removePasswordIndex, 1);
    }
    const removeDateIndex = this.dateFieldName.findIndex(x => x.name === fieldName);
    if (removeDateIndex !== -1) {
      this.dateFieldName.splice(removeDateIndex, 1);
    }
    const removeDateIndexInput = this.numberField.findIndex(x => x.name === fieldName);
    if (removeDateIndexInput !== -1) {
      this.numberField.splice(removeDateIndexInput, 1);
    }
  }

  createField(event: CdkDragDrop<string[]>, row: number, column: number, sections: Section, columns: FieldConfig, mainSection: boolean) {
    this.canDeactivateForm = true;
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
    let workflowForm = false;
    if (this.isFromWorkflow) {
      workflowForm = this.isFromWorkflow;
    } else if (this.isWorkflow) {
      workflowForm = this.isWorkflow;
    }
    const rowWidth = sections.rows[row].rowWidth;
    const totalColumns = sections.rows[row].totalColumns;
    const columns = sections.rows[row].columns[column];
    const updateFieldName = columns.field.name;
    const dataType = columns.field.dataType;
    if (columns.controlType !== 'divider') {
      if (columns.controlType !== undefined) {
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
          if (fieldName.img === 'tabbedmenu') {
            const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
              width: '450px',
              data: 'menu-config'
            });
            dialogRef.afterClosed().subscribe(data => {
              if (data === false) {
                const bottomSheetRef = this.rightSheet.open(FormfieldComponent, {
                  disableClose: true,
                  data: [columns, this.formControlName,
                    mainSection, this.page.pageId, this.page.manageFlag,
                    this.fieldName, this.page.version, this.page.layoutType, workflowForm, this.workflowName, this.workflowKey],
                  panelClass: 'bottom-sheet-container'
                });
                bottomSheetRef.instance.onAdd.subscribe((menuData: any) => {
                  if (menuData === false) {
                    sections.rows[row].columns[column].controlType = '';
                    this.fieldWidth[column] = '';
                    this.formControlName.push(null);
                  } else {
                    this.enableSubmit = true;
                    this.isChanged.emit(true);
                    sections.rows[row].columns[column] = menuData;
                    this.fieldWidth[column] = menuData.field.fieldWidth;
                    this.formControlName.push(menuData.field.name);
                  }
                });
              } else if (data === true) {
                if (this.form.get('applicationName').value === '' || this.form.get('applicationName').value === null) {
                  const appMenuDialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
                    width: '400px',
                    data: 'appMenu'
                  });
                  appMenuDialog.afterClosed().subscribe(data => {
                    sections.rows[row].columns[column].controlType = '';
                    this.fieldWidth[column] = '';
                    this.formControlName.push(null);
                  });
                } else {
                  if (this.appId !== undefined) {
                    const menuDialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
                      width: '1200px',
                      data: { data: 'menu-creation', appName: this.form.get('applicationName').value, appId: this.appId }
                    });
                    menuDialog.afterClosed().subscribe(menuId => {
                      if (menuId && menuId !== false) {
                        const controlObj = new TabbedMenu();
                        controlObj.menuId = menuId;
                        controlObj.menuOrientation = 'horizontal';
                        sections.rows[row].columns[column].field.control = controlObj;
                        this.enableSubmit = true;
                        this.isChanged.emit(true);
                        this.fieldWidth[column] = '100';
                        this.formControlName.push(null);
                      } else {
                        sections.rows[row].columns[column].controlType = '';
                        this.fieldWidth[column] = '';
                        this.formControlName.push(null);
                      }
                    });
                  }
                }
              }
            });
          }
          else if (fieldName.img === 'grid') {
            if (this.pageIdentifier !== undefined && this.pageIdentifier !== '' && this.pageIdentifier !== null) {
              const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
                width: '250px',
                data: 'grid-config'
              });
              dialogRef.afterClosed().subscribe(data => {
                if (data === false) {
                  const bottomSheetRef = this.rightSheet.open(FormfieldComponent, {
                    disableClose: true,
                    data: [columns, this.formControlName, mainSection,
                      this.page.pageId, this.page.manageFlag, this.fieldName, this.page.version, this.page.layoutType, workflowForm, this.workflowName, this.workflowKey],
                    panelClass: 'bottom-sheet-container'
                  });
                  bottomSheetRef.instance.onAdd.subscribe((gridData: any) => {
                    if (gridData === false) {
                      sections.rows[row].columns[column].controlType = '';
                      this.fieldWidth[column] = '';
                      this.formControlName.push(null);
                    } else {
                      this.enableSubmit = true;
                      this.isChanged.emit(true);
                      sections.rows[row].columns[column] = gridData;
                      sections.rows[row].columns[column].field.control.targetPageId = this.pageIdentifier;
                      this.fieldWidth[column] = gridData.field.fieldWidth;
                      this.formControlName.push(gridData.field.name);
                    }
                  });
                } else {
                  const bottomSheetRef = this.rightSheet.open(PageGridConfigurationComponent, {
                    width: '1250px',
                    disableClose: true,
                    data: { pageId: this.pageIdentifier, appId: this.form.get('applicationId').value, version: this.page.version },
                    panelClass: 'grid-right-sheet-container'
                  });
                  bottomSheetRef.instance.onAdd.subscribe((gridData: any) => {
                    if (gridData === false) {
                      sections.rows[row].columns[column].controlType = '';
                      this.fieldWidth[column] = '';
                      this.formControlName.push(null);
                    } else {
                      this.enableSubmit = true;
                      this.isChanged.emit(true);
                      sections.rows[row].columns[column].field.control = new Grid();
                      sections.rows[row].columns[column].field.control.gridId = gridData;
                      sections.rows[row].columns[column].field.control.targetPageId = this.pageIdentifier;
                      this.fieldWidth[column] = 100;
                      this.formControlName.push(gridData);
                    }
                  });
                }
              });
            } else {
              const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
                width: '250px',
                data: 'grid-config'
              });
              dialogRef.afterClosed().subscribe(data => {
                if (data === true) {
                  this.snackBar.openFromComponent(SnackbarComponent, {
                    data: 'You need to save this page with controls before creating grid'
                  });
                  sections.rows[row].columns[column].controlType = '';
                  this.fieldWidth[column] = '';
                  this.formControlName.push(null);
                } else {
                  const bottomSheetRef = this.rightSheet.open(FormfieldComponent, {
                    disableClose: true,
                    data: [columns, this.formControlName, mainSection,
                      this.page.pageId, this.page.manageFlag, this.fieldName, this.page.version, this.page.layoutType, workflowForm, this.workflowName, this.workflowKey],
                    panelClass: 'bottom-sheet-container'
                  });
                  bottomSheetRef.instance.onAdd.subscribe((gridData: any) => {
                    if (gridData === false) {
                      sections.rows[row].columns[column].controlType = '';
                      this.fieldWidth[column] = '';
                      this.formControlName.push(null);
                    } else {
                      this.enableSubmit = true;
                      this.isChanged.emit(true);
                      sections.rows[row].columns[column] = gridData;
                      this.fieldWidth[column] = gridData.field.fieldWidth;
                      this.formControlName.push(gridData.field.name);
                    }
                  });
                }
              });

            }
          } else if (fieldName.img === 'shoppingcart') {
            const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
              width: '250px',
              data: 'cart-config'
            });
            dialogRef.afterClosed().subscribe(data => {
              if (data === true) {
                const bottomSheetRef = this.rightSheet.open(ShoppingCardStepNameComponent, {
                  width: '1350px',
                  disableClose: true,
                  data: [columns],
                  panelClass: 'grid-right-sheet-container'
                });
                bottomSheetRef.instance.onAdd.subscribe((shoppingData: any) => {
                  if (shoppingData === false) {
                    sections.rows[row].columns[column].controlType = '';
                    this.fieldWidth[column] = '';
                    this.formControlName.push(null);
                  } else {
                    this.enableSubmit = true;
                    this.isChanged.emit(true);
                    sections.rows[row].columns[column] = shoppingData;
                  }
                });
              } else {
                const bottomSheetRef = this.rightSheet.open(FormfieldComponent, {
                  disableClose: true,
                  data: [columns, this.formControlName, mainSection,
                    this.page.pageId, this.page.manageFlag, this.fieldName, this.page.version, this.page.layoutType, workflowForm, this.workflowName, this.workflowKey],
                  panelClass: 'bottom-sheet-container'
                });
                bottomSheetRef.instance.onAdd.subscribe((shoppingGridData: any) => {
                  if (shoppingGridData === false) {
                    sections.rows[row].columns[column].controlType = '';
                    this.fieldWidth[column] = '';
                    this.formControlName.push(null);
                    // this.fieldName.push(null);
                  } else {
                    this.enableSubmit = true;
                    this.isChanged.emit(true);
                    sections.rows[row].columns[column] = shoppingGridData;
                    this.fieldWidth[column] = shoppingGridData.field.fieldWidth;
                    this.formControlName.push(shoppingGridData.field.name);
                  }
                });

              }
            })

          } else {
            const bottomSheetRef = this.rightSheet.open(FormfieldComponent, {
              disableClose: true,
              data: [columns, this.formControlName, mainSection,
                this.page.pageId, this.page.manageFlag, this.fieldName, this.page.version, this.page.layoutType,
                this.formControlNamePasswordField,
                this.dateFieldName, this.isLoadForm, this.numberField, this.page, workflowForm, this.workflowName, this.workflowKey],
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
                this.updateWorflowButtonConfigProperties(data);
                this.fieldWidth[column] = data.field.fieldWidth;
                if (data.field.name !== '' && data.field.name !== null) {
                  this.getFormControlList(updateFieldName, data.field.name, fieldName);
                  const fieldNameArr = new FieldName();
                  fieldNameArr.label = data.field.label.labelName;
                  fieldNameArr.name = data.field.name;
                  if (!this.fieldName.some(fieldNames => fieldNames.name === data.field.name)) {
                    if (updateFieldName !== undefined && data.field.name !== updateFieldName) {
                      const removeIndex = this.fieldName.findIndex(x => x.name === updateFieldName);
                      if (removeIndex !== -1) {
                        this.fieldName.splice(removeIndex, 1, fieldNameArr);
                      }
                    } else {
                      this.fieldName.push(fieldNameArr);
                    }
                  }
                  if (fieldName.img === 'password' && data.field.control.isConfirmPassword === false &&
                    !this.formControlNamePasswordField.some(fieldNames => fieldNames.name === data.field.name)) {
                    if (updateFieldName !== undefined && data.field.name !== updateFieldName) {
                      const removeIndex = this.formControlNamePasswordField.findIndex(x => x.name === updateFieldName);
                      if (removeIndex !== -1) {
                        this.formControlNamePasswordField.splice(removeIndex, 1, fieldNameArr);
                      }
                    } else {
                      this.formControlNamePasswordField.push(fieldNameArr);
                    }
                  }
                  if (fieldName.img === 'date' && !this.dateFieldName.some(fieldNames => fieldNames.name === data.field.name)) {
                    if (updateFieldName !== undefined && data.field.name !== updateFieldName) {
                      const removeIndex = this.dateFieldName.findIndex(x => x.name === updateFieldName);
                      if (removeIndex !== -1) {
                        this.dateFieldName.splice(removeIndex, 1, fieldNameArr);
                      }
                    } else {
                      this.dateFieldName.push(fieldNameArr);
                    }
                  }
                  if (fieldName.img === 'input' && !this.numberField.some(fieldNames => fieldNames.name === data.field.name)) {
                    if (updateFieldName !== undefined && data.field.name !== updateFieldName) {
                      const removeIndex = this.numberField.findIndex(x => x.name === updateFieldName);
                      if (removeIndex !== -1) {
                        this.numberField.splice(removeIndex, 1, fieldNameArr);
                      }
                    } else {
                      if (data.field.dataType !== 'string') {
                        this.numberField.push(fieldNameArr);
                      }
                    }
                  }
                  if (fieldName.controlType === 'input' && dataType !== undefined && data.field.dataType !== dataType) {
                    if (dataType === 'string' && (data.field.dataType === 'float' || data.field.dataType === 'long')) {
                      this.numberField.push(fieldNameArr);
                    }
                    if (data.field.dataType === 'string' && (dataType === 'float' || dataType === 'long')) {
                      const removeIndex = this.numberField.findIndex(x => x.name === data.field.name);
                      if (removeIndex !== -1) {
                        this.numberField.splice(removeIndex, 1);
                      }
                    }
                  }
                }
              }
            });
          }
        }
      }
    }

  }

  getFormControlList(oldName, NewName, fieldName) {
    if (NewName !== '' && NewName !== null &&
      !this.formControlName.some(fieldNames => fieldNames === NewName)) {
      if (oldName !== undefined && NewName !== oldName) {
        const removeIndex = this.formControlName.findIndex(x => x === oldName);
        if (removeIndex !== -1) {
          this.formControlName.splice(removeIndex, 1, NewName);
        }
      } else {
        this.formControlName.push(NewName);
      }
    }
  }

  updateWorflowButtonConfigProperties(fieldConfig: FieldConfig) {
    if (fieldConfig.controlType === 'button' && fieldConfig.field.control) {
      const control = fieldConfig.field.control;
      if (control.buttonType === 'action' && control.screenType === 'callWorkflow') {
        this.page.saveAndCallWorkflow = control.saveAndCallWorkflow;
        this.page.workflowKey = control.workflowKey;
        this.page.workflowVersion = control.workflowVersion;
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
            fieldConfig.field.rowBackground = '#ffffff';
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
      panelClass: 'section-sheet-container',
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
        if (data.security) {
          this.page.sections[sectionIndex].security = data.security;
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
        // tslint:disable-next-line:prefer-for-of
        for (let row = 0; row < section[index].rows.length; row++) {
          // tslint:disable-next-line:prefer-for-of
          for (let columns = 0; columns < section[index].rows[row].columns.length; columns++) {
            const nameIndex = this.formControlName.indexOf(section[index].rows[row].columns[columns].field.name);

            this.formControlName.splice(nameIndex, 1);
            const removeObj = this.fieldName.map(function (item) {
              return item.label;
            }).indexOf('' + nameIndex);
            this.fieldName.splice(removeObj, 1);
            this.removeDateAndPasswordFieldValues(section[index].rows[row].columns[columns].field.name);
          }
        }
        section.splice(index, 1);
      }
    });
  }

  resetPage(userForm) {
    if (this.importedPage) {
      this.isButon = false;
      this.page.sections = [];
      this.showSectionAddIcon = false;
      this.ngOnInit();
      userForm.resetForm();
      this.buttonVisible = false;
      this.canDeactivateForm = false;
      this.publishOptionEnable = true;
      this.securityOptionEnable = true;
    } else {
      if (this.page.yorosisPageId === null || this.page.yorosisPageId === undefined) {
        const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
          width: '250px',
          data: 'reset-page'
        });
        this.isSubmitted = false;
        dialogRef.afterClosed().subscribe(data => {
          if (data === true) {
            this.isButon = false;
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

  }

  resetPageSettings() {
    this.form.get('pageId').reset();
    this.form.get('description').reset();
    this.form.get('exporttoPdf').setValue(false)
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
  nestedSectionUpdate(section: Section, parentSection: Section, nestedSection: boolean, i: number) {
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
        this.enableSubmit = true;
        this.isChanged.emit(true);
        // parentSection.sections[i] = data;
        parentSection.sections[i].name = data.name;
        parentSection.sections[i].border = data.border;
        parentSection.sections[i].collapsible = data.collapsible;
        parentSection.sections[i].width = data.width;
        parentSection.sections[i].border = data.border;
        parentSection.sections[i].childSection = data.childSection;
        parentSection.sections[i].logicalSectionName = data.logicalSectionName;
        parentSection.sections[i].parentTable = data.parentTable;
        parentSection.sections[i].primaryKey = data.primaryKey;
        parentSection.sections[i].repeatable = data.repeatable;
        parentSection.sections[i].repeatableName = data.repeatableName;
        parentSection.sections[i].style = data.style;
        parentSection.sections[i].addRepeatableSectionButtonName = data.addRepeatableSectionButtonName;
        parentSection.sections[i].removeRepeatableSectionButtonName = data.removeRepeatableSectionButtonName;
      }
    });
  }

  focusOutForFormElement($event) {
    const pageName = this.form.get('pageName').value;
    this.form.get('pageId').setValue((pageName).trim().toLowerCase().replace(/ +/g, ''));
    this.page.pageId = this.form.get('pageId').value;
    if (pageName !== '') {
      this.pageService.checkPageName(pageName).subscribe(data => {
        if (data.response.includes('already exist')) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.form.get('pageName').setErrors({ alreadyExist: true });
          // this.form.get('pageName').updateValueAndValidity();
          this.showSectionAddIcon = false;
          this.canDeactivateForm = true;
          this.buttonVisible = false;
        } else {
          this.showSectionAddIcon = true;
          this.canDeactivateForm = true;
          this.buttonVisible = true;
          if (pageName !== undefined && pageName !== null && pageName !== '') {
            this.form.get('pageName').setErrors(null);
            this.form.get('pageName').updateValueAndValidity();
          }
        }
      });
    }
    if (this.page.sections.length === 0 && pageName !== undefined && pageName !== null && pageName !== '') {
      const section = new Section();
      section.primaryKey = 'uuid';
      this.page.sections.push(section);
      if (this.yoroflowVO && (this.yoroflowVO.publicForm || this.yoroflowVO.isPublicform)) {
        this.addSectionInternally();
        this.isButon = true;
        this.page.sections.push(this.section);
      }
    }
  }

  focusOutForDesc(event) {
    if (event) {
      this.submitEnable = true;
    }
  }

  /* addRow(section: number, row: number) {
     this.page.sections[section].rows.push(new Row());
     const dymanicRow = new Row();
     dymanicRow.row = row + 1;
     const bottomSheetRef = this.rightSheet.open(ColumnComponent, {
       disableClose: true,
       data: dymanicRow
     });
     bottomSheetRef.instance.onAdd.subscribe((data) => {
       let noOfColumns;
       noOfColumns = data.totalColumns;
       this.page.sections[section].rows[row] = data;
       this.page.sections[section].rows[row].columns = [];
       for (let k = 0; k < noOfColumns; k++) {
         this.page.sections[section].rows[row].columns.push(new FieldConfig());
       }
       // this.page.sections[section].rows.push(new Row());
       this.fieldWidth = [];
     });
   }

   updateRow(section: number, row: Row) {
     const prevoiusColumn = row.totalColumns;
     let noOfColumns;
     const bottomSheetRef = this.rightSheet.open(ColumnComponent, {
       disableClose: true,
       data: row
     });
     bottomSheetRef.instance.onAdd.subscribe((data) => {
       // data.row - index
       this.page.sections[section].rows[data.row].rowWidth = data.rowWidth;
       this.page.sections[section].rows[data.row].totalColumns = data.totalColumns;
       this.page.sections[section].rows[data.row].layoutDirection = data.layoutDirection;
       this.page.sections[section].rows[data.row].layoutResponsiveDirection = data.layoutResponsiveDirection;
       this.page.sections[section].rows[data.row].layoutGap = data.layoutGap;

       const updatedColumn = data.totalColumns;
       if (prevoiusColumn < updatedColumn) {
         noOfColumns = data.totalColumns;
         for (let i = 0; i < updatedColumn - prevoiusColumn; i++) {
           this.page.sections[section].rows[data.row].columns.push(new FieldConfig());
         }
       } else {
         const remainingColumn = prevoiusColumn - updatedColumn;
         for (let i = 0; i < remainingColumn; i++) {
           this.page.sections[section].rows[data.row].columns.pop();
         }
       }
     });
   }

   addRowInSection(section: number, nestedSection: number, row: number) {
     const dymanicRow = new Row();
     dymanicRow.row = row + 1;
     const bottomSheetRef = this.rightSheet.open(ColumnComponent, {
       disableClose: true,
       data: dymanicRow
     });

     bottomSheetRef.instance.onAdd.subscribe((data) => {
       let noOfColumns;
       noOfColumns = data.totalColumns;
       this.page.sections[section].sections[nestedSection].rows[row] = data;
       this.page.sections[section].sections[nestedSection].rows[row].columns = [];
       for (let k = 0; k < noOfColumns; k++) {
         this.page.sections[section].sections[nestedSection].rows[row].columns.push(new FieldConfig());
       }
       this.page.sections[section].sections[nestedSection].rows.push(new Row());
     });
   }

   updateRowInSection(section: number, nestedSection: number, row: Row) {
     const prevoiusColumn = row.totalColumns;
     const bottomSheetRef = this.rightSheet.open(ColumnComponent, {
       disableClose: true,
       data: row
     });

     bottomSheetRef.instance.onAdd.subscribe((data) => {
       // data.row - index
       this.page.sections[section].sections[nestedSection].rows[data.row].rowWidth = data.rowWidth;
       this.page.sections[section].sections[nestedSection].rows[data.row].totalColumns = data.totalColumns;
       this.page.sections[section].sections[nestedSection].rows[data.row].layoutDirection = data.layoutDirection;
       this.page.sections[section].sections[nestedSection].rows[data.row].layoutResponsiveDirection = data.layoutResponsiveDirection;
       this.page.sections[section].sections[nestedSection].rows[data.row].layoutGap = data.layoutGap;
       const updatedColumn = data.totalColumns;
       if (prevoiusColumn < updatedColumn) {
         for (let i = 0; i < updatedColumn - prevoiusColumn; i++) {
           this.page.sections[section].sections[nestedSection].rows[data.row].columns.push(new FieldConfig());
         }
       } else {
         const remainingColumn = prevoiusColumn - updatedColumn;
         for (let i = 0; i < remainingColumn; i++) {
           this.page.sections[section].sections[nestedSection].rows[data.row].columns.pop();
         }
       }
     });
   }

   nestedSubSectionAdd(section: Section) {
    if (section.sections === undefined || section.sections === null) {
      section.sections = [];
      section.sections.push(new Section());
    } else {
      section.sections.push(new Section());
    }
    const sectionObj = new Section();
    const bottomSheetRef = this.rightSheet.open(NestedSectionComponent, {
      disableClose: true,
      data: { 'sectionObj': sectionObj, 'pageDetails': section, 'page': this.page, nestedSection: 1 }
    });
    bottomSheetRef.instance.onAdd.subscribe((data) => {
      if (data === 'cancel') {
        section.sections.pop();
      } else {
        const sectionsLength = section.sections.length - 1;
        section.sections[sectionsLength] = data;
        section.sections[sectionsLength].rows = [];
        section.sections[sectionsLength].rows.push(new Row());
      }
    });
  }



  nestedSubSectionUpdate(nestedSubSection: Section, parentSection: Section) {
    const rowsDetails = nestedSubSection.rows;
    const bottomSheetRef = this.rightSheet.open(NestedSectionComponent, {
      disableClose: true,
      data: { 'sectionObj': nestedSubSection, 'pageDetails': parentSection, 'page': this.page, nestedSection: true }
    });
    bottomSheetRef.instance.onAdd.subscribe((data) => {
      if (data !== 'cancel') {
        //this.page.sections[section].sections[nestedSection] = data;
        //this.page.sections[section].sections[nestedSection].rows = rowsDetails;
        nestedSubSection = data;
        //  section.rows = rowsDetails;
      }

    });
  }

   moveUp(section: number, rowIndex: number) {
    this.canDeactivateForm = true;
    const rowLength = this.page.sections[section].rows.length;
    if (rowLength > 1) {
      for (let i = 0; i < rowIndex; i++) {
        const temp = this.page.sections[section].rows[rowIndex];
        this.page.sections[section].rows[rowIndex] = this.page.sections[section].rows[rowIndex - 1];
        this.page.sections[section].rows[rowIndex - 1] = temp;
      }
    }
  }
 */

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
      // if(this.urlData){
      //   this.form.valueChanges.subscribe(data =>{
      //     this.canDeactivate()
      //   })
      // }
    });
    return this.urlData;
  }

  openSecurity(section: Section, sectionIndex: number) {
    if (section.security === null) {
      section.security = new Security();
    }
    const dialogRef = this.dialog.open(SectionSecurityComponent, {
      width: '750px',
      data: section
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data.security) {
        this.page.sections[sectionIndex].security = data.security;
        this.form.markAsDirty();
        this.enableSubmit = true;
      }
    });
  }

  closeMenu() {
    this.openSidenav = false;
    this.open = false;
  }

  openMenu() {
    this.openSidenav = true;
    this.open = true;
  }

  ngAfterViewInit() {
    const subscribeElement = Observable.interval(1000)
      .subscribe((val) => {
        if (this.myIdentifier && this.myIdentifier.nativeElement
          && this.myIdentifier.nativeElement.offsetWidth
          && this.myIdentifier.nativeElement.offsetWidth !== undefined) {
          this.width = this.myIdentifier.nativeElement.offsetWidth;
          this.height = this.myIdentifier.nativeElement.offsetHeight;
        }
      });
  }

  setRowDropElementWidth() {
    this.page.sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          row.totalColumnsWidth = row.totalColumnsWidth + column.field.fieldWidth;
        });
      });
    });
  }

  onResizeEnd(event: ResizeEvent, section: Section, row: Row, column: FieldConfig, k, sectionIndex: number, rowIndex: number, nestedSectionIndex: any): void {
    this.style = {
      width: `${event.rectangle.width}px`,
    };
    const totalWidth = (+this.width) - (row.layoutGap * (row.columns.length - 1));
    let rowWidth = 0;
    let count = 0;
    var width = `${event.rectangle.width}`
    var widthPercentage = Math.round(((+width * +row.rowWidth) / (totalWidth)));
    var remainingFieldsWidth;
    column.field.fieldWidth = widthPercentage;
    for (let i = 0; i < row.columns.length; i++) {
      if (i <= k) {
        rowWidth = rowWidth + row.columns[i].field.fieldWidth;
      }
      if (i > k) {
        if (count === 0) {
          remainingFieldsWidth = Math.floor((row.rowWidth - rowWidth) / (row.columns.length - i));
          count++;
          this.submitEnable = true;
        }
        row.columns[i].field.fieldWidth = remainingFieldsWidth;
      }
    }
    row.totalColumnsWidth = 0;
    row.columns.forEach(columns => {
      row.totalColumnsWidth = row.totalColumnsWidth + columns.field.fieldWidth;
    });
    if (nestedSectionIndex === 'l') {
      this.page.sections[sectionIndex].rows[rowIndex] = row;
    } else {
      this.page.sections[sectionIndex].sections[nestedSectionIndex].rows[rowIndex] = row;
    }
  }

  swapRow(event, i, section) {
    let columns = JSON.parse(JSON.stringify(section.rows));
    const rowLength = section.rows.length;
    const currentIndex = event.currentIndex;
    const previousIndex = event.previousIndex;
    let currentIndexColumn = section.rows[previousIndex];
    columns = JSON.parse(JSON.stringify(section.rows));
    if (previousIndex > currentIndex) {
      for (let i = 0; i < previousIndex + 1; i++) {
        if (i > currentIndex) {
          section.rows[i] = columns[i - 1];
        } else if (i === currentIndex) {
          section.rows[i] = currentIndexColumn;
        }
      }
    } else {
      for (let i = currentIndex; i >= previousIndex; i--) {
        if (i < currentIndex) {
          section.rows[i] = columns[i + 1];
        } else if (i === currentIndex) {
          section.rows[i] = currentIndexColumn;
        }
      }
    }
  }

  disallowDrag(rowIndex, sectionIndex, value, section, nestedSectionIndex, columnIndex, row) {
    if (value === 'section') {
      this.dragIndexNested = ''
      this.dragIndexNestedSection = ''
      this.dragRowIndex = rowIndex;
      this.dragColumnIndex = columnIndex;
      this.dragSectionIndex = sectionIndex;
      this.dragRow = row;

    } else if (value === 'nested') {
      this.dragRowIndex = rowIndex;
      this.dragSectionIndex = sectionIndex
      this.dragIndexNested = rowIndex;
      this.dragColumnIndex = columnIndex;
      this.dragIndexNestedSection = nestedSectionIndex;
    }
  }

  connectedToListRows() {
    if (this.selectedNestedSection >= 0 && this.dragIndexNestedSection === '') {
      //section to nested
      this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows[this.selectedRow].columns.push(
        this.page.sections[this.dragSectionIndex].rows[this.dragRowIndex].columns[this.dragColumnIndex])
      this.page.sections[this.dragSectionIndex].rows[this.dragRowIndex].columns.splice(this.dragColumnIndex, 1)
    } else if ((this.selectedNestedSection === undefined || this.selectedNestedSection === 0) && this.dragIndexNestedSection === '') {
      //section to section
      this.page.sections[this.selectedSection].rows[this.selectedRow].columns.push(
        this.page.sections[this.dragSectionIndex].rows[this.dragRowIndex].columns[this.dragColumnIndex])
      this.page.sections[this.dragSectionIndex].rows[this.dragRowIndex].columns.splice(this.dragColumnIndex, 1);
      if (this.dragRow.columns.length === 0) {
        this.page.sections[this.dragSectionIndex].rows.splice(this.dragRowIndex, 1)
      }
    }
    else if (this.selectedNestedSection === 0 && this.dragIndexNestedSection !== '') {
      // nested to section
      this.page.sections[this.selectedSection].rows[this.selectedRow].columns.push(
        this.page.sections[this.dragSectionIndex].sections[this.selectedNestedSection].rows[this.dragRowIndex].columns[this.dragColumnIndex])
      this.page.sections[this.dragSectionIndex].sections[this.selectedNestedSection].rows[this.dragRowIndex].columns.splice(this.dragColumnIndex, 1)
    }
    else if (this.selectedNestedSection !== 0 && this.selectedNestedSection !== undefined && this.dragIndexNestedSection !== '') {
      // nested to nested
      this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows[this.selectedRow].columns.push(
        this.page.sections[this.dragSectionIndex].sections[this.dragIndexNestedSection].rows[this.dragRowIndex].columns[this.dragColumnIndex])
      this.page.sections[this.dragSectionIndex].sections[this.dragIndexNestedSection].rows[this.dragRowIndex].columns.splice(this.dragColumnIndex, 1)

    }
    this.submitEnable = true;
  }


  dropped(event, i, j, section, value: boolean, row, column) {
    const droppedSectionIndex = this.page.sections.findIndex(x => x === section)
    this.selectedColumn = this.page.sections[i].rows[j].columns.length;
    this.selectedRow = j;
    this.selectedSection = i;
    this.isNestedSection = false;
    if (event.previousContainer.data && event.previousContainer.data[event.previousIndex].img) {
      const rowLength = row.columns.length;
      const column = new FieldConfig();
      column.field.fieldWidth = 30;
      column.controlType = event.previousContainer.data[event.previousIndex].img;
      column.field.rowBackground = '#ffffff';
      let columns = JSON.parse(JSON.stringify(row.columns));
      const currentIndex = event.currentIndex;
      this.selectedColumn = currentIndex;
      columns = JSON.parse(JSON.stringify(row.columns));
      for (let i = 0; i < rowLength + 1; i++) {
        if (i > currentIndex) {
          row.columns[i] = columns[i - 1];
        } else if (i === currentIndex) {
          row.columns[i] = column;
        }
      }
      // row.columns.push(column);
      this.column = column;
      if (column.controlType === 'input' || column.controlType === 'select') {
        this.form.get('fieldType').setValue(column.controlType);
        // this.input.openMenu();
      }
      if (row.columns.length > 3) {
        const width = row.rowWidth / row.columns.length;
        for (let i = 0; i < row.columns.length + 1; i++) {
          row.columns[i].field.fieldWidth = width;
        }
      }
      if (column.controlType === 'grid') {
        this.createGridControlForExistingRow(section, i, 'section');
      } else if (column.controlType === 'shoppingcart') {
        this.createCartConfigForExistingRow(section, i, column, 'section');
      }
      if (this.column.controlType !== 'divider'
        && this.column.controlType !== 'grid'
        && this.column.controlType !== 'shoppingcart') {
        this.fieldSettings = false;
        this.pagesettings = false;
        this.sectionSettings = false;
        this.controlsShow = false;
        this.nestedSectionSettings = false;
        this.rowSettings = false;
        this.setData('section');
        // this.getColumnBox(this.column);
      }

    } else {
      if (this.dragRowIndex === j && droppedSectionIndex === this.dragSectionIndex) {
        let columns = JSON.parse(JSON.stringify(row.columns));
        const rowLength = row.columns.length;
        const currentIndex = event.currentIndex;
        const previousIndex = event.previousIndex;
        let currentIndexColumn = row.columns[previousIndex];
        columns = JSON.parse(JSON.stringify(row.columns));
        if (previousIndex > currentIndex) {
          for (let i = 0; i < previousIndex + 1; i++) {
            if (i > currentIndex) {
              row.columns[i] = columns[i - 1];
            } else if (i === currentIndex) {
              row.columns[i] = currentIndexColumn;
            }
          }
        } else {
          for (let i = currentIndex; i >= previousIndex; i--) {
            if (i < currentIndex) {
              row.columns[i] = columns[i + 1];
            } else if (i === currentIndex) {
              row.columns[i] = currentIndexColumn;
            }

          }
        }
        this.column = currentIndexColumn;
        this.submitEnable = true;

        if (this.column.controlType !== 'divider'
          && this.column.controlType !== 'grid'
          && this.column.controlType !== 'shoppingcart') {
          this.fieldSettings = false;
          this.pagesettings = false;
          this.sectionSettings = false;
          this.controlsShow = false;
          this.nestedSectionSettings = false;
          this.rowSettings = false;
          this.setData('section');
          // this.getColumnBox(this.column);
        }
      }
      else {
        this.connectedToListRows();
      }
    }

  }

  droppedNestedSection(event, i, l, m, nestedSection, row) {
    const droppedNestedSectionIndex = this.page.sections[i].sections.findIndex(x => x === nestedSection)
    this.selectedColumn = this.page.sections[i].sections[l].rows[m].columns.length;
    this.selectedRow = m;
    this.selectedSection = i;
    this.selectedNestedSection = l;
    this.isNestedSection = true;
    if (event.previousContainer.data && event.previousContainer.data[event.previousIndex].img) {
      const rowLength = row.columns.length;
      const column = new FieldConfig();
      column.field.fieldWidth = 30;
      column.controlType = event.previousContainer.data[event.previousIndex].img;
      column.field.rowBackground = '#ffffff';
      let columns = JSON.parse(JSON.stringify(row.columns));
      const currentIndex = event.currentIndex;
      this.selectedColumn = currentIndex;
      columns = JSON.parse(JSON.stringify(row.columns));
      for (let i = 0; i < rowLength + 1; i++) {
        if (i > currentIndex) {
          row.columns[i] = columns[i - 1];
        } else if (i === currentIndex) {
          row.columns[i] = column;
        }
      }
      // row.columns.push(column);
      if (column.controlType === 'input' || column.controlType === 'select') {
        this.form.get('fieldType').setValue(column.controlType);
        // this.input.openMenu();
      }
      if (row.columns.length > 3) {
        const width = row.rowWidth / row.columns.length;
        for (let i = 0; i < row.columns.length + 1; i++) {
          row.columns[i].field.fieldWidth = width;
        }
      }
      this.column = column;
      if (column.controlType === 'grid') {
        this.createGridControlForExistingRow(nestedSection, i, 'nestedSection');
      } else if (column.controlType === 'shoppingcart') {
        this.createCartConfigForExistingRow(nestedSection, i, column, 'nestedSection');
      }
      if (this.column.controlType !== 'divider'
        && this.column.controlType !== 'grid'
        && this.column.controlType !== 'shoppingcart') {
        this.fieldSettings = false;
        this.pagesettings = false;
        this.sectionSettings = false;
        this.controlsShow = false;
        this.rowSettings = false;
        this.setData('nestedSection');
        // this.getColumnBox(this.column);
      }
    } else {
      if (this.selectedSection === this.dragSectionIndex && this.dragIndexNested === m && droppedNestedSectionIndex === this.dragIndexNestedSection) {
        let columns = JSON.parse(JSON.stringify(row.columns));
        const rowLength = row.columns.length;
        const currentIndex = event.currentIndex;
        const previousIndex = event.previousIndex;
        let currentIndexColumn = row.columns[previousIndex];
        columns = JSON.parse(JSON.stringify(row.columns));
        if (previousIndex > currentIndex) {
          for (let i = 0; i < previousIndex + 1; i++) {
            if (i > currentIndex) {
              row.columns[i] = columns[i - 1];
            } else if (i === currentIndex) {
              row.columns[i] = currentIndexColumn;
            }
          }
        } else {
          for (let i = currentIndex; i >= previousIndex; i--) {
            if (i < currentIndex) {
              row.columns[i] = columns[i + 1];
            } else if (i === currentIndex) {
              row.columns[i] = currentIndexColumn;
            }
          }
        }

        this.column = currentIndexColumn;
        if (this.column.controlType !== 'divider'
          && this.column.controlType !== 'grid'
          && this.column.controlType !== 'shoppingcart') {
          this.fieldSettings = false;
          this.pagesettings = false;
          this.sectionSettings = false;
          this.controlsShow = false;
          this.rowSettings = false;
          this.setData('nestedSection');
          // this.getColumnBox(this.column);
        }
      } else {
        this.connectedToListRows()
      }
    }

  }

  onRightClickColumn(event, column, i, j, k) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': column };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
    this.column = column;
    this.selectedColumn = k;
    this.selectedRow = j;
    this.selectedSection = i;
    this.nestedSection = false;
  }

  onRightClickNestedSectionColumn(event, column, i, l, m, n) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': column };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.column = column;
    this.selectedColumn = n;
    this.selectedRow = m;
    this.selectedSection = i;
    this.selectedNestedSection = l;
    this.nestedSection = true;
  }

  delete() {
    if (this.nestedSection === true) {
      this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows[this.selectedRow].columns.splice(this.selectedColumn, 1);
      if (this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows[this.selectedRow].columns.length === 0) {
        this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows.splice(this.selectedRow, 1);
      }
    } else {
      this.page.sections[this.selectedSection].rows[this.selectedRow].columns.splice(this.selectedColumn, 1);
      if (this.page.sections[this.selectedSection].rows[this.selectedRow].columns.length === 0) {
        this.page.sections[this.selectedSection].rows.splice(this.selectedRow, 1);
      }
    }
    this.fieldSettings = false;
    this.controlsShow = true;
    this.submitEnable = true;
  }

  getColumn(column: FieldConfig, i, j, k) {
    // this.input.closeMenu();
    // let allowEmit = true;
    // if (i === this.selectedSection && j === this.selectedRow && k === this.selectedColumn) {
    //   allowEmit = false;
    // }
    // if (allowEmit === true) {
    if (column.controlType !== 'divider') {
      this.fieldSettings = false;
      this.pagesettings = false;
      this.sectionSettings = false;
      this.controlsShow = false;
      this.column = column;
      this.selectedColumn = k;
      this.selectedRow = j;
      this.selectedSection = i;
      this.isNestedSection = false;
      this.nestedSectionSettings = false;
      this.rowSettings = false;
      this.setData('section');
      this.getColumnBox(column);
    }
    // }
  }

  getColumnForNestedSection(column: FieldConfig, i, l, m, n) {
    // this.input.closeMenu();
    let allowEmit = true;
    // if (i === this.selectedSection && m === this.selectedRow && n === this.selectedColumn && l === this.selectedNestedSection) {
    //   allowEmit = false;
    // }
    // if (allowEmit === true) {
    if (column.controlType !== 'divider') {
      this.fieldSettings = false;
      this.pagesettings = false;
      this.sectionSettings = false;
      this.controlsShow = false;
      this.column = column;
      this.selectedColumn = n;
      this.selectedRow = m;
      this.selectedSection = i;
      this.selectedNestedSection = l;
      this.isNestedSection = true;
      this.nestedSectionSettings = false;
      this.rowSettings = false;
      this.setData('nestedSection');
      this.getColumnBox(column);
    }
    // }
  }

  createNewSection(i) {
    const newSection = new Section();
    newSection.primaryKey = 'uuid';
    this.page.sections.push(newSection);
  }

  selectedNewSection(section: Section) {
    this.sectionSettings = true;
    this.pagesettings = false;
    this.fieldSettings = false;
    this.rowSettings = false;
    let fieldName: any;
    this.page.sections.forEach(mainSection => {
      mainSection.rows.forEach(row => {
        row.columns.forEach(column => {
          const fieldNameArr = new FieldName();
          fieldNameArr.label = column.field.label.labelName;
          fieldNameArr.name = column.field.name;
          if (column.controlType === 'date') {
            fieldName.push(fieldNameArr);
          }
        });
      });
    });
    let data = [section, this.page, fieldName];
    this.newSectionData = data;
    this.sectionData.emit(data);
    this.selectedSection = this.page.sections.length;
  }

  createNewRowForNestedSection(event, i, l, nestedSection: Section, m) {
    const column = new FieldConfig();
    const row = new Row();
    if (event.previousContainer.data) {
      column.field.fieldWidth = 30;
      column.controlType = event.previousContainer.data[event.previousIndex].img;
      column.field.rowBackground = '#ffffff';
      row.columns.push(column);
      this.column = column;
      this.page.sections[i].sections[l].rows.push(row);
      this.sectionSettings = false;
      this.pagesettings = false;
      this.rowSettings = false;
      this.selectedColumn = 0;
      this.selectedRow = this.page.sections[i].sections[l].rows.length - 1;
      this.selectedSection = i;
      this.selectedNestedSection = l;
      this.isNestedSection = true;
      if (column.controlType === 'input' || column.controlType === 'select') {
        this.form.get('fieldType').setValue(column.controlType);
        // if (this.input) {
        //   this.input.openMenu();
        // }
      }
      if (column.controlType === 'grid') {
        this.createGridControl(this.column, nestedSection, this.selectedSection, this.selectedRow, this.selectedColumn, 'nestedSection')
      } else if (column.controlType === 'shoppingcart') {
        this.createCartConfigForNewRow(nestedSection, this.selectedSection, this.column, 'nestedSection');
      } else {
        this.setData('nestedSection');
        this.getColumnBox(column);
      }
    }
    else {
      column.field.rowBackground = '#ffffff';
      this.column = column;
      this.page.sections[i].sections[l].rows.push(row);

      if (m === undefined) {
        m = 0;
      }
      this.droppedNestedSection(event, i, l, m, nestedSection, row)
    }
  }

  createNewSubSection(i) {
    const newSection = new Section();
    newSection.primaryKey = 'uuid';
    const boolean: boolean = true;
    let data = { sectionObj: newSection, pageDetails: this.page.sections[i], page: this.page, boolean };
    this.newNestedSectionData = data;
    this.nestedSectionData.emit(data);
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.rowSettings = false;
    this.selectedSection = i;
    this.selectedNestedSectionindex = true;
    // if (this.page.sections[i].sections === null) {
    //   this.page.sections[i].sections = [];
    //   this.page.sections[i].sections.push(newSection);
    // } else {
    //   this.page.sections[i].sections.push(newSection);
    // }
    this.openNestedSectionSettingsDialog();
  }

  deleteSection(index: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: 'remove-section'
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        this.page.sections.splice(index, 1);
        this.submitEnable = true;
      }
    });
  }

  deleteNestedSection(i, l) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: 'remove-section'
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        this.page.sections[i].sections.splice(l, 1);
        this.submitEnable = true;
      }
    });
  }

  openNestedSectionSettings(i, l, subSection: Section, section: Section, nestedSection: boolean) {
    section.tableName = this.page.pageId;
    if (!section.name) {
      section.name = '';
    }
    if (!subSection.name) {
      subSection.name = '';
    }
    if (!subSection.parentTable) {
      subSection.parentTable = '';
    }
    let data = { sectionObj: subSection, pageDetails: section, page: this.page, nestedSection };
    this.newNestedSectionData = data;
    this.nestedSectionData.emit(data);
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.rowSettings = false;
    this.selectedSection = i;
    this.selectedNestedSectionindex = l;
    this.openNestedSectionSettingsDialog();
  }

  openNestedSectionSettingsDialog() {
    const dialog = this.dialog.open(NestedSectionComponent, {
      disableClose: true,
      width: '50%',
      height: '50%',
      data: this.newNestedSectionData
    });

    dialog.afterClosed().subscribe(data => {
      if (data !== undefined) {
        if (this.selectedNestedSectionindex === true) {
          if (this.page.sections[this.selectedSection].sections === null) {
            this.page.sections[this.selectedSection].sections = [];
          }
          this.page.sections[this.selectedSection].sections.push(data);
        } else {
          this.page.sections[this.selectedSection].sections[this.selectedNestedSectionindex] = data;
        }
        this.submitEnable = true;
      }

      if (data === true) {
        this.deleteSelectedNestedSection(true);
        this.submitEnable = true;
      }
    });

  }

  openSectionSettings(i, section) {
    // if (i !== this.selectedSection) {
    let data = [section, this.page];
    this.newSectionData = data;
    this.sectionData.emit(data);
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.selectedSection = i;
    this.rowSettings = false;
    // }
    this.openSectionSettingsDialog();
  }

  openSectionSettingsDialog() {
    const dialog = this.dialog.open(SectionComponent, {
      disableClose: true,
      width: '50%',
      height: '50%',
      data: this.newSectionData
    });

    dialog.afterClosed().subscribe(data => {
      if (data !== undefined) {
        this.page.sections[this.selectedSection] = data;
        this.submitEnable = true;
      }

      if (data === true) {
        // this.deleteSection(this.selectedSection);
        // this.submitEnable = true;
      }
    });
  }

  openPageSettings() {
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.rowSettings = false;
    this.openPageSettingsDialog();
  }

  openPageSettingsDialog() {
    const dialogRef = this.dialog.open(PageSettingsComponent, {
      disableClose: true,
      width: '40%',
      height: '40%',
      data: this.page
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.page = data;
        this.submitEnable = true;
      }
    });
  }

  onClickDragHandle(i, column, row) {
    this.column = column;
    this.row = row;
    this.selectedColumn = i;
  }

  createCartConfigForNewRow(section, i, column, value) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: 'cart-config'
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        const bottomSheetRef = this.rightSheet.open(ShoppingCardStepNameComponent, {
          width: '1350px',
          disableClose: true,
          data: [column],
          panelClass: 'grid-right-sheet-container'
        });
        bottomSheetRef.instance.onAdd.subscribe((shoppingData: any) => {
          if (shoppingData === false) {
            // this.getDeleteColumn({ checked: true });
          } else {
            if (value === 'section') {
              section.rows[this.page.sections[i].rows.length - 1].columns[0] = shoppingData;
            } else {
              section.rows[this.page.sections[i].sections[this.selectedNestedSection].rows.length - 1].columns[0] = shoppingData;
            }
            this.submitEnable = true;
          }
        });
      } else {
        this.setData(value);
      }
    });
  }

  createCartConfigForExistingRow(section, i, column, value) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: 'cart-config'
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        const bottomSheetRef = this.rightSheet.open(ShoppingCardStepNameComponent, {
          width: '1350px',
          disableClose: true,
          data: [column],
          panelClass: 'grid-right-sheet-container'
        });
        bottomSheetRef.instance.onAdd.subscribe((shoppingData: any) => {
          if (shoppingData === false) {
            // this.getDeleteColumn({ checked: true });
          } else {
            if (value === 'section') {
              section.rows[this.page.sections[i].rows.length - 1].columns[this.selectedColumn] = shoppingData;
            } else {
              section.rows[this.page.sections[i].sections[this.selectedNestedSection].rows.length - 1].columns[this.selectedColumn] = shoppingData;
            }
            this.submitEnable = true;
          }
        });
      } else {
        this.setData(value);
      }
    });
  }

  createGridControlForExistingRow(section, i, value) {
    if (this.page.yorosisPageId) {
      const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '250px',
        data: 'grid-config'
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data === true) {
          const bottomSheetRef = this.rightSheet.open(PageGridConfigurationComponent, {
            width: '1250px',
            disableClose: true,
            data: { pageId: this.pageIdentifier, appId: this.form.get('applicationId').value, version: this.page.version },
            panelClass: 'grid-right-sheet-container'
          });
          bottomSheetRef.instance.onAdd.subscribe((gridData: any) => {
            if (gridData === false) {
              // section.rows[this.page.sections[i].rows.length - 1].columns[0].controlType = '';
              // this.fieldWidth[0] = '';
              // this.formControlName.push(null);
              // this.getDeleteColumn({ checked: true });
            } else {
              this.enableSubmit = true;
              this.isChanged.emit(true);
              if (value === 'section') {
                section.rows[this.page.sections[i].rows.length - 1].columns[this.selectedColumn].field.control = new Grid();
                section.rows[this.page.sections[i].rows.length - 1].columns[this.selectedColumn].field.control.gridId = gridData;
                section.rows[this.page.sections[i].rows.length - 1].columns[this.selectedColumn].field.control.targetPageId = this.page.yorosisPageId;
              } else {
                section.rows[this.page.sections[i].sections[this.selectedNestedSection].rows.length - 1].columns[this.selectedColumn].field.control = new Grid();
                section.rows[this.page.sections[i].sections[this.selectedNestedSection].rows.length - 1].columns[this.selectedColumn].field.control.gridId = gridData;
                section.rows[this.page.sections[i].sections[this.selectedNestedSection].rows.length - 1].columns[this.selectedColumn].field.control.targetPageId = this.page.yorosisPageId;
              }
              this.fieldWidth[0] = 100;
              this.formControlName.push(gridData);
              this.submitEnable = true;
            }
          });
        } else {
          this.setData(value);
        }
      });
    } else {
      this.setData(value);
    }
  }

  createGridControl(column, section, i, j, k, value) {
    if (this.page.yorosisPageId) {
      const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
        width: '250px',
        data: 'grid-config'
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data === true) {
          const bottomSheetRef = this.rightSheet.open(PageGridConfigurationComponent, {
            width: '1250px',
            disableClose: true,
            data: { pageId: this.pageIdentifier, appId: this.form.get('applicationId').value, version: this.page.version },
            panelClass: 'grid-right-sheet-container'
          });
          bottomSheetRef.instance.onAdd.subscribe((gridData: any) => {
            if (gridData === false) {
              // section.rows[this.page.sections[i].rows.length - 1].columns[0].controlType = '';
              // this.fieldWidth[0] = '';
              // this.formControlName.push(null);
              // this.getDeleteColumn({ checked: true });
            } else {
              this.enableSubmit = true;
              this.isChanged.emit(true);
              if (value === 'section') {
                section.rows[this.page.sections[i].rows.length - 1].columns[0].field.control = new Grid();
                section.rows[this.page.sections[i].rows.length - 1].columns[0].field.control.gridId = gridData;
                section.rows[this.page.sections[i].rows.length - 1].columns[0].field.control.targetPageId = this.page.yorosisPageId;
              } else {
                section.rows[this.page.sections[i].sections[this.selectedNestedSection].rows.length - 1].columns[0].field.control = new Grid();
                section.rows[this.page.sections[i].sections[this.selectedNestedSection].rows.length - 1].columns[0].field.control.gridId = gridData;
                section.rows[this.page.sections[i].sections[this.selectedNestedSection].rows.length - 1].columns[0].field.control.targetPageId = this.page.yorosisPageId;
              }
              this.fieldWidth[0] = 100;
              this.formControlName.push(gridData);
              this.submitEnable = true;
            }
          });
        } else {
          this.setData(value);
        }
      });
    } else {
      this.setData(value);
    }
  }

  createNewRow(event: any, i: number, section: Section, j) {
    const column = new FieldConfig();
    const row = new Row();
    column.field.fieldWidth = 30;
    if (event.previousContainer.data) {
      column.controlType = event.previousContainer.data[event.previousIndex].img;
      if (column.controlType === 'signaturecontrol' && this.isSignatureAllowed === false) {
        const dialog = this.dialog.open(AlertmessageComponent, {
          width: '450px',
          data: { message: "Your current plan doesn't support to access this control, Please upgrade your plan" }
        });
      } else {
        column.field.rowBackground = '#ffffff';
        row.columns.push(column);
        this.column = column;
        section.rows.push(row);
        this.column = column;
        this.sectionSettings = false;
        this.pagesettings = false;
        this.rowSettings = false;
        this.selectedColumn = 0;
        this.selectedRow = this.page.sections[i].rows.length - 1;
        this.selectedSection = i;
        this.isNestedSection = false;
        if (column.controlType === 'input' || column.controlType === 'select') {
          this.form.get('fieldType').setValue(column.controlType);
          // if (this.input) {
          //   this.input.openMenu();
          // }
        }
        if (column.controlType === 'grid') {
          this.createGridControl(this.column, section, this.selectedSection, this.selectedRow, this.selectedColumn, 'section')
        } else if (column.controlType === 'shoppingcart') {
          this.createCartConfigForNewRow(section, this.selectedSection, this.column, 'section');
        } else {
          this.setData('section');
          this.getColumnBox(column);
        }
      }
    } else {
      column.field.rowBackground = '#ffffff';
      this.column = column;
      section.rows.push(row);
      if (j === undefined) {
        j = 0;
      }
      this.dropped(event, i, j, section, true, section.rows, 'column')

    }
  }

  setData(value: string) {
    if (this.column.controlType !== 'divider') {
      let isMainSection: boolean;
      // let formControlName: string[] = [];
      // let fieldName: any[] = [];
      // let formControlNamePasswordField: any[] = [];
      // let dateFieldName: any[] = [];
      // let numberField: any[] = [];
      // let isLoadForm: boolean;
      // let workflowForm = false;
      // let workflowName: any;
      // let workflowKey: any;
      this.formControlName = [];
      this.formControlNamePasswordField = [];
      this.fieldName = [];
      this.numberField = [];
      this.dateFieldName = [];
      this.page.sections.forEach(mainSection => {
        if (value === 'section') {
          isMainSection = true;
          this.isNestedSection = false;
          mainSection.rows.forEach(row => {
            row.columns.forEach(column => {
              if (column.field.name !== undefined
                && column.field.name !== null
                && column.field.name !== '') {
                this.formControlName.push(column.field.name);
              }
              const fieldNameArr = new FieldName();
              fieldNameArr.label = column.field.label.labelName;
              fieldNameArr.name = column.field.name;
              if (column.controlType === 'date') {
                this.fieldName.push(fieldNameArr);
              }
              if (column.controlType === 'password' && column.field.control.isConfirmPassword === false) {
                this.formControlNamePasswordField.push(fieldNameArr);
              }
              if (column.controlType === 'date') {
                this.dateFieldName.push(fieldNameArr);
              }
              if (column.controlType === 'input' && column.field.dataType !== 'string') {
                this.numberField.push(fieldNameArr);
              }
            });
          });
        }
        else {
          isMainSection = false;
          mainSection.sections.forEach(nestedSection => {
            nestedSection.rows.forEach(row => {
              row.columns.forEach(column => {
                if (column.field.name !== undefined
                  && column.field.name !== null
                  && column.field.name !== '') {
                  this.formControlName.push(column.field.name);
                }
                const fieldNameArr = new FieldName();
                fieldNameArr.label = column.field.label.labelName;
                fieldNameArr.name = column.field.name;
                if (column.controlType === 'date') {
                  this.fieldName.push(fieldNameArr);
                }
                if (column.controlType === 'password' && column.field.control.isConfirmPassword === false) {
                  this.formControlNamePasswordField.push(fieldNameArr);
                }
                if (column.controlType === 'date') {
                  this.dateFieldName.push(fieldNameArr);
                }
                if (column.controlType === 'input' && column.field.dataType !== 'string') {
                  this.numberField.push(fieldNameArr);
                }
              });
            });
          });
        }
      });
      if (this.column.field.label.labelName) {
        this.isLoadForm = true;
      } else {
        this.isLoadForm = false;
      }
      let data = [
        this.column, this.formControlName, isMainSection,
        this.page.pageId, this.page.manageFlag, this.fieldName, this.page.version, this.page.layoutType,
        this.formControlNamePasswordField,
        this.dateFieldName, this.isLoadForm, this.numberField, this.page, this.workflowForm,
        this.workflowName, this.workflowKey, this.formControlNameForNestedSections
      ];
      this.data = data;
      this.columndata.emit(this.data);
      this.fieldSettings = false;
      this.controlsShow = true;
      this.openControlDialog();
    }
  }

  openControlDialog() {
    const dialog = this.dialog.open(FormfieldComponent, {
      disableClose: true,
      width: '60%',
      height: '70%',
      data: this.data
    });
    dialog.afterClosed().subscribe(data => {
      if (data !== undefined) {
        const column = new FieldConfig();
        column.controlType = data.controlType;
        column.field = data.field;
        if (this.isNestedSection === false) {
          this.page.sections[this.selectedSection].rows[this.selectedRow].columns[this.selectedColumn] = column;
        } else {
          this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows[this.selectedRow].columns[this.selectedColumn] = column;
        }
        this.submitEnable = true;
      }
    });
  }

  openPreviewForm(): void {
    const dialog = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '90%',
      height: '90%',
      data: { type: 'previewForm', data: this.page }
    });
  }

  openControls() {
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.rowSettings = false;
  }

  getSavedColumn(event) {
    const column = new FieldConfig();
    column.controlType = event.controlType;
    column.field = event.field;
    if (this.isNestedSection === false) {
      this.page.sections[this.selectedSection].rows[this.selectedRow].columns[this.selectedColumn] = column;
    } else {
      this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows[this.selectedRow].columns[this.selectedColumn] = column;
    }
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.rowSettings = false;
    this.controlsShow = true;
    this.submitEnable = true;
  }

  // getDeleteColumn(event) {
  //   if (this.isNestedSection === false) {
  //     this.page.sections[this.selectedSection].rows[this.selectedRow].columns.splice(this.selectedColumn, 1);
  //     if (this.page.sections[this.selectedSection].rows[this.selectedRow].columns.length === 0) {
  //       this.page.sections[this.selectedSection].rows.splice(this.selectedRow, 1);
  //     }
  //   } else {
  //     this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows[this.selectedRow].columns.splice(this.selectedColumn, 1);
  //     if (this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows[this.selectedRow].columns.length === 0) {
  //       this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows.splice(this.selectedRow, 1);
  //     }
  //   }
  //   this.fieldSettings = false;
  //   this.pagesettings = false;
  //   this.sectionSettings = false;
  //   this.controlsShow = true;
  //   this.nestedSectionSettings = false;
  //   this.rowSettings = false;
  //   this.submitEnable = true;
  // }

  getSavedSection(event) {
    this.page.sections[this.selectedSection] = event;
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.submitEnable = true;
    this.rowSettings = false;
  }

  deleteSelectedSection(event) {
    this.deleteSection(this.selectedSection);
    // this.page.sections.splice(this.selectedSection, 1);
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.rowSettings = false;
    this.submitEnable = true;
  }

  getSavedNestedSection(event: any): void {
    if (this.selectedNestedSectionindex === true) {
      if (this.page.sections[this.selectedSection].sections === null) {
        this.page.sections[this.selectedSection].sections = [];
      }
      this.page.sections[this.selectedSection].sections.push(event);
    } else {
      this.page.sections[this.selectedSection].sections[this.selectedNestedSectionindex] = event;
    }
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.rowSettings = false;
    this.submitEnable = true;
  }

  deleteSelectedNestedSection(event) {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: 'remove-section'
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        this.page.sections[this.selectedSection].sections.splice(this.selectedSection, 1);
        this.submitEnable = true;
        this.fieldSettings = false;
        this.pagesettings = false;
        this.sectionSettings = false;
        this.controlsShow = true;
        this.nestedSectionSettings = false;
        this.rowSettings = false;
      }
    });
  }

  genarateName() {
    this.form.get('fieldId').setValue(this.camelize(this.form.get('fieldName').value));
  }

  createColumn() {
    this.column.controlType = this.form.get('fieldType').value;
    this.page.sections[this.selectedSection].rows[this.selectedRow].columns[this.selectedColumn] = this.column;
    // this.input.closeMenu();
    this.submitEnable = true;
  }

  deleteField() {
    this.page.sections[this.selectedSection].rows[this.selectedRow].columns.splice(this.selectedColumn, 1);
    // this.input.closeMenu();
    this.submitEnable = true;
  }

  getColumnBox(column: FieldConfig) {
    this.page.sections.forEach(mainSection => {
      mainSection.rows.forEach(row => {
        row.columns.forEach(column => {
          column.isSelected = false;
        });
        if (mainSection.sections) {
          mainSection.sections.forEach(nestedSection => {
            nestedSection.rows.forEach(row => {
              row.columns.forEach(column => {
                column.isSelected = false;
              });
            });
          });
        }
      });
    });
    column.isSelected = true;
  }

  camelize(str) {
    if (str) {
      // tslint:disable-next-line: only-arrow-functions
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '').replace(/[^\w]/g, '').replace(/_/g, '');
    }
  }

  userPermissions() {
    this.page.pageName = this.form.get('pageName').value;
    let version = this.page.version;
    if (!this.page.version || this.page.version === null) {
      version = 1;
    }
    this.userPermissionData = { 'id': this.page.yorosisPageId, 'securityType': 'page', 'pageName': this.page.pageName, 'pageVersion': version };
    this.publish = true;
    this.userPermission = true;
    this.formBuilder = false;
    this.sectionSecurity = false;
  }

  openUserPermission(userForm) {
    if (!this.isWorkflow && !this.isFromWorkflow) {
      if (this.applicationsList.length === 0 && !this.yoroflowVO && !this.page.isWorkflowForm) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Create application to save page',
        });
      }
      if (this.getAccessForPageCreation() === true && userForm.valid) {
        if (this.getAccessForSubmitButton() !== true && !this.yoroflowVO && !this.page.isWorkflowForm) {
          const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
            width: '250px',
            data: { type: 'allow-submit-button-action' }
          });
          dialogRef.afterClosed().subscribe(data => {
            if (data === true) {
              this.allowSubmitbutton = true;
              this.canDeactivateForm = false;
              this.isUpdate = true;
              this.createPageForm(userForm);
            }
          });
        } else if (this.getAccessForSubmitButton() !== true && this.page.isWorkflowForm && this.page.version >= 1) {
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
            this.page.layoutType = this.form.get('layoutType').value;
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
                this.page.pageName = this.form.get('pageName').value;
                let version = this.page.version;
                if (!this.page.version || this.page.version === null) {
                  version = 1;
                }
                this.userPermissionData = { 'id': this.page.yorosisPageId, 'securityType': 'page', 'pageName': this.page.pageName, 'pageVersion': version };
                this.publish = true;
                this.userPermission = true;
                this.formBuilder = false;
                this.sectionSecurity = false;
              }
            });
          } else {
            this.page.description = this.form.get('description').value;
            this.page.applicationId = this.form.get('applicationId').value;
            this.page.applicationName = this.form.get('applicationName').value;
            this.page.layoutType = this.form.get('layoutType').value;
            if (this.page.isWorkflowForm === undefined || this.page.isWorkflowForm === null) {
              this.page.isWorkflowForm = false;
            }
            if (this.isFromWorkflow === true) {
              this.page.isWorkflowForm = this.isFromWorkflow;
            }
            this.page.pageName = this.form.get('pageName').value;
            let version = this.page.version;
            if (!this.page.version || this.page.version === null) {
              version = 1;
            }
            this.userPermissionData = { 'id': this.page.yorosisPageId, 'securityType': 'page', 'pageName': this.page.pageName, 'pageVersion': version };
            this.publish = true;
            this.userPermission = true;
            this.formBuilder = false;
            this.sectionSecurity = false;
          }
        }
        this.formControlName = [];
        this.fieldName = [];
      }
    }
  }

  getGlobalPermission(event) {
    if (event !== false) {
      this.pageSecurityVO = event;
      this.userPermission = false;
      this.formBuilder = false;
      this.sectionSecurity = true;
    } else {
      this.userPermission = false;
      this.formBuilder = true;
      this.sectionSecurity = false;
    }

  }

  getSavedRow(event) {
    if (this.isNestedSection === false) {
      this.page.sections[this.selectedSection].rows[this.selectedRow] = event;
    } else {
      this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows[this.selectedRow] = event;
    }
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.rowSettings = false;
    this.submitEnable = true;
  }

  // deleteSelectedRow(event) {
  //   if (this.isNestedSection === false) {
  //     this.page.sections[this.selectedSection].rows.splice(this.selectedRow, 1);
  //   } else {
  //     this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows.splice(this.selectedRow, 1);
  //   }
  //   this.fieldSettings = false;
  //   this.pagesettings = false;
  //   this.sectionSettings = false;
  //   this.controlsShow = true;
  //   this.nestedSectionSettings = false;
  //   this.rowSettings = false;
  //   this.submitEnable = true;
  // }

  openRowSettings(section: Section, row: Row, i: number, j: number) {
    row.style = '';
    row.totalColumns = row.columns.length;
    row.row = j;
    this.rowData = row;
    this.newRowData.emit(row);
    this.selectedSection = i;
    this.selectedRow = j;
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.rowSettings = false;
    this.isNestedSection = false;
    this.openRowSettingsDialog();
  }

  openRowSettingsDialog() {
    const dialog = this.dialog.open(ColumnComponent, {
      disableClose: true,
      width: '50%',
      height: '50%',
      data: this.rowData
    });

    dialog.afterClosed().subscribe(data => {
      if (data !== undefined) {
        if (this.isNestedSection === false) {
          this.page.sections[this.selectedSection].rows[this.selectedRow] = data;
        } else {
          this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows[this.selectedRow] = data;
        }
        this.submitEnable = true;
      }
      if (data === true) {
        if (this.isNestedSection === false) {
          this.page.sections[this.selectedSection].rows.splice(this.selectedRow, 1);
        } else {
          this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows.splice(this.selectedRow, 1);
        }
        this.submitEnable = true;
      }
    });

  }

  deleteRowSettings() {
    const dialogRef = this.dialog.open(ConfirmationDialogBoxComponentComponent, {
      width: '250px',
      data: { type: 'remove-row' }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        if (this.isNestedSection === false) {
          this.page.sections[this.selectedSection].rows.splice(this.selectedRow, 1);
        } else {
          this.page.sections[this.selectedSection].sections[this.selectedNestedSection].rows.splice(this.selectedRow, 1);
        }
      }
    })
  }


  openNestedSectionRowSettings(nestedSection: Section, row: Row, i: number, l: number, m: number) {
    row.style = '';
    row.totalColumns = row.columns.length;
    row.row = m;
    this.rowData = row;
    this.newRowData.emit(row);
    this.selectedRow = m;
    this.selectedSection = i;
    this.selectedNestedSection = l;
    this.fieldSettings = false;
    this.pagesettings = false;
    this.sectionSettings = false;
    this.controlsShow = true;
    this.nestedSectionSettings = false;
    this.rowSettings = false;
    this.isNestedSection = true;
    this.openRowSettingsDialog();
  }



  getSectionPermission(event) {
    if (event !== false) {
      this.page = event;
    }
    this.userPermission = false;
    this.formBuilder = true;
    this.sectionSecurity = false;
  }

  publishPage() {
    this.userPermission = true;
    this.formBuilder = false;
    this.sectionSecurity = false;
  }
}
