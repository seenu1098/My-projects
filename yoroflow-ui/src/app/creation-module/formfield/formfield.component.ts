import { Component, OnInit, Inject, EventEmitter, ChangeDetectorRef, Output, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { MatRightSheetRef, MAT_RIGHT_SHEET_DATA } from 'mat-right-sheet';
import { FieldConfig, Page, PageField, FieldName, HyperLink, Row, OptionsValue, Select } from '../shared/vo/page-vo';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSelectChange } from '@angular/material/select';
import { debounceTime } from 'rxjs/operators';
import { PageService } from '../page/page-service';
import { MatRadioChange } from '@angular/material/radio';
import { DialogService } from '../shared/service/dialog.service';
import { MenuVO } from '../menu-configuration/menu-vo';
import { MenuService } from '../menu-configuration/menu.service';
import { WorkFlowList } from '../shared/vo/workflow-list-vo';
import { ColumnComponent } from '../column/column.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TableControlValidationComponent } from '../table-control-validation/table-control-validation.component';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageComponent } from '../page/page.component';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CurrencyPipe } from '@angular/common'
import { MatMenuTrigger } from '@angular/material/menu';

// import getSymbolFromCurrency from 'currency-symbol-map'
@Component({
  selector: 'app-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.scss']
})
export class FormfieldComponent implements OnInit {
  @Output() public isFilterFieldName = new EventEmitter<any>();
  @Output() public isEnableFilterValidation = new EventEmitter<any>();
  @Output() public savedColumn = new EventEmitter<any>();
  @Output() public deleteColumn = new EventEmitter<any>();

  // @Input() data: any[] = [];

  tabs: any = [
    { name: 'Configuration', icon: 'settings', isSelected: true, color: 'blue' },
    { name: 'Validation', icon: 'rule', isSelected: false, color: 'green' },
    { name: 'Style', icon: 'style', isSelected: false, color: '#ffb100' },
    { name: 'Advanced Configuration', icon: 'manage_accounts', isSelected: false, color: 'lightblue' }];
  selectedTab = 'Configuration';
  onAdd = new EventEmitter();
  selectedButtonAction = '';
  form: FormGroup;
  inputField = new FieldConfig();
  validationRequired = false;
  conditionallyEnableChecks = false;
  conditionallyShowChecks = false;
  optionType = '';
  validationInput: boolean[] = [];
  formControlName: any[] = [];
  formControlNamePasswordField = [];
  dateFieldName = [];
  enablePasswordFiledName = false;
  columns = [];
  gridNames: any;
  dataType;
  formNameError = false;
  allowSubmitButton = false;
  submitButton = 'true';
  pageNameOptions: Page[];
  pageFields: PageField[];
  onSelectPageFields: PageField[];
  dynamicFields: PageField[];
  gridNameOptions: any;
  shoppingCartName: any[] = [];
  updateCancel = false;
  onselection: boolean;
  defaultValue = false;
  pageId;
  onselectionMessgae = false;
  goToPage = false;
  dynamicpageName: any;
  dateValidationShow: boolean;
  showDateFields = false;
  fielNameArr = new FieldName();
  showCreateButton = true;
  webServiceEnable = false;
  callWorkflow = false;
  menuList: MenuVO[];
  autocompletePage: string;
  showFields = false;
  workFlowList: WorkFlowList[];
  workflowVersionList: WorkFlowList[];
  pageVersionList: any;
  pageIdList: any;
  embeddedPages: Page[];
  appPageId: any;
  showErrorMsg = false;
  isChange = false;
  valid = false;
  numberValid = false;
  filterOptionBoolean = false;
  sortOptionBoolean = false;
  enableConfirmpassword = false;
  hyperLinkErrorForLinkName = false;
  hyperLinkErrorForLink = false;
  onselectEnable = false;
  isDatevalidEnable = false;
  isNumberFieldEnable = false;
  isComputationEnable = false;
  isLogicEnable = false;
  variableArray = [];
  isEnableCompute = false;
  fieldType: any[] = [];
  conditonallyEnablefieldType: any[] = [];
  conditonallyShowfieldType: any[] = [];
  page: any;
  fieldName: FieldName[] = [];
  isWorkflowForm: any;
  workflowName: any;
  workflowKey: any;
  testColumnsFields = [{ type: 'number', fieldLabel: 'Number', fieldId: 'number' },
  { type: 'text', fieldLabel: 'Text', fieldId: 'text' },
  { type: 'date', fieldLabel: 'Date', fieldId: 'date' }];
  tableControlInputType = {};
  columnHeadersCondtionalFields = [];
  group: any;
  field: any;
  previewUrl: any;
  isLoad: boolean;
  fileData: File;
  loadLogo: any;
  allowToSubmit: boolean;
  isPublicForm: string;
  loadOptionsForGridImage = true;
  step: number = 0;
  columnControlType: any;
  emit: boolean = false;
  enableIsConfirmPassword: boolean = false;
  files = [{ name: 'Any File', value: 'any' },
  { name: 'Image', value: 'image' },
  { name: 'Pdf', value: 'pdf' },
  { name: 'Excel', value: 'excel' },
  { name: 'Word', value: 'word' },
  { name: 'Power Point', value: 'ppt' },
  { name: 'Zip', value: 'zip' }
  ];
  selectedFiles: any[] = [];
  selectable = true;
  removable = true;
  fieldTypeList1 = [
    { value: 'input', name: $localize`:fieldTypeList1txt:Text`, icon: '' },
    { value: 'tel', name: $localize`:fieldTypeList1tel:Telephone`, icon: '' },
    { value: 'textarea', name: $localize`:fieldTypeList1txtArea:Textarea`, icon: '' },
    { value: 'computeFields', name: $localize`:fieldTypeList1compute:Compute Fields`, icon: '' }
  ];

  fieldTypeList2 = [
    { value: 'paragraph', name: $localize`:fieldTypeList2para:Paragraph`, icon: '' },
    { value: 'label', name: $localize`:fieldTypeList2label:Label`, icon: '' },
    { value: 'select', name: $localize`:fieldTypeList2sel:Select`, icon: '' },
    { value: 'userField', name: $localize`:fieldTypeList2userField:User Name`, icon: '' }
  ];

  fieldTypeList3 = [
    { value: 'multipleselect', name: $localize`:fieldTypeList3mulsel:Multi Select`, icon: '' },
    { value: 'radiobutton', name: $localize`:fieldTypeList3radbtn:Radio Button`, icon: '' },
    { value: 'checkbox', name: $localize`:fieldTypeList3cb:Check Box`, icon: '' },
  ];

  fieldTypeList4 = [
    { value: 'chip', name: $localize`:fieldTypeList4chip:Chip`, icon: '' },
    { value: 'date', name: $localize`:fieldTypeList4date:Date`, icon: '' },
    { value: 'datetime', name: $localize`:fieldTypeList4mail:Date Time`, icon: '' }
  ];

  fieldTypeList5 = [
    { value: 'email', name: $localize`:fieldTypeList4mail:E-Mail`, icon: '' },
    { value: 'password', name: $localize`:fieldTypeList5pwd:Password`, icon: '' },
    { value: 'currency', name: $localize`:fieldTypeList5curr:Currency`, icon: '' },
  ];

  initialColumnType: any;
  hideOptions: boolean = false;
  currencySymbol: any;
  showError: boolean = false;
  showCountry: boolean = false;
  @ViewChild(MatMenuTrigger, { static: false })
  contextmenu: MatMenuTrigger;
  menuX = 0;
  menuY = 0;
  @ViewChild('formulaField') formulaField: ElementRef;
  startIndexNumber: any;
  formulaFieldList: any[] = [];


  constructor(private fb: FormBuilder, private pageService: PageService,
    private menuService: MenuService, private sanitizer: DomSanitizer,
    public dialogService: DialogService, private changeDetectorRef: ChangeDetectorRef, private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FormfieldComponent>,
    private cp: CurrencyPipe
  ) {


    // private pageConfig: PageComponent
    this.formControlName = this.data[1];
    if (this.data && this.data[0]) {
      this.initialColumnType = this.data[0].controlType;
    }
    if (this.data[2] === true) {
      this.submitButton = 'true';
    } else {
      this.submitButton = 'false';
    }
    this.pageId = this.data[3];
    this.fielNameArr = this.data[5];
    this.formControlNamePasswordField = this.data[8];
    this.dateFieldName = this.data[9];
    this.onselectEnable = this.data[10];
    this.variableArray = this.data[11];
    this.page = this.data[12];
    this.isWorkflowForm = this.data[13];
    this.workflowName = this.data[14];
    this.workflowKey = this.data[15];
    if (this.data[7] === 'publicForm') {
      this.isPublicForm = 'Y';
    } else {
      this.isPublicForm = 'N';
    }
  }

  currencyList: any[] = [
    { code: "AFN", text: "Afghanistan Afghanis – AFN" },
    { code: "ALL", text: "Albania Leke – ALL" },
    { code: "DZD", text: "Algeria Dinars – DZD" },
    { code: "ARS", text: "Argentina Pesos – ARS" },
    { code: "AUD", text: "Australia Dollars – AUD" },
    { code: "ATS", text: "Austria Schillings – ATS" },
    { code: "BSD", text: "Bahamas Dollars – BSD" },
    { code: "BHD", text: "Bahrain Dinars – BHD" },
    { code: "BDT", text: "Bangladesh Taka – BDT" },
    { code: "BBD", text: "Barbados Dollars – BBD" },
    { code: "BEF", text: "Belgium Francs – BEF" },
    { code: "BMD", text: "Bermuda Dollars – BMD" },
    { code: "BRL", text: "Brazil Reais – BRL" },
    { code: "BGN", text: "Bulgaria Leva – BGN" },
    { code: "CAD", text: "Canada Dollars – CAD" },
    { code: "XOF", text: "CFA BCEAO Francs – XOF" },
    { code: "XAF", text: "CFA BEAC Francs – XAF" },
    { code: "CLP", text: "Chile Pesos – CLP" },
    { code: "CNY", text: "China Yuan Renminbi – CNY" },
    { code: "COP", text: "Colombia Pesos – COP" },
    { code: "XPF", text: "CFP Francs – XPF" },
    { code: "CRC", text: "Costa Rica Colones – CRC" },
    { code: "HRK", text: "Croatia Kuna – HRK" },
    { code: "CYP", text: "Cyprus Pounds – CYP" },
    { code: "CZK", text: "Czech Republic Koruny – CZK" },
    { code: "DKK", text: "Denmark Kroner – DKK" },
    { code: "DEM", text: "Deutsche (Germany) Marks – DEM" },
    { code: "DOP", text: "Dominican Republic Pesos – DOP" },
    { code: "NLG", text: "Dutch (Netherlands) Guilders - NLG" },
    { code: "XCD", text: "Eastern Caribbean Dollars – XCD" },
    { code: "EGP", text: "Egypt Pounds – EGP" },
    { code: "EEK", text: "Estonia Krooni – EEK" },
    { code: "EUR", text: "Euro – EUR" },
    { code: "FJD", text: "Fiji Dollars – FJD" },
    { code: "FIM", text: "Finland Markkaa – FIM" },
    { code: "FRF", text: "France Francs – FRF" },
    { code: "DEM", text: "Germany Deutsche Marks – DEM" },
    { code: "XAU", text: "Gold Ounces – XAU" },
    { code: "GRD", text: "Greece Drachmae – GRD" },
    { code: "GTQ", text: "Guatemalan Quetzal – GTQ" },
    { code: "NLG", text: "Holland (Netherlands) Guilders – NLG" },
    { code: "HKD", text: "Hong Kong Dollars – HKD" },
    { code: "HUF", text: "Hungary Forint – HUF" },
    { code: "ISK", text: "Iceland Kronur – ISK" },
    { code: "XDR", text: "IMF Special Drawing Right – XDR" },
    { code: "INR", text: "India Rupees – INR" },
    { code: "IDR", text: "Indonesia Rupiahs – IDR" },
    { code: "IRR", text: "Iran Rials – IRR" },
    { code: "IQD", text: "Iraq Dinars – IQD" },
    { code: "IEP", text: "Ireland Pounds – IEP" },
    { code: "ILS", text: "Israel New Shekels – ILS" },
    { code: "ITL", text: "Italy Lire – ITL" },
    { code: "JMD", text: "Jamaica Dollars – JMD" },
    { code: "JPY", text: "Japan Yen – JPY" },
    { code: "JOD", text: "Jordan Dinars – JOD" },
    { code: "KES", text: "Kenya Shillings – KES" },
    { code: "KRW", text: "Korea (South) Won – KRW" },
    { code: "KWD", text: "Kuwait Dinars – KWD" },
    { code: "LBP", text: "Lebanon Pounds – LBP" },
    { code: "LUF", text: "Luxembourg Francs – LUF" },
    { code: "MYR", text: "Malaysia Ringgits – MYR" },
    { code: "MTL", text: "Malta Liri – MTL" },
    { code: "MUR", text: "Mauritius Rupees – MUR" },
    { code: "MXN", text: "Mexico Pesos – MXN" },
    { code: "MAD", text: "Morocco Dirhams – MAD" },
    { code: "NLG", text: "Netherlands Guilders – NLG" },
    { code: "NZD", text: "New Zealand Dollars – NZD" },
    { code: "NOK", text: "Norway Kroner – NOK" },
    { code: "OMR", text: "Oman Rials – OMR" },
    { code: "PKR", text: "Pakistan Rupees – PKR" },
    { code: "XPD", text: "Palladium Ounces – XPD" },
    { code: "PEN", text: "Peru Nuevos Soles – PEN" },
    { code: "PHP", text: "Philippines Pesos – PHP" },
    { code: "XPT", text: "Platinum Ounces – XPT" },
    { code: "PLN", text: "Poland Zlotych – PLN" },
    { code: "PTE", text: "Portugal Escudos – PTE" },
    { code: "QAR", text: "Qatar Riyals – QAR" },
    { code: "RON", text: "Romania New Lei – RON" },
    { code: "ROL", text: "Romania Lei – ROL" },
    { code: "RUB", text: "Russia Rubles – RUB" },
    { code: "SAR", text: "Saudi Arabia Riyals – SAR" },
    { code: "XAG", text: "Silver Ounces – XAG" },
    { code: "SGD", text: "Singapore Dollars – SGD" },
    { code: "SKK", text: "Slovakia Koruny – SKK" },
    { code: "SIT", text: "Slovenia Tolars – SIT" },
    { code: "ZAR", text: "South Africa Rand – ZAR" },
    { code: "KRW", text: "South Korea Won – KRW" },
    { code: "ESP", text: "Spain Pesetas – ESP" },
    { code: "XDR", text: "Special Drawing Rights (IMF) – XDR" },
    { code: "LKR", text: "Sri Lanka Rupees – LKR" },
    { code: "SDD", text: "Sudan Dinars – SDD" },
    { code: "SEK", text: "Sweden Kronor – SEK" },
    { code: "CHF", text: "Switzerland Francs – CHF" },
    { code: "TWD", text: "Taiwan New Dollars – TWD" },
    { code: "THB", text: "Thailand Baht – THB" },
    { code: "TTD", text: "Trinidad and Tobago Dollars – TTD" },
    { code: "TND", text: "Tunisia Dinars – TND" },
    { code: "TRY", text: "Turkey New Lira – TRY" },
    { code: "AED", text: "United Arab Emirates Dirhams – AED" },
    { code: "GBP", text: "United Kingdom Pounds – GBP" },
    { code: "USD", text: "United States Dollars – USD" },
    { code: "VEB", text: "Venezuela Bolivares – VEB" },
    { code: "VND", text: "Vietnam Dong – VND" },
    { code: "ZMK", text: "Zambia Kwacha – ZMK" },
  ]
  screenHeight: any;
  formBuilderHeight: any;
  groupList: any[] = [];

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = (window.innerHeight - 66) + 'px';
    this.formBuilderHeight = (window.innerHeight - 150) + 'px';
  }

  ngOnInit() {
    this.screenHeight = (window.innerHeight - 67) + 'px';
    this.formBuilderHeight = (window.innerHeight - 150) + 'px';
    this.hideOptions = false;
    if (this.emit === false) {
      // this.setData();
    }
    this.emit = false;
    if (this.data[this.data.length - 1] === 'applicationPageLayout') {
      this.allowSubmitButton = false;
    }
    if (this.data[0].controlType !== null
      && this.data[0].controlType !== undefined
      && this.data[0].controlType !== '') {
      this.columnControlType = this.data[0].controlType;
    }

    this.form = this.fb.group({
      submitButtonShow: [this.data[2]],
      fieldType: [this.columnControlType],
      controlType: [this.data[0].controlType],
      field: this.fb.group({
        name: [this.data[0].field.name],
        control: this.fb.group({
        }),
        label: this.fb.group({
          labelName: [this.data[0].field.label.labelName, [this.noWhitespaceValidator]],
          labelOption: [this.data[0].field.label.labelOption],
          labelSize: [this.data[0].field.label.labelSize, [Validators.required, Validators.min(1)]],
          labelStyle: [this.data[0].field.label.labelStyle],
          labelPosition: [this.data[0].field.label.labelPosition],
        }),
        defaultValue: [this.data[0].field.defaultValue],
        defaultCode: [this.data[0].field.defaultCode],
        dataType: [this.data[0].field.dataType],
        enableHyperlink: [this.data[0].field.enableHyperlink],
        fieldWidth: [this.data[0].field.fieldWidth],
        unique: [this.data[0].field.unique],
        dateValidation: this.fb.group({
          dateValidation: [],
          fromField: [],
          operator: [],
          toField: [],
        }),
        numberFieldValidation: this.fb.group({
          numberFieldValidation: [],
          fromField: [],
          operator: [],
          toField: [],
        }),
        allowFutureDate: [],
        allowPastDate: [],
        editable: [this.data[0].field.editable],
        sensitive: [this.data[0].field.sensitive],
        dateFormat: [this.data[0].field.dateFormat],
        rows: [this.data[0].field.rows, [Validators.min(1), Validators.max(10)]],
        cols: [this.data[0].field.cols, [Validators.min(1), Validators.max(200)]],
        style: [this.data[0].field.style],
        rowBackground: [this.data[0].field.rowBackground, [Validators.required]],
        required: [],
        minLength: [],
        maxLength: [],
        pattern: [],
        chipSize: [],
        validations: this.fb.array([]),
        conditionalChecks: this.fb.group({
          enable: this.fb.group({
            option: [],
            fields: this.fb.array([]),
          }),
          show: this.fb.group({
            option: [],
            fields: this.fb.array([]),
          }),
          required: this.fb.group({
            option: [],
            fields: this.fb.array([]),
          }),
        }),
        onSelection: this.fb.group({
          onSelectionChange: [false],
          fieldType: [''],
          loadDataLabel: [],
          targetPageName: [],
          targetPageId: [],
          passParameter: [],
          pageType: [],
          version: [],
        })
      })
    });

    if (this.dateFieldName && this.dateFieldName.length >= 1
      && this.dateFieldName.some(field => field.name !== this.form.get('field').get('name').value)) {
      this.isDatevalidEnable = true;
    }

    if (this.data[11] && this.data[11].length >= 1
      && this.data[11].some(field => field.name !== this.form.get('field').get('name').value)) {
      this.isNumberFieldEnable = true;
    }
    this.dynamicpageName = undefined;
    this.loadControlType();
    this.loadDateValidation();
    this.loadNumberFieldValidation();
    this.loadValidation(this.data[0].field.validations);
    this.loadConditionalChecks(this.data[0].field.conditionalChecks);

    if (this.data[0].controlType === 'button' && this.isWorkflowForm) {
      this.form.get('field').get('control').get('buttonType').disable();
      this.form.get('field').get('control').get('buttonType').setValue('action');
      this.selectedButtonAction = 'action';
      this.form.get('field').get('control').get('screenType').setValue('callWorkflow');
      this.form.get('field').get('control').get('screenType').disable();
      this.form.get('field').get('control').get('saveAndCallWorkflow').setValue(true);
      this.form.get('field').get('control').get('saveAndCallWorkflow').disable();
      this.form.get('field').get('control').get('workflowName').patchValue(this.workflowName);
      this.form.get('field').get('control').get('workflowKey').setValue(this.workflowKey);
      this.form.get('field').get('control').get('workflowName').disable();
      this.form.get('field').get('control').get('workflowVersion').disable();
      this.form.get('field').get('control').get('targetPageId').setErrors(null);
      this.form.get('field').get('control').get('parameterFieldNames').setErrors(null);
      this.form.get('field').get('control').get('workflowVersion').setValue('latest');

    }

    if (this.data[0].controlType === 'page') {
      this.loadEmbeddedPages();
    }
    if (this.data[0].controlType === 'button') {
      this.loadPageNameByIdentifierButton();
    }
    if (this.data[0].controlType === 'date' && this.dateFieldName !== undefined) {
      if (this.dateFieldName.length > 1
        && this.form.get('field').get('dateValidation').get('dateValidation').value === true) {
        this.valid = true;
      }
    }
    this.formValueChanges();
  }

  changeTab(tab) {
    //  for(let i=0; i < this.tabs.length; i++){
    //    this.tabs[i].isSelected = false;
    //  }
    //  tab.isSelected = true;
    this.selectedTab = tab;
  }

  setFieldNames() {
    return this.data[1];
  }

  // setData() {
  //   this.pageConfig.columndata.subscribe(data => {
  //     if (data) {
  //       this.data = data;
  //       this.emit = true;
  //       this.initialColumnType = this.data[0].controlType;

  //       this.formControlName = this.data[1];
  //       this.allowSubmitButton = this.data[2];
  //       if (this.data[2] === true) {
  //         this.submitButton = 'true';
  //       } else {
  //         this.submitButton = 'false';
  //       }
  //       this.pageId = this.data[3];
  //       this.fielNameArr = this.data[5];
  //       this.formControlNamePasswordField = this.data[8];
  //       this.dateFieldName = this.data[9];
  //       this.onselectEnable = this.data[10];
  //       this.variableArray = this.data[11];
  //       this.page = this.data[12];
  //       this.isWorkflowForm = this.data[13];
  //       this.workflowName = this.data[14];
  //       this.workflowKey = this.data[15];
  //       if (this.data[7] === 'publicForm') {
  //         this.isPublicForm = 'Y';
  //       } else {
  //         this.isPublicForm = 'N';
  //       }
  //       this.ngOnInit();
  //     }
  //   });
  // }

  submitButtons() {
    if (this.submitButton === 'true') {
      return true;
    }
    return false;
  }

  setStep(index: number): void {
    this.step = index;
  }

  selectedFieldType(event) {
    this.data[0].controlType = event.value;
    this.columnControlType = event.value;
    this.ngOnInit();
  }

  delete() {
    this.deleteColumn.emit(true);
  }

  formValueChanges() {
    if (this.data[0].controlType === 'image') {
      this.getControlFormGroup().get('image').valueChanges.subscribe(data => {
        if (data && !(data instanceof File)) {
          this.previewUrl = data;
          this.isLoad = true;
          this.transform();
          this.changeDetectorRef.markForCheck();
          this.form.markAsDirty();
        } else {
          this.isLoad = false;
        }
      });
    }
  }

  onFileInput($event) {
    if ($event) {
      if ($event.target && $event.target.files[0]
        && $event.target.files[0].type.includes('image/')) {
        this.fileProgress($event);
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Please choose Image File',
        });
      }
    }
  }

  fileProgress(fileInput: any) {
    this.fileData = fileInput.target.files[0] as File;
    if (this.fileData) {
      this.preview();
    }
  }

  preview() {
    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (event) => {
      this.previewUrl = reader.result;
      this.getControlFormGroup().get('image').setValue(this.previewUrl);
      this.isLoad = true;
      this.transform();
      this.changeDetectorRef.markForCheck();
      if (this.fileData.size > 500000) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: 'Maximum size 500kb allowed',
        });
        this.previewUrl = null;
        this.fileData = null;
        this.isLoad = false;
        this.group.get(this.field.name).setValue(null);
      }
    };
  }

  transform() {
    if (this.previewUrl !== null && this.previewUrl !== undefined) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.previewUrl);
    }
  }

  getUploaded($event) {
    if ($event === true) {
      this.group.get(this.field.name).setValue(this.loadLogo.fileData);
      this.previewUrl = this.loadLogo.previewUrl;
      this.group.markAsDirty();
      this.allowToSubmit = true;
    }
  }

  getInputType(type) {
    if (type === 'number') {
      return 'number';
    } else if (type === 'text') {
      return 'text';
    } else if ('date') {
      return 'date';
    }
  }

  setInputTypeForTableColumns(event, type, i, j) {
    if (event.isUserInput === true) {
      this.tableControlInputType[i + j] = this.getInputType(type);
    }
  }

  setCondtionalFieldsSelectionChange(event, group: FormGroup, i) {
    if (event.isUserInput === true) {
      this.setCondtionalFieldsForTableColumns(group, i);
    }
  }

  setCondtionalFieldsForTableColumns(group: FormGroup, i) {
    const label = group.get('field').get('label').get('labelName').value;
    const name = group.get('field').get('name').value;
    const dataType = group.get('field').get('dataType').value;
    let controlType = 'text';
    if (dataType === 'long' || dataType === 'float') {
      controlType = 'number';
    } else if (dataType === 'date') {
      controlType = 'date';
    }
    this.columnHeadersCondtionalFields[i] = { type: controlType, fieldLabel: label, fieldId: name };
  }

  filterChange($event) {
    if ($event === true) {
      this.form.markAsDirty();
    }
  }

  editorEvent(event) {
    if (event) {
      this.form.markAsDirty();
    }
  }

  contentChange(event) {
    if (event) {
      this.form.markAsDirty();
    }
  }

  loadMenuList() {
    const controlGroup = this.getControlFormGroup();
    this.menuService.getMenuList().subscribe(data => {
      this.menuList = data;
      if (this.data[0].field.control) {
        controlGroup.get('menuId').setValue(this.data[0].field.control.menuId);
      }
    });
  }
  loadDateValidation() {
    if (!(this.data[0].field.dateValidation === undefined || this.data[0].field.dateValidation === null)) {
      if (this.data[0].field.dateValidation.dateValidation === true) {
        this.dateValidationShow = true;
        this.form.get('field').get('dateValidation').get('dateValidation').setValue(this.data[0].field.dateValidation.dateValidation);
        this.form.get('field').get('dateValidation').get('toField').setValue(this.data[0].field.dateValidation.toField);
        this.form.get('field').get('dateValidation').get('operator').setValue(this.data[0].field.dateValidation.operator);
        this.form.get('field').get('dateValidation').get('fromField').setValue(this.data[0].field.dateValidation.fromField);
      }
      this.form.get('field').get('allowFutureDate').setValue(this.data[0].field.allowFutureDate);
      this.form.get('field').get('allowPastDate').setValue(this.data[0].field.allowPastDate);

    }
  }

  loadNumberFieldValidation() {
    if (!(this.data[0].field.numberFieldValidation === undefined || this.data[0].field.numberFieldValidation === null)) {
      if (this.data[0].field.numberFieldValidation.numberFieldValidation === true) {
        this.numberValid = true;
        this.form.get('field').get('numberFieldValidation').get('numberFieldValidation').setValue(this.data[0].field.numberFieldValidation.numberFieldValidation);
        this.form.get('field').get('numberFieldValidation').get('toField').setValue(this.data[0].field.numberFieldValidation.toField);
        this.form.get('field').get('numberFieldValidation').get('operator').setValue(this.data[0].field.numberFieldValidation.operator);
        this.form.get('field').get('numberFieldValidation').get('fromField').setValue(this.data[0].field.numberFieldValidation.fromField);
      }
    }
  }
  setLabelName(labelname, fieldname) {
    this.form.get('field').get('dateValidation').get('toField').setValue(fieldname);
  }
  dateValidation(event: MatSlideToggle) {
    if (event.checked === true) {
      this.dateValidationShow = true;
      const Name = this.form.get('field').get('name').value;
      if (this.dateFieldName.length >= 1
        && this.dateFieldName.some(field => field.name !== Name)) {
        this.valid = true;
      }
      const fromName = this.form.get('field').get('name').value;
      this.form.get('field').get('dateValidation').get('dateValidation').setValue(true);
      this.form.get('field').get('dateValidation').get('fromField').setValue(fromName);
      this.form.get('field').get('dateValidation').get('operator').setValidators([Validators.required]);
      this.form.get('field').get('dateValidation').get('toField').setValidators([Validators.required]);
      this.form.get('field').get('dateValidation').get('dateValidation').updateValueAndValidity();
    } else {
      this.dateValidationShow = false;
      this.valid = false;
      this.form.get('field').get('dateValidation').get('dateValidation').setValue(false);
      this.form.get('field').get('dateValidation').get('fromField').setValue(null);
      this.form.get('field').get('dateValidation').get('operator').setErrors(null);
      this.form.get('field').get('dateValidation').get('toField').setErrors(null);
      this.form.get('field').get('dateValidation').get('dateValidation').updateValueAndValidity();
    }
  }


  numberFieldValidation(event: MatSlideToggle) {
    if (event.checked === true) {
      const Name = this.form.get('field').get('name').value;
      if (this.data[11].length >= 1
        && this.data[11].some(field => field.name !== Name)) {
        this.numberValid = true;
      }
      const fromName = this.form.get('field').get('name').value;
      this.form.get('field').get('numberFieldValidation').get('numberFieldValidation').setValue(true);
      this.form.get('field').get('numberFieldValidation').get('fromField').setValue(fromName);
      this.form.get('field').get('numberFieldValidation').get('operator').setValidators([Validators.required]);
      this.form.get('field').get('numberFieldValidation').get('toField').setValidators([Validators.required]);
      this.form.get('field').get('numberFieldValidation').get('numberFieldValidation').updateValueAndValidity();
    } else {
      this.numberValid = false;
      this.form.get('field').get('numberFieldValidation').get('numberFieldValidation').setValue(false);
      this.form.get('field').get('numberFieldValidation').get('fromField').setValue(null);
      this.form.get('field').get('numberFieldValidation').get('operator').setErrors(null);
      this.form.get('field').get('numberFieldValidation').get('toField').setErrors(null);
      this.form.get('field').get('numberFieldValidation').get('numberFieldValidation').updateValueAndValidity();
    }
  }


  loadPageName() {
    const targetPageName = this.form.get('field').get('control').get('targetPageName');
    targetPageName.valueChanges.pipe(debounceTime(500)).subscribe(
      () => {
        if (targetPageName.value !== '') {
          this.pageService.getAutoCompletePageName(targetPageName.value, this.isPublicForm).subscribe(result => {
            this.pageNameOptions = result;
          });
        }
      });
  }
  loadEmbeddedPages() {
    const targetPageName = this.form.get('field').get('control').get('pageId');
    targetPageName.valueChanges.pipe(debounceTime(500)).subscribe(
      () => {
        if (targetPageName.value !== '') {
          this.pageService.getAutoCompletePageName(targetPageName.value, this.isPublicForm).subscribe(result => {
            this.embeddedPages = result;
          });
        }
      });

  }


  loadConditionalChecks(data) {
    if (data !== undefined && data !== null) {
      const enableFieldValueArray = data.enable.fields;
      const showFieldValueArray = data.show.fields;

      this.form.get('field').get('conditionalChecks').get('enable').get('option').patchValue(data.enable.option);
      this.form.get('field').get('conditionalChecks').get('show').get('option').patchValue(data.show.option);
      if (data.required) {
        this.form.get('field').get('conditionalChecks').get('required').get('option').patchValue(data.required.option);
        const requiredFieldValueArray: any[] = data.required.fields;
        for (let i = 0; i < requiredFieldValueArray.length; i++) {
          const index = '' + i;
          this.addRequiredConditionalChecks();
          const form = (this.getConditionallyCheckFormArray('required').get(index)) as FormGroup;
          form.patchValue(requiredFieldValueArray[i]);
          this.fieldTypeChange({ value: requiredFieldValueArray[i].fieldName }, i,
            this.getConditionallyCheckFormArray('required').get(index).get('dataType'));
        }
      }
      for (let i = 0; i < enableFieldValueArray.length; i++) {
        const index = '' + i;
        this.addEnableConditionalChecks();
        const form = (this.getConditionallyCheckFormArray('enable').get(index)) as FormGroup;
        form.patchValue(enableFieldValueArray[i]);
        this.conditonallyEnablefieldTypeChange({ value: enableFieldValueArray[i].fieldName }, i,
          this.getConditionallyCheckFormArray('enable').get(index).get('dataType'));
      }

      for (let i = 0; i < showFieldValueArray.length; i++) {
        const index = '' + i;
        this.addShowConditionalChecks();
        const form = (this.getConditionallyCheckFormArray('show').get(index)) as FormGroup;
        form.patchValue(showFieldValueArray[i]);
        this.conditonallyShowfieldTypeChange({ value: showFieldValueArray[i].fieldName }, i,
          this.getConditionallyCheckFormArray('show').get(index).get('dataType'));
      }

    }
  }

  loadValidation(data) {
    const form = (this.form.get('field') as FormGroup);
    for (let i = 0; i < data.length; i++) {
      if (data[i].type === 'required') {
        form.get('required').setValue(true);
      } else if (data[i].type === 'minlength') {
        form.get('minLength').setValue(data[i].value);
      } else if (data[i].type === 'maxlength') {
        form.get('maxLength').setValue(data[i].value);
      } else if (data[i].type === 'pattern') {
        form.get('pattern').setValue(data[i].value);
      }
    }

  }

  getControlFormGroup() {
    return this.form.get('field').get('control') as FormGroup;
  }

  getHyperLinkBooleanValue($event) {
    const controlGroup = this.getControlFormGroup();
    if ($event.checked === true) {
      this.addFormControlsForHyperLinkEnable(controlGroup);
    } else {
      controlGroup.removeControl('screenType');
      controlGroup.removeControl('targetPageId');
      controlGroup.removeControl('targetPageName');
      controlGroup.removeControl('targetPageColumnName');
      controlGroup.removeControl('targetPageColumnId');
      controlGroup.removeControl('version');
    }
  }
  addFormControlsForHyperLinkEnable(controlGroup) {
    controlGroup.addControl('screenType', this.fb.control('', [Validators.required]));
    controlGroup.addControl('targetPageName', this.fb.control('', [Validators.required]));
    controlGroup.addControl('targetPageId', this.fb.control('', []));
    controlGroup.addControl('targetPageColumnName', this.fb.control('', [Validators.required]));
    controlGroup.addControl('targetPageColumnId', this.fb.control('', []));
    controlGroup.addControl('version', this.fb.control('', []));
    this.loadPageName();
  }

  getTargetPageColumns(pageIdentifier, version) {
    const form = this.getControlFormGroup();
    const pageIdentifierControl = form.get('targetPageId');
    pageIdentifierControl.setValue(pageIdentifier);
    form.get('version').setValue(version);
    this.loadTargetPageColumns(pageIdentifierControl.value, version);
  }

  omit_number(event) {
    let k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k === 32 || (k >= 48 && k <= 57));
  }

  loadTargetPageColumns(pageIdentifierControl, version) {
    this.dynamicpageName = pageIdentifierControl;
    this.isFilterFieldName.emit(this.dynamicpageName);
    let dynamic = null;
    this.pageService.getTargetPageColumns(pageIdentifierControl, version).subscribe(data => {
      this.pageFields = data;
      this.showFields = true;
      if (this.data[0].controlType === 'autocomplete') {
        dynamic = this.getControlFormGroup();
        if (this.data[0].field.control) {
          dynamic.get('keyColumnName').setValue(this.data[0].field.control.keyColumnName);
          dynamic.get('descriptionColumnName').setValue(this.data[0].field.control.descriptionColumnName.split(','));
          dynamic.get('autoCompleteColumnName').setValue(this.data[0].field.control.autoCompleteColumnName);
          dynamic.get('fieldNameToBeLoaded').setValue(this.data[0].field.control.fieldNameToBeLoaded);
        }
      } else if (this.data[0].controlType === 'input') {
        dynamic = this.getControlFormGroup();
        if (pageIdentifierControl && version) {
          dynamic.get('targetPageId').setValue(pageIdentifierControl);
          dynamic.get('version').setValue(version);
        }
        if (this.data[0].field && this.data[0].field.enableHyperlink === true && this.data[0].field.control) {
          dynamic.get('targetPageColumnName').setValue(this.data[0].field.control.targetPageColumnName);
        }
      } else {
        dynamic = this.form.get('field').get('control').get('filter') as FormGroup;
        if (this.data[0].field.control && this.data[0].field.control.filter) {
          dynamic.get('keyColumnName').setValue(this.data[0].field.control.filter.keyColumnName);
          dynamic.get('descriptionColumnName').setValue(this.data[0].field.control.filter.descriptionColumnName);
        }
      }
    });
  }

  loadTargetPageColumnsForOnSelection(pageIdentifierControl, version) {
    this.pageService.getTargetPageColumns(pageIdentifierControl, version).subscribe(data => {
      this.onSelectPageFields = data;
      if (this.data[0].controlType === 'select') {
        if (this.data[0].field.onSelection && this.data[0].field.onSelection.onSelectionChange !== undefined &&
          this.data[0].field.onSelection.onSelectionChange === true && this.data[0].field.onSelection.passParameter) {
          this.form.get('field').get('onSelection').get('passParameter').setValue(this.data[0].field.onSelection.passParameter);
        }
      }
    });
  }

  loadPageFieldsAndTableName(event, pageIdentifier, version) {
    if (event.isUserInput === true) {
      this.loadTargetPageColumns(pageIdentifier, version);
      const dynamic = this.form.get('field').get('control').get('filter') as FormGroup;
      dynamic.get('tableName').setValue(pageIdentifier);
      dynamic.get('version').setValue(version);
    }
  }

  loadDynamicPageNameForAutocomplete() {
    const pageType = this.form.get('field').get('control').get('pageType').value;
    const pageName = this.form.get('field').get('control').get('pageName');
    pageName.valueChanges.pipe(debounceTime(500)).subscribe(
      () => {
        if (pageName.value !== '' && pageType === 'dynamicPage') {
          this.pageService.getAutoCompletePageName(pageName.value, this.isPublicForm).subscribe(result => {
            this.pageNameOptions = result;
            if (result.length === 0) {
              this.dynamicpageName = pageName.value;
              this.isFilterFieldName.emit(this.dynamicpageName);
            }
          });
        } else if (pageName.value !== '' && pageType === 'customPage') {
          this.pageService.getCustomPageNameList(pageName.value).subscribe(result => {
            this.pageNameOptions = result;
          });
        }
      });

  }

  loadPageFieldsForAutocomplete(pageIdentifierControl) {
    this.dynamicpageName = pageIdentifierControl;
    this.isFilterFieldName.emit(this.dynamicpageName);
    const dynamic = this.form.get('field').get('control').get('filter') as FormGroup;
    this.pageService.getPageFieldList(pageIdentifierControl).subscribe(data => {
      this.pageFields = data;
      this.showFields = true;
      dynamic.get('keyColumnName').setValue(this.data[0].field.control.filter.keyColumnName);
      dynamic.get('descriptionColumnName').setValue(this.data[0].field.control.filter.descriptionColumnName);
      dynamic.get('fieldNameToBeLoaded').setValue(this.data[0].field.control.fieldNameToBeLoaded);
    });
  }

  loadTableNameForAutocomplete(pageIdentifier, version, pageName) {
    const dynamic = this.form.get('field').get('control') as FormGroup;
    dynamic.get('tableName').setValue(pageIdentifier);
    dynamic.get('version').setValue(version);
    if (dynamic.get('pageType').value === 'dynamicPage') {
      this.loadTargetPageColumns(pageIdentifier, version);
    } else if (dynamic.get('pageType').value === 'customPage') {
      this.loadPageFieldsForAutocomplete(pageIdentifier);
    }
  }

  loadButtonPageVersion(version) {
    const dynamic = this.form.get('field').get('control') as FormGroup;
    dynamic.get('version').setValue(version);
  }

  loadGridPageVersion(option) {
    const dynamic = this.form.get('field').get('control') as FormGroup;
    dynamic.get('version').setValue(option.version);
    dynamic.get('pageName').setValue(option.pageName);
    this.appPageId = option.pageId;
  }

  setTargetPageColumnId(fieldId) {
    const form = this.getControlFormGroup();
    form.get('targetPageColumnId').setValue(fieldId);
  }



  filterFormArray(): FormGroup {
    return this.fb.group({
      columnName: [],
      value: [],
      valueType: [],
      dataType: [],
      fieldName: []
    });
  }

  addFilters() {
    (this.form.get('field').get('control').get('filters') as FormArray).push(this.filterFormArray());
  }


  filterControlFormArray(): FormGroup {
    return this.fb.group({
      columnName: ['', [Validators.required]],
      value: ['', [Validators.required]],
      dataType: ['', [Validators.required]],
      operator: ['', [Validators.required]],
      valueType: ['', [Validators.required]],
      fieldName: ['', [Validators.required]],
      allowWhenMatched: [],
      dateFormat: [],
    });
  }
  filterOption(event) {
    if (event.checked === true) {
      this.filterOptionBoolean = true;

      if (this.form.get('field').get('control').get('filters')) {
        const formArray = this.form.get('field').get('control').get('filters') as FormArray;
        if (formArray.length <= 0) {
          (this.form.get('field').get('control').get('filters') as FormArray).push(this.filterControlFormArray());
        }
        this.validateFormArrayFields(this.form.get('field').get('control').get('filters') as FormArray);
      }
    } else {
      this.filterOptionBoolean = false;
      this.setFormArrayFieldsAsNotRequired(this.form.get('field').get('control').get('filters') as FormArray);
    }
  }

  sortOption(event) {
    if (event.checked === true) {
      this.sortOptionBoolean = true;
      if (this.form.get('field').get('control').get('filter').get('sortBy')) {
        const formArray = this.form.get('field').get('control').get('filter').get('sortBy') as FormArray;
        if (formArray.length <= 0) {
          (this.form.get('field').get('control').get('filter').get('sortBy') as FormArray).push(this.sortOptionFormArray());
        }
        this.validateSortArrayFields(this.form.get('field').get('control').get('filter').get('sortBy') as FormArray)
      }

    } else {
      this.sortOptionBoolean = false;
      this.setFormArrayFieldsAsNotRequired(this.form.get('field').get('control').get('filter').get('sortBy') as FormArray)
    }
  }

  addDynamicFormControls() {
    const controlGroup = this.getControlFormGroup();
    controlGroup.addControl('optionType', this.fb.control('', []));
    controlGroup.addControl('filter', this.fb.group({}));
    if (this.data[0].controlType !== 'imagegrid') {
      controlGroup.addControl('defaultValues', this.fb.group({}));
    }
    const selectGroup = this.form.get('field').get('control').get('filter') as FormGroup;
    selectGroup.addControl('pageName', this.fb.control('', [Validators.required]));
    selectGroup.addControl('tableName', this.fb.control(''));
    selectGroup.addControl('keyColumnName', this.fb.control('', [Validators.required]));
    selectGroup.addControl('descriptionColumnName', this.fb.control('', [Validators.required]));
    selectGroup.addControl('sortOption', this.fb.control(false));
    selectGroup.addControl('sortBy', this.fb.array([this.sortOptionFormArray()]));
    selectGroup.addControl('loadFirstOption', this.fb.control(false));
    selectGroup.addControl('filterOptions', this.fb.control(false));
    selectGroup.addControl('joinClause', this.fb.control('', []));
    selectGroup.addControl('version', this.fb.control(''));
    if (this.data[0].controlType !== 'imagegrid') {
      const defaultGroup = this.form.get('field').get('control').get('defaultValues') as FormGroup;
      defaultGroup.addControl('defaultValue', this.fb.control('', []));
      defaultGroup.addControl('keyValue', this.fb.control('', []));
      defaultGroup.addControl('descValue', this.fb.control('', []));
    }
    this.loadDynamicPageName();
  }

  sortOptionFormArray(): FormGroup {
    return this.fb.group({
      sortColumnName: ['', [Validators.required]],
      sortType: [false],
    });
  }

  getSortByFormArray() {
    return (this.form.get('field').get('control').get('filter').get('sortBy') as FormArray).controls;
  }

  addSortOptions() {
    (this.form.get('field').get('control').get('filter').get('sortBy') as FormArray).push(this.sortOptionFormArray());
    this.form.markAsDirty();
  }

  removeSortOptions(i: number) {
    (this.form.get('field').get('control').get('filter').get('sortBy') as FormArray).removeAt(i);
    this.form.markAsDirty();
  }


  addStaticFormControls() {
    const controlGroup = this.getControlFormGroup();
    controlGroup.addControl('optionType', this.fb.control('', [Validators.required]));
    controlGroup.addControl('optionsValues', this.fb.array([
      this.fb.group({
        code: [, [Validators.required]],
        description: [, [Validators.required]],
      })
    ]));
  }

  fieldTypeChange(event, i, dataType: AbstractControl) {
    this.data[12].sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.field.name === event.value) {
            if ((column.controlType === 'currency' || column.controlType === 'card' || column.field.dataType === 'string' || column.field.dataType === null)
              && column.controlType !== 'checkbox' && column.controlType !== 'email') {
              if (column.controlType === 'currency') {
                this.currencySymbol = column.field.control.currencyCode
              }
              this.fieldType[i] = 'text';
              if (column.controlType === 'tel') {
                this.fieldType[i] = 'tel';
              }
            } else if (column.field.dataType === 'date') {
              this.fieldType[i] = 'date';
            } else if (column.field.dataType === 'float' || column.field.dataType === 'long') {
              this.fieldType[i] = 'number';
            } else if (column.controlType === 'checkbox') {
              this.fieldType[i] = 'checkBox';
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').setValue(false);
              if (this.data[0] && this.data[0].field.conditionalChecks.required.fields[i]
                && this.data[0].field.conditionalChecks.required.fields[i].value === true) {
                this.form.get('field').get('conditionalChecks').get('required').
                  get('fields').get('' + i).get('value').setValue(this.data[0].field.conditionalChecks.required.fields[i].value);
              }
            } else if (column.controlType === 'email') {
              this.fieldType[i] = 'email';
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').setValue('');
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').setValidators([Validators.required, Validators.email]);
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
            if (this.fieldType[i] !== 'email' && this.fieldType[i] !== 'checkbox') {

              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').setValidators([Validators.required]);
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
          }
        });
      });
      if (section.sections && section.sections.length > 0) {
        this.fieldTypeChangeForSubSection(section, i, event.value);
      }
    });
    dataType.setValue(this.fieldType[i]);
  }

  getTelephoneNumber(phoneNumber: string, i): void {
    this.form.get('field').get('conditionalChecks').get('required').
      get('fields').get('' + i).get('value').setValue(phoneNumber)
    if (this.form.get('field').get('conditionalChecks').get('required').get('fields').get('' + i).get('value').value === undefined ||
      this.form.get('field').get('conditionalChecks').get('required').get('fields').get('' + i).get('value').value === null ||
      this.form.get('field').get('conditionalChecks').get('required').get('fields').get('' + i).get('value').value === '') {
      this.form.get('field').get('conditionalChecks').get('required').get('fields').get('' + i).get('value').setValidators([Validators.required]);
      this.form.get('field').get('conditionalChecks').get('required').get('fields').get('' + i).get('value').updateValueAndValidity();
    }
    if (this.form.get('field').get('conditionalChecks').get('required').get('fields').get('' + i).get('value').value !== '') {
      this.showError = true;
    }
  }

  getTelephoneNumberForEnableWhen(phoneNumber: string, i): void {
    this.form.get('field').get('conditionalChecks').get('enable').
      get('fields').get('' + i).get('value').setValue(phoneNumber)
    if (this.form.get('field').get('conditionalChecks').get('enable').get('fields').get('' + i).get('value').value === undefined ||
      this.form.get('field').get('conditionalChecks').get('enable').get('fields').get('' + i).get('value').value === null ||
      this.form.get('field').get('conditionalChecks').get('enable').get('fields').get('' + i).get('value').value === '') {
      this.form.get('field').get('conditionalChecks').get('enable').get('fields').get('' + i).get('value').setValidators([Validators.required]);
      this.form.get('field').get('conditionalChecks').get('enable').get('fields').get('' + i).get('value').updateValueAndValidity();
    }
    if (this.form.get('field').get('conditionalChecks').get('enable').get('fields').get('' + i).get('value').value !== '') {
      this.showError = true;
    }
  }

  getTelephoneNumberForShowWhen(phoneNumber: string, i): void {
    this.form.get('field').get('conditionalChecks').get('show').
      get('fields').get('' + i).get('value').setValue(phoneNumber)
    if (this.form.get('field').get('conditionalChecks').get('show').get('fields').get('' + i).get('value').value === undefined ||
      this.form.get('field').get('conditionalChecks').get('show').get('fields').get('' + i).get('value').value === null ||
      this.form.get('field').get('conditionalChecks').get('show').get('fields').get('' + i).get('value').value === '') {
      this.form.get('field').get('conditionalChecks').get('show').get('fields').get('' + i).get('value').setValidators([Validators.required]);
      this.form.get('field').get('conditionalChecks').get('show').get('fields').get('' + i).get('value').updateValueAndValidity();
    }
    if (this.form.get('field').get('conditionalChecks').get('show').get('fields').get('' + i).get('value').value !== '') {
      this.showError = true;
    }
  }

  transformAmount(element, name, i, fieldName) {

    this.data[12].sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'currency') {
            if (name === 'amt') {
              let formattedAmount = this.cp.transform(element.target.value, this.currencySymbol)
              element.target.value = formattedAmount;
              const firstDigit = formattedAmount.search(/\d/);
              const value = formattedAmount.substring(0, firstDigit) + ' ' + formattedAmount.substr(firstDigit);
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').setValue(value);
            }
          }
        });
      });
    })


  }

  transformAmountForEnableWhen(element, name, i, fieldName) {

    this.data[12].sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'currency') {
            if (name === 'amt') {
              let formattedAmount = this.cp.transform(element.target.value, this.currencySymbol)
              element.target.value = formattedAmount;
              const firstDigit = formattedAmount.search(/\d/);
              const value = formattedAmount.substring(0, firstDigit) + ' ' + formattedAmount.substr(firstDigit);
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').setValue(value);
            }
          }
        });
      });
    })


  }

  transformAmountForShowWhen(element, name, i, fieldName) {
    this.data[12].sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'currency') {
            if (name === 'amt') {
              let formattedAmount = this.cp.transform(element.target.value, this.currencySymbol)
              element.target.value = formattedAmount;
              const firstDigit = formattedAmount.search(/\d/);
              const value = formattedAmount.substring(0, firstDigit) + ' ' + formattedAmount.substr(firstDigit);
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').setValue(value);
            }
          }
        });
      });
    })


  }

  fieldTypeChangeForSubSection(section, i, value) {
    section.sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.field.name === value) {
            if ((column.controlType === 'card' || column.field.dataType === 'string' || column.field.dataType === null)
              && column.controlType !== 'checkbox' && column.controlType !== 'email') {
              this.fieldType[i] = 'text';
            } else if (column.field.dataType === 'date') {
              this.fieldType[i] = 'date';
            } else if (column.field.dataType === 'float' || column.field.dataType === 'long') {
              this.fieldType[i] = 'number';
            } else if (column.controlType === 'checkbox') {
              this.fieldType[i] = 'checkBox';
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').setValue(false);
              if (this.data[0] && this.data[0].field.conditionalChecks.required.fields[i]
                && this.data[0].field.conditionalChecks.required.fields[i].value === true) {
                this.form.get('field').get('conditionalChecks').get('required').
                  get('fields').get('' + i).get('value').setValue(this.data[0].field.conditionalChecks.required.fields[i].value);
              }
            } else if (column.controlType === 'email') {
              this.fieldType[i] = 'email';
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').setValue('');
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').setValidators([Validators.required, Validators.email]);
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
            if (this.fieldType[i] !== 'email' && this.fieldType[i] !== 'checkbox') {
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').setValidators([Validators.required]);
              this.form.get('field').get('conditionalChecks').get('required').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
          }
        });
      });
    });
  }

  currencyChange(event) {
    if (event) {
      this.form.markAsDirty()
    }
  }


  dataTypeChange(event) {
    if (event.value !== 'string' && this.data[11].length > 1) {

      if (this.data[11] && this.data[11].length > 2 && (this.form.get('field').get('control').get('variableArray') as FormArray).length < 2) {
        this.addVariables();
      }
    } else {
      if (event.value === 'string' && this.form.get('field').get('control').get('enableCompute')) {
        this.form.get('field').get('control').get('enableCompute').setValue(false);
        this.isComputationEnable = false;
      }
      if (this.form.get('field').get('control').get('operator')) {
        this.form.get('field').get('control').get('operator').setValidators(null);
        this.form.get('field').get('control').get('operator').setErrors(null);
        for (let i = 0; i < this.getVariablesFormArray.length; i++) {
          const variableArray = (this.form.get('field').get('control').get('variableArray').get('' + i) as FormGroup);
          variableArray.get('variableName').setErrors(null);
          variableArray.get('variableType').setErrors(null);
          variableArray.get('variableName').setValidators(null);
          variableArray.get('variableType').setValidators(null);
        }
      }
    }
  }

  conditonallyEnablefieldTypeChange(event, i, dataType: AbstractControl) {
    this.data[12].sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.field.name === event.value) {
            if ((column.controlType === 'currency' || column.controlType === 'card' || column.field.dataType === 'string' || column.field.dataType === null)
              && column.controlType !== 'checkbox' && column.controlType !== 'email') {
              if (column.controlType === 'currency') {
                this.currencySymbol = column.field.control.currencyCode
              }
              this.conditonallyEnablefieldType[i] = 'text';
              if (column.controlType === 'tel') {
                this.conditonallyEnablefieldType[i] = 'tel';
              }
            } else if (column.field.dataType === 'date') {
              this.conditonallyEnablefieldType[i] = 'date';
            } else if (column.field.dataType === 'float' || column.field.dataType === 'long') {
              this.conditonallyEnablefieldType[i] = 'number';
            } else if (column.controlType === 'checkbox') {
              this.conditonallyEnablefieldType[i] = 'checkBox';
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').setValue(false);
              if (this.data[0] && this.data[0].field.conditionalChecks.enable.fields[i]
                && this.data[0].field.conditionalChecks.enable.fields[i].value === true) {
                this.form.get('field').get('conditionalChecks').get('enable').
                  get('fields').get('' + i).get('value').setValue(this.data[0].field.conditionalChecks.enable.fields[i].value);
              }
            } else if (column.controlType === 'email') {
              this.conditonallyEnablefieldType[i] = 'email';
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').setValue('');
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').setValidators([Validators.required, Validators.email]);
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
            if (this.conditonallyEnablefieldType[i] !== 'email' && this.conditonallyEnablefieldType[i] !== 'checkbox') {
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').setValidators([Validators.required]);
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
          }
        });
      });
      if (section.sections && section.sections.length > 0) {
        this.conditonallyEnablefieldTypeChangeForSubSection(section, i, event.value);
      }
    });
    dataType.setValue(this.conditonallyEnablefieldType[i]);
  }

  conditonallyEnablefieldTypeChangeForSubSection(section, i, value) {
    section.sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.field.name === value) {
            if ((column.controlType === 'card' || column.field.dataType === 'string' || column.field.dataType === null)
              && column.controlType !== 'checkbox' && column.controlType !== 'email') {
              this.conditonallyEnablefieldType[i] = 'text';
            } else if (column.field.dataType === 'date') {
              this.conditonallyEnablefieldType[i] = 'date';
            } else if (column.field.dataType === 'float' || column.field.dataType === 'long') {
              this.conditonallyEnablefieldType[i] = 'number';
            } else if (column.controlType === 'checkbox') {
              this.conditonallyEnablefieldType[i] = 'checkBox';
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').setValue(false);
              if (this.data[0] && this.data[0].field.conditionalChecks.enable.fields[i]
                && this.data[0].field.conditionalChecks.enable.fields[i].value === true) {
                this.form.get('field').get('conditionalChecks').get('enable').
                  get('fields').get('' + i).get('value').setValue(this.data[0].field.conditionalChecks.enable.fields[i].value);
              }
            } else if (column.controlType === 'email') {
              this.conditonallyEnablefieldType[i] = 'email';
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').setValue('');
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').setValidators([Validators.required, Validators.email]);
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
            if (this.conditonallyEnablefieldType[i] !== 'email' && this.conditonallyEnablefieldType[i] !== 'checkbox') {
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').setValidators([Validators.required]);
              this.form.get('field').get('conditionalChecks').get('enable').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
          }
        });
      });
    });
  }

  conditonallyShowfieldTypeChange(event, i, dataType: AbstractControl) {
    this.data[12].sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.field.name === event.value) {
            if ((column.controlType === 'currency' || column.controlType === 'card' || column.field.dataType === 'string' || column.field.dataType === null)
              && column.controlType !== 'checkbox' && column.controlType !== 'email') {
              if (column.controlType === 'currency') {
                this.currencySymbol = column.field.control.currencyCode
              }
              this.conditonallyShowfieldType[i] = 'text';
              if (column.controlType === 'tel') {
                this.conditonallyShowfieldType[i] = 'tel';
              }
            } else if (column.field.dataType === 'date') {
              this.conditonallyShowfieldType[i] = 'date';
            } else if (column.field.dataType === 'float' || column.field.dataType === 'long') {
              this.conditonallyShowfieldType[i] = 'number';
            } else if (column.controlType === 'checkbox') {
              this.conditonallyShowfieldType[i] = 'checkBox';
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').setValue(false);
              if (this.data[0] && this.data[0].field.conditionalChecks.show.fields[i]
                && this.data[0].field.conditionalChecks.show.fields[i].value === true) {
                this.form.get('field').get('conditionalChecks').get('show').
                  get('fields').get('' + i).get('value').setValue(this.data[0].field.conditionalChecks.show.fields[i].value);
              }
            } else if (column.controlType === 'email') {
              this.conditonallyShowfieldType[i] = 'email';
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').setValue('');
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').setValidators([Validators.required, Validators.email]);
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
            if (this.conditonallyShowfieldType[i] !== 'email' && this.conditonallyShowfieldType[i] !== 'checkbox') {

              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').setValidators([Validators.required]);
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
          }
        });
      });
      if (section.sections && section.sections.length > 0) {
        this.conditonallyShowfieldTypeChangeForSubSection(section, i, event.value);
      }
    });
    dataType.setValue(this.conditonallyShowfieldType[i]);
  }


  conditonallyShowfieldTypeChangeForSubSection(section, i, value) {
    section.sections.forEach(section => {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.field.name === value) {
            if ((column.controlType === 'card' || column.field.dataType === 'string' || column.field.dataType === null)
              && column.controlType !== 'checkbox' && column.controlType !== 'email') {
              this.conditonallyShowfieldType[i] = 'text';
            } else if (column.field.dataType === 'date') {
              this.conditonallyShowfieldType[i] = 'date';
            } else if (column.field.dataType === 'float' || column.field.dataType === 'long') {
              this.conditonallyShowfieldType[i] = 'number';
            } else if (column.controlType === 'checkbox') {
              this.conditonallyShowfieldType[i] = 'checkBox';
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').setValue(false);
              if (this.data[0] && this.data[0].field.conditionalChecks.show.fields[i]
                && this.data[0].field.conditionalChecks.show.fields[i].value === true) {
                this.form.get('field').get('conditionalChecks').get('show').
                  get('fields').get('' + i).get('value').setValue(this.data[0].field.conditionalChecks.show.fields[i].value);
              }
            } else if (column.controlType === 'email') {
              this.conditonallyShowfieldType[i] = 'email';
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').setValue('');
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').setValidators([Validators.required, Validators.email]);
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
            if (this.conditonallyShowfieldType[i] !== 'email' && this.conditonallyShowfieldType[i] !== 'checkbox') {

              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').setValidators([Validators.required]);
              this.form.get('field').get('conditionalChecks').get('show').
                get('fields').get('' + i).get('value').updateValueAndValidity();
            }
          }
        });
      });
    });
  }

  enableComputation(event) {
    if (event.checked === true) {
      this.isComputationEnable = true;
      if (this.data[11] && this.data[11].length > 2 && (this.form.get('field').get('control').get('variableArray') as FormArray).length < 2) {
        this.addVariables();
      }
    } else {
      this.isComputationEnable = false;
      this.form.get('field').get('control').get('operator').setValidators(null);
      this.form.get('field').get('control').get('operator').setErrors(null);
      for (let i = 0; i < this.getVariablesFormArray.length; i++) {
        const variableArray = (this.form.get('field').get('control').get('variableArray').get('' + i) as FormGroup);
        variableArray.get('variableName').setErrors(null);
        variableArray.get('variableType').setErrors(null);
        variableArray.get('variableName').setValidators(null);
        variableArray.get('variableType').setValidators(null);

      }
    }
  }

  generateImageControlName() {
    this.form.get('field').get('control').get('imageGridLabel').setValue
      (this.camelize(this.form.get('field').get('control').get('imageGridLabel').value));
    this.form.get('field').get('name').setValue(this.camelize(this.form.get('field').get('control').get('imageGridLabel').value));
  }

  operatorChange(event) {
    if (event.value === 'division') {
      this.isLogicEnable = true;
      this.getVariablesFormArray().length = 2;
    } else {
      this.isLogicEnable = false;
    }

  }

  getVariablesArray(): FormGroup {
    return this.fb.group({
      dataType: [''],
      variableType: ['pagefield', [Validators.required]],
      variableName: ['', [Validators.required]]
    });
  }

  checkSelectedUsers(type: string): void {
    const controlGroup = this.getControlFormGroup();
    if (type === 'all') {
      controlGroup.get('workspaceUser').setValue(false);
      controlGroup.get('teams').setValue('');
    } else {
      controlGroup.get('allowLoggedInUser').setValue(false);
      controlGroup.get('teams').setValue('');
    }
  }
  dataTypeForCompute($event) {
    if ($event.value === 'string') {
      this.form.get('field').get('control').get('formula').setValue('concatenate()');
    } else if ($event.value === 'long') {
      this.form.get('field').get('control').get('formula').setValue('');
    }
  }

  selectChip(select: any): void {
    if (this.form.get('field').get('control').get('fieldType').value === 'string') {
      const value = this.form.get('field').get('control').get('formula').value;
      let concatValue = null;
      if (value === 'concatenate()') {
        concatValue = 'concatenate(' + select.name + ')';
      } else {
        let str = value;
        str = str.substring(0, str.length - 1);
        concatValue = this.addValueForTextAreaAutoComplete(this.form.get('field').get('control').get('formula').value, select.name);
      }
      this.form.get('field').get('control').get('formula').setValue(concatValue);
    } else {
      const value = this.form.get('field').get('control').get('formula').value;
      this.form.get('field').get('control').get('formula').setValue(this.addValueForTextAreaAutoComplete(value, select.name));
    }

  }


  selectStringChip(select: any): void {
    if (this.form.get('field').get('control').get('fieldType').value === 'string') {
      const value = this.form.get('field').get('control').get('formula').value;
      let concatValue = null;
      if (value === 'concatenate()') {
        concatValue = 'concatenate(' + select + ')';
      } else {
        let str = value;
        str = str.substring(0, str.length - 1);
        concatValue = str + ',' + select + ')';
        concatValue = this.addValueForTextAreaAutoComplete(this.form.get('field').get('control').get('formula').value, select);
      }
      this.form.get('field').get('control').get('formula').setValue(concatValue);
    } else {
      const value = this.form.get('field').get('control').get('formula').value;
      this.form.get('field').get('control').get('formula')
      .setValue(this.addValueForTextAreaAutoComplete(value, select));
    }

  }

  addValueForTextAreaAutoComplete(formValue: string, fieldId) {
    let value = '';
    value = formValue.substring(0, this.startIndexNumber);
    value = value + fieldId;
    value = value + formValue.substring(this.startIndexNumber);
    return value;
  }

  openAutocomplete(event) {
    if (event.selectionStart || event.selectionStart === '0') {
      this.startIndexNumber = event.selectionStart;
    }
  }

  operatorTypeChange($event) {
    if ($event) {
    if ($event.value === 'number') {
      this.form.get('field').get('control').get('fieldType').setValue('float');
      this.form.get('field').get('control').get('formula').setValue('');
    }
    if ($event.value === 'string') {
      this.form.get('field').get('control').get('fieldType').setValue('string');
      this.form.get('field').get('control').get('formula').setValue('concatenate()');
    }
    if (this.form.get('field').get('control').get('operatorType').value === 'date') {
      this.form.get('field').get('control').get('fieldType').setValue('long');
      this.form.get('field').get('control').get('formula').setValue('');
      this.form.get('field').get('control').get('computeDateBy').setValue(null);
      this.form.get('field').get('control').get('leftDateField').setValidators(Validators.required);
      this.form.get('field').get('control').get('rightDateField').setValidators(Validators.required);
      this.form.get('field').get('control').get('computeDateBy').setValidators(Validators.required);
    } else {
      this.form.get('field').get('control').get('leftDateField').setValidators(null);
      this.form.get('field').get('control').get('rightDateField').setValidators(null);
      this.form.get('field').get('control').get('computeDateBy').setValidators(null);
    }
  }
  }

  getIndex(substring, string) {
    let a = [], i = -1;
    // tslint:disable-next-line: no-conditional-assignment
    while ((i = string.indexOf(substring, i + 1)) >= 0) { a.push(i); }
    return a;
  }

  formulaFieldValues() {
    const controlGroup = this.getControlFormGroup();
    controlGroup.get('formula').valueChanges.subscribe(data => {
      if (data.includes(' ')) {
        const startIndex = this.getIndex(' ', data);
        const endIndex = this.getIndex(' ', data);
        // if (startIndex.length !== endIndex.length) {
        this.formulaFieldList = this.data[11];
        // }
      }
    });
  }

  openMatMenu(event: MouseEvent) {
    if (event) {
      event.preventDefault();
      this.onTriggerContextMenu(event.clientX, event.clientY);
    }
  }

  checkOpenMatMenu(value: string) {
    if (value.lastIndexOf(' ') === value.length - 1) {
      this.contextmenu.openMenu();
    } else {
      this.contextmenu.openMenu();
      this.contextmenu.closeMenu();
    }
  }

  onTriggerContextMenu(x, y) {
    // const posX = e.clientX;
    // const posY = e.clientY;
    this.menuX = x - 50;
    this.menuY = y + 13;
    // if (this.formulaField && this.formulaField.nativeElement !== undefined) {
    //   this.onTriggerContextMenu(this.formulaField.nativeElement.offsetWidth, this.formulaField.nativeElement.offsetHeight);
    // }
    // this.contextmenu.closeMenu() // putting this does not work.
    this.contextmenu.openMenu();

  }

  loadControlType() {
    const controlGroup = this.getControlFormGroup();
    if (this.data[0].controlType === 'tel' || this.data[0].controlType === 'email') {
      this.form.get('field').get('dataType').setValue('string');
    }

    if (this.data[0].controlType === 'date') {
      this.form.get('field').get('dataType').setValue('date');
    }

    if (this.data[0].controlType === 'checkbox') {
      controlGroup.addControl('orientation', this.fb.control('', [Validators.required]));
      this.form.get('field').get('control').get('orientation').setValue('horizontal');
      if (this.data[0].field.control) {
        const form = this.form.get('field').get('control');
        if (this.data[0].field.control.orientation === 'horizontal') {
          form.get('orientation').setValue(true);
        } else {
          form.get('orientation').setValue(false);
        }

      }
    }

    if (this.data[0].controlType === 'userField') {
      controlGroup.addControl('allowLoggedInUser', this.fb.control(true));
      controlGroup.addControl('workspaceUser', this.fb.control(''));
      controlGroup.addControl('teams', this.fb.control([]));
      this.pageService.getUserGroupList().subscribe(data => {
        if (data) {
          this.groupList = data;
        }
      });
      controlGroup.get('teams').valueChanges.subscribe(data => {
        if (controlGroup.get('teams').value === undefined || controlGroup.get('teams')
        .value === null || controlGroup.get('teams').value.length === 0) {
          if (controlGroup.get('workspaceUser').value === false) {
            controlGroup.get('allowLoggedInUser').setValue(true);
          }
        } else {
          controlGroup.get('allowLoggedInUser').setValue(false);
          controlGroup.get('workspaceUser').setValue(false);
        }
      });
    }
    if (this.data[0].controlType === 'computeFields') {
      // if (this.data[11] && this.data[11].length >= 2) {
      controlGroup.addControl('fieldType', this.fb.control('', [Validators.required]));
      controlGroup.addControl('formula', this.fb.control(''));
      controlGroup.addControl('operatorType', this.fb.control(''));
      controlGroup.addControl('leftDateField', this.fb.control(''));
      controlGroup.addControl('rightDateField', this.fb.control(''));
      controlGroup.addControl('computeDateBy', this.fb.control(''));
      controlGroup.addControl('formulaFields', this.fb.control([]));
      if (this.data[0].field.control) {
        controlGroup.get('fieldType').patchValue(this.data[0].field.control.fieldType);
        controlGroup.get('formula').patchValue(this.data[0].field.control.formula);
        controlGroup.get('operatorType').patchValue(this.data[0].field.control.operatorType);
        controlGroup.get('leftDateField').patchValue(this.data[0].field.control.leftDateField);
        controlGroup.get('rightDateField').patchValue(this.data[0].field.control.rightDateField);
        controlGroup.get('computeDateBy').patchValue(this.data[0].field.control.computeDateBy);
        controlGroup.get('formulaFields').patchValue(this.data[0].field.control.formulaFields);
      }
      this.formulaFieldValues();
      // }


    }

    if (this.data[0].controlType === 'currency') {
      controlGroup.addControl('searchCurrency', this.fb.control(''));
      controlGroup.addControl('currencyCode', this.fb.control('', [Validators.required]));
      if (this.data[0].field.control) {
        controlGroup.get('currencyCode').setValue(this.data[0].field.control.currencyCode);
        // controlGroup.addControl('currencyCode', this.fb.control(this.data[0].field.currencyCode,[Validators.required]));
      }

    }


    if (this.data[0].controlType === 'select' ||
      this.data[0].controlType === 'multipleselect' || this.data[0].controlType === 'radiobutton' || this.data[0].controlType === 'imagegrid'
      || this.data[0].controlType === 'card') {
      if (this.data[0].controlType === 'imagegrid') {
        controlGroup.addControl('imageGridLabel', this.fb.control('', [Validators.required]));
        // controlGroup.addControl('imageGridName', this.fb.control(''));
        controlGroup.addControl('noOfRows', this.fb.control('', [Validators.required, Validators.max(10)]));
        controlGroup.addControl('noOfColumns', this.fb.control('', [Validators.required, Validators.max(10)]));
        controlGroup.addControl('height', this.fb.control('', [Validators.required, Validators.max(500), Validators.min(10)]));
        controlGroup.addControl('width', this.fb.control('', [Validators.required, Validators.max(500), Validators.min(10)]));
        controlGroup.addControl('position', this.fb.control('', [Validators.required]));
        controlGroup.addControl('rowLevelSpace', this.fb.control('', [Validators.required, Validators.min(10), Validators.max(50)]));
        controlGroup.addControl('columnLevelSpace', this.fb.control('', [Validators.required, Validators.min(10), Validators.max(50)]));
        controlGroup.addControl('showImageGridLabel', this.fb.control(false));
        controlGroup.addControl('addOptions', this.fb.control(false));
        this.loadOptionsForGridImage = false;
        if (this.data[0].field.control) {
          controlGroup.get('imageGridLabel').setValue(this.data[0].field.control.imageGridLabel);
          // controlGroup.get('imageGridName').setValue(this.data[0].field.control.imageGridName);
          controlGroup.get('noOfRows').setValue(this.data[0].field.control.noOfRows);
          controlGroup.get('noOfColumns').setValue(this.data[0].field.control.noOfColumns);
          controlGroup.get('height').setValue(this.data[0].field.control.height);
          controlGroup.get('width').setValue(this.data[0].field.control.width);
          controlGroup.get('position').setValue(this.data[0].field.control.position);
          controlGroup.get('rowLevelSpace').setValue(this.data[0].field.control.rowLevelSpace);
          controlGroup.get('columnLevelSpace').setValue(this.data[0].field.control.columnLevelSpace);
          controlGroup.get('showImageGridLabel').setValue(this.data[0].field.control.showImageGridLabel);
          controlGroup.get('addOptions').patchValue(this.data[0].field.control.addOptions);
          this.loadOptionsForGridImage = this.data[0].field.control.addOptions;
          this.showCreateButton = false;
          this.changeDetectorRef.markForCheck();
        }
      }



      if (this.data[0].controlType === 'card') {
        controlGroup.addControl('borderColor', this.fb.control('#0078ff', [Validators.required]));
        controlGroup.addControl('hoverColor', this.fb.control('#0078ff', [Validators.required]));
        controlGroup.addControl('noOfRows', this.fb.control('', [Validators.required, Validators.max(10)]));
        controlGroup.addControl('noOfColumns', this.fb.control('', [Validators.required, Validators.max(10)]));
        if (this.data[0].field.control) {
          const form = this.form.get('field').get('control');
          form.get('borderColor').setValue(this.data[0].field.control.borderColor);
          form.get('hoverColor').setValue(this.data[0].field.control.hoverColor);
          form.get('noOfRows').setValue(this.data[0].field.control.noOfRows);
          form.get('noOfColumns').setValue(this.data[0].field.control.noOfColumns);
        }
      }
      if (this.onselectEnable === true) {
        this.form.get('field').get('onSelection').get('onSelectionChange').enable();
      } else {
        this.form.get('field').get('onSelection').get('onSelectionChange').disable();
      }
      if (this.data[0].field.control) {
        this.optionType = this.data[0].field.control.optionType;
      }
      controlGroup.addControl('optionType', this.fb.control('', [Validators.required]));
      if (this.data[0].controlType === 'radiobutton') {
        controlGroup.addControl('orientation', this.fb.control(''));
        this.form.get('field').get('control').get('orientation').setValue(true);
      }
      if (this.optionType === 's' || this.optionType === '') {
        controlGroup.addControl('optionsValues', this.fb.array([
          this.fb.group({
            code: [, [Validators.required]],
            description: [, [Validators.required]],
          })
        ]));

        if (this.data[0].field.control) {
          const form = this.form.get('field').get('control');
          form.get('optionType').setValue(this.data[0].field.control.optionType);
          if (this.data[0].controlType === 'radiobutton') {
            if (this.data[0].field.control.orientation === 'horizontal') {
              form.get('orientation').setValue(true);
            } else {
              form.get('orientation').setValue(false);
            }
          }
          if (this.data[0].field.control.optionsValues) {
            for (let i = 0; i < this.data[0].field.control.optionsValues.length; i++) {
              const index = '' + i;
              if (i > 0) {
                this.addOptions();
              }
              const form = (this.form.get('field').get('control').get('optionsValues') as FormArray).get(index);
              form.get('code').setValue(this.data[0].field.control.optionsValues[i].code);
              form.get('description').setValue(this.data[0].field.control.optionsValues[i].description);
            }
          }
        }

      } else if (this.optionType === 'd') {
        this.showErrorMsg = true;
        controlGroup.addControl('optionType', this.fb.control('', []));
        controlGroup.addControl('filter', this.fb.group({}));
        if (this.data[0].controlType !== 'imagegrid') {
          controlGroup.addControl('defaultValues', this.fb.group({}));
        }


        const selectGroup = this.form.get('field').get('control').get('filter') as FormGroup;
        selectGroup.addControl('pageName', this.fb.control('', [Validators.required]));
        selectGroup.addControl('tableName', this.fb.control(''));
        selectGroup.addControl('keyColumnName', this.fb.control('', [Validators.required]));
        selectGroup.addControl('descriptionColumnName', this.fb.control('', [Validators.required]));
        selectGroup.addControl('sortOption', this.fb.control(false));
        selectGroup.addControl('sortBy', this.fb.array([this.sortOptionFormArray()]));
        selectGroup.addControl('loadFirstOption', this.fb.control(false));
        selectGroup.addControl('filterOptions', this.fb.control(false));
        selectGroup.addControl('joinClause', this.fb.control('', []));
        selectGroup.addControl('version', this.fb.control(''));


        if (this.data[0].controlType !== 'imagegrid') {
          const defaultGroup = this.form.get('field').get('control').get('defaultValues') as FormGroup;
          defaultGroup.addControl('defaultValue', this.fb.control('', []));
          defaultGroup.addControl('keyValue', this.fb.control('', []));
          defaultGroup.addControl('descValue', this.fb.control('', []));
        }
        this.loadDynamicPageName();
        if (this.data[0].field.control && this.data[0].field.control.filter) {
          this.loadDynamicPageName();
          const form = this.form.get('field').get('control');

          form.get('optionType').setValue(this.data[0].field.control.optionType);
          if (this.data[0].controlType === 'radiobutton') {
            if (this.data[0].field.control.orientation === 'horizontal') {
              form.get('orientation').setValue(true);
            } else {
              form.get('orientation').setValue(false);
            }
          }
          const dynamic = form.get('filter') as FormGroup;
          const filters = this.data[0].field.control.filters;
          dynamic.get('pageName').setValue(this.data[0].field.control.filter.pageName);
          const tableName = this.data[0].field.control.filter.tableName;
          const version = this.data[0].field.control.filter.version;
          dynamic.get('tableName').setValue(tableName);
          dynamic.get('version').setValue(version);
          dynamic.get('sortOption').setValue(this.data[0].field.control.filter.sortOption);
          if (this.data[0].field.control.filter.sortOption) {
            this.sortOptionBoolean = true;
          } else {
            this.sortOptionBoolean = false;
          }
          dynamic.get('loadFirstOption').setValue(this.data[0].field.control.filter.loadFirstOption);
          this.loadTargetPageColumns(tableName, version);
          if (this.data[0].field.control.filter.sortBy) {
            for (let i = 0; i < this.data[0].field.control.filter.sortBy.length; i++) {
              const index = '' + i;
              if (i > 0) {
                this.addSortOptions();
              }
              const form = (this.form.get('field').get('control').get('filter').get('sortBy') as FormArray).get(index);
              form.get('sortColumnName').setValue(this.data[0].field.control.filter.sortBy[i].sortColumnName);
              form.get('sortType').setValue(this.data[0].field.control.filter.sortBy[i].sortType);
            }
          }
          dynamic.get('joinClause').setValue(this.data[0].field.control.filter.joinClause);
          if (filters !== undefined && filters !== null && filters.length > 0) {
            this.filterOptionBoolean = true;
            dynamic.get('filterOptions').setValue(true);
          } else {
            this.filterOptionBoolean = false;
            dynamic.get('filterOptions').setValue(false);
          }
        }
        if (this.data[0].field && this.data[0].field.onSelection) {
          if (this.data[0].field.onSelection.onSelectionChange === true) {

            const onSelection = this.form.get('field').get('onSelection') as FormGroup;
            this.onselection = true;
            onSelection.get('onSelectionChange').setValue(true);
            this.loadDynamicPageNameForOnSelection();
            if (this.data[0].field.onSelection.fieldType !== undefined) {
              onSelection.get('fieldType').setValue(this.data[0].field.onSelection.fieldType);
              this.setFieldTypeValidation(onSelection);
              if (this.data[0].field.onSelection.fieldType === 'goToPage') {
                this.goToPage = true;
                this.loadDynamicPageNameForOnSelection();
                this.loadTargetPageColumnsForOnSelection(this.data[0].field.onSelection.targetPageId,
                  this.data[0].field.onSelection.version);
                this.setGotoPageValidation(onSelection);
                onSelection.get('targetPageId').setValue(this.data[0].field.onSelection.targetPageId);
                onSelection.get('targetPageName').setValue(this.data[0].field.onSelection.targetPageName);
                onSelection.get('passParameter').setValue(this.data[0].field.onSelection.passParameter);
                onSelection.get('pageType').setValue(this.data[0].field.onSelection.pageType);
                onSelection.get('version').setValue(this.data[0].field.onSelection.version);
              } else if (this.data[0].field.onSelection.fieldType === 'loadData') {
                onSelection.get('loadDataLabel').setValue(this.data[0].field.onSelection.loadDataLabel);
              }
            }

          }
        }
        if (this.data[0].field.control && this.data[0].field.control.defaultValues !== undefined
          && this.data[0].field.control.defaultValues !== null
        ) {

          if (this.data[0].controlType !== 'imagegrid' &&
            this.data[0].field.control.defaultValues.defaultValue === true) {
            this.defaultValue = true;
            const defaultGroup = this.form.get('field').get('control').get('defaultValues') as FormGroup;
            defaultGroup.get('defaultValue').setValue(this.data[0].field.control.defaultValues.defaultValue);
            defaultGroup.get('keyValue').setValue(this.data[0].field.control.defaultValues.keyValue);
            defaultGroup.get('descValue').setValue(this.data[0].field.control.defaultValues.descValue);
          }

        } else {
        }

      }
    } else if (this.data[0].controlType === 'button') {

      controlGroup.addControl('buttonType', this.fb.control('', []));
      controlGroup.addControl('screenType', this.fb.control('', []));
      controlGroup.addControl('parameterFieldNames', this.fb.control('', []));
      controlGroup.addControl('targetPageName', this.fb.control('', []));
      controlGroup.addControl('targetPageId', this.fb.control('', []));
      controlGroup.addControl('webServiceCallUrl', this.fb.control('', []));
      controlGroup.addControl('workflowName', this.fb.control('', []));
      controlGroup.addControl('workflowVersion', this.fb.control('latest', []));
      controlGroup.addControl('workflowKey', this.fb.control('', []));
      controlGroup.addControl('saveAndCallWorkflow', this.fb.control(false));
      controlGroup.addControl('version', this.fb.control(''));

      if (this.isWorkflowForm) {
        this.form.get('field').get('control').get('targetPageId').setErrors(null);
        this.form.get('field').get('control').get('parameterFieldNames').setErrors(null);
      }

      if (this.data[7] === 'publicForm') {
        controlGroup.addControl('allignment', this.fb.control('end end', [Validators.required]));
      }

      if (this.data[0].field.control) {
        const form = this.form.get('field').get('control');
        form.get('buttonType').setValue(this.data[0].field.control.buttonType);
        if (this.data[7] === 'publicForm' && this.data[0].field.control && this.data[0].field.control.allignment) {
          form.get('allignment').setValue(this.data[0].field.control.allignment);
        }
        if (this.data[0].field.control.buttonType === 'action') {
          this.selectedButtonAction = 'action';
          this.webServiceAction({ value: this.data[0].field.control.screenType });
          if (this.data[0].field.control.screenType === 'webServiceCall') {
            this.webServiceEnable = true;
          } else {
            this.webServiceEnable = false;
          }

          if (this.data[0].field.control.screenType === 'callWorkflow') {
            this.callWorkflow = true;
            this.loadWorkFlowList();
          } else {
            this.callWorkflow = false;
          }
        }
        form.get('screenType').setValue(this.data[0].field.control.screenType);
        form.get('parameterFieldNames').setValue(this.data[0].field.control.parameterFieldNames);
        form.get('targetPageName').setValue(this.data[0].field.control.targetPageName);
        form.get('targetPageId').setValue(this.data[0].field.control.targetPageId);
        form.get('webServiceCallUrl').patchValue(this.data[0].field.control.webServiceCallUrl);
        form.get('saveAndCallWorkflow').patchValue(this.data[0].field.control.saveAndCallWorkflow);
        form.get('version').setValue(this.data[0].field.control.version);
      }
    } else if (this.data[0].controlType === 'grid') {
      controlGroup.addControl('gridId', this.fb.control('', [Validators.required]));
      controlGroup.addControl('numberOfClicks', this.fb.control('', []));
      controlGroup.addControl('screenType', this.fb.control('', []));
      controlGroup.addControl('targetPageId', this.fb.control({ value: this.data[3], disabled: true }));
      controlGroup.addControl('version', this.fb.control(''));
      this.loadGridName();
      this.loadPageNameByIdentifier();
      if (this.data[0].field.control) {
        const form = this.form.get('field').get('control');
        form.get('gridId').setValue(this.data[0].field.control.gridId);
        form.get('numberOfClicks').setValue(this.data[0].field.control.numberOfClicks);
        form.get('screenType').setValue(this.data[0].field.control.screenType);
        form.get('targetPageId').setValue(this.data[0].field.control.targetPageId);
        form.get('targetPageId').disable();
        form.get('version').setValue(this.data[0].field.control.version);
        if (form.get('gridId').value) {
          this.updateCancel = true;
        }
      }

    } else if (this.data[0].controlType === 'autocomplete') {
      controlGroup.addControl('pageType', this.fb.control('', [Validators.required]));
      controlGroup.addControl('pageName', this.fb.control('', [Validators.required]));
      controlGroup.addControl('tableName', this.fb.control(''));
      controlGroup.addControl('keyColumnName', this.fb.control('', [Validators.required]));
      controlGroup.addControl('descriptionColumnName', this.fb.control('', [Validators.required]));
      controlGroup.addControl('orderBy', this.fb.control('asc', [Validators.required]));
      controlGroup.addControl('autoCompleteColumnName', this.fb.control('', [Validators.required]));
      controlGroup.addControl('filterOptions', this.fb.control(''));
      controlGroup.addControl('fieldNameToBeLoaded', this.fb.control(''));
      controlGroup.addControl('version', this.fb.control(''));
      this.form.get('field').get('control').get('pageType').valueChanges.subscribe(data => {
        if (data) {
          this.loadDynamicPageNameForAutocomplete();
          this.autocompletePage = data;
        }
      });
      if (this.data[0].field.control) {
        const form = this.form.get('field').get('control');
        form.get('pageType').setValue(this.data[0].field.control.pageType);
        form.get('pageName').setValue(this.data[0].field.control.pageName);
        if (this.data[0].field.control.pageType === 'dynamicPage') {
          const tableName = this.data[0].field.control.tableName;
          const version = this.data[0].field.control.version;
          form.get('version').setValue(version);
          this.loadTargetPageColumns(tableName, version);
          form.get('tableName').setValue(tableName);
        } else if (this.data[0].field.control.pageType === 'customPage') {
          this.loadPageFieldsForAutocomplete(this.data[0].field.control.tableName);
          form.get('tableName').setValue(this.data[0].field.control.tableName);
        }
        const filters = this.data[0].field.control.filters;
        if (filters !== undefined && filters !== null && filters.length > 0) {
          this.filterOptionBoolean = true;
          form.get('filterOptions').setValue(true);
        } else {
          this.filterOptionBoolean = false;
          form.get('filterOptions').setValue(false);
        }
      }
    } else if (this.data[0].controlType === 'tabbedmenu') {
      controlGroup.addControl('menuId', this.fb.control('', [Validators.required]));
      controlGroup.addControl('menuOrientation', this.fb.control('', [Validators.required]));
      controlGroup.addControl('parameterControlName', this.fb.control(''));
      this.loadMenuList();
      if (this.data[0].field.control) {
        controlGroup.get('menuOrientation').setValue(this.data[0].field.control.menuOrientation);
        controlGroup.get('parameterControlName').setValue(this.data[0].field.control.parameterControlName);
        if (this.data[0].field.control.menuOrientation) {
          this.showCreateButton = false;
        }
      }
    } else if (this.data[0].controlType === 'fileupload') {
      controlGroup.addControl('fileType', this.fb.control('', [Validators.required]));
      controlGroup.addControl('fileSize', this.fb.control('', [Validators.required, Validators.max(50000), Validators.min(50)]));
      controlGroup.addControl('allowToUploadMultipleFiles', this.fb.control(false));
      controlGroup.addControl('isDynamicFile', this.fb.control(false));
      if (this.data[0].field.control) {
        controlGroup.get('fileType').setValue(this.data[0].field.control.fileType);
        controlGroup.get('fileSize').setValue(this.data[0].field.control.fileSize);
        controlGroup.get('allowToUploadMultipleFiles').setValue(this.data[0].field.control.allowToUploadMultipleFiles);
        controlGroup.get('isDynamicFile').setValue(this.data[0].field.control.isDynamicFile);
        if (this.data[0].field.control.fileType) {
          this.showCreateButton = false;
        }
        if (this.data[0].field.control.fileType.includes('any')) {
          controlGroup.get('fileType').setValue(['any']);
          this.hideOptions = true;
          this.selectedFiles.push('any');
        }
        // this.selectedFiles = [];
        // if (this.data[0].field.control.fileType !== undefined && this.data[0].field.control.fileType !== null) {
        //   if (this.data[0].field.control.fileType === 'image') {
        //     this.selectedFiles.push({ name: 'Image', value: 'image/*' });
        //   } else if (this.data[0].field.control.fileType === 'pdf') {
        //     this.selectedFiles.push({ name: 'PDF', value: '.pdf' });
        //   } else if (this.data[0].field.control.fileType === 'xlsx') {
        //     this.selectedFiles.push({ name: 'XLSX', value: '.xlsx' });
        //   } else {
        //     for (let i = 0; i < this.files.length; i++) {
        //       this.data[0].field.control.fileType.forEach(element => {
        //         if (element === this.files[i].value) {
        //           this.selectedFiles.push(this.files[i]);
        //         }
        //       });
        //     }
        //   }
        // }
      }
    } else if (this.data[0].controlType === 'hyperlink') {
      controlGroup.addControl('hyperLink', this.fb.array([this.getHyperLinkFormGroup()]));
      if (this.data[0].field.control && this.data[0].field.control.hyperLink) {
        this.showCreateButton = false;
        const hyperLinks: HyperLink[] = this.data[0].field.control.hyperLink;
        for (let i = 0; i < hyperLinks.length; i++) {
          const index = '' + i;
          if (i > 0) {
            this.addHyperLinkFormGroupToArray();
          }
          this.getHyperLinkFormArray().get(index).setValue(hyperLinks[i]);
        }
      }
    } else if (this.data[0].controlType === 'page') {
      controlGroup.addControl('pageId', this.fb.control('', [Validators.required]));
      controlGroup.addControl('version', this.fb.control('', [Validators.required]));
      controlGroup.addControl('pageName', this.fb.control(''));
      if (this.data[0].field.control) {
        this.appPageId = this.data[0].field.control.pageId;
        controlGroup.get('pageId').setValue(this.data[0].field.control.pageName);
        controlGroup.get('version').setValue(this.data[0].field.control.version);
      }
    } else if (this.data[0].controlType === 'password') {
      controlGroup.addControl('isConfirmPassword', this.fb.control(false, [Validators.required]));
      controlGroup.addControl('passwordFieldName', this.fb.control(''));
      controlGroup.addControl('passwordfieldLabelName', this.fb.control(''));
      if (this.data[0].field.control) {
        controlGroup.get('isConfirmPassword').setValue(this.data[0].field.control.isConfirmPassword);
        controlGroup.get('passwordFieldName').setValue(this.data[0].field.control.passwordFieldName);
        controlGroup.get('passwordfieldLabelName').setValue(this.data[0].field.control.passwordfieldLabelName);
        if (this.data[0].field.control.isConfirmPassword === true) {
          this.enablePasswordFiledName = true;
        }
      }
      if (this.data[8].length > 0 &&
        this.data[8].some(option => this.form.get('field').get('name').value !== option.name)) {
        this.enableConfirmpassword = true;
        this.enableIsConfirmPassword = true;
      } else {
        this.enableIsConfirmPassword = false;
      }
    } else if (this.data[0].controlType === 'paragraph') {
      controlGroup.addControl('paragraph', this.fb.control('', [Validators.required]));
      if (this.data[0].field.control) {
        controlGroup.get('paragraph').setValue(this.data[0].field.control.paragraph);
        if (this.data[0].field.control.paragraph) {
          this.showCreateButton = false;
        }
      }
    } else if (this.data[0].controlType === 'input') {
      if (this.data[11] && this.data[11].length > 1) {
        controlGroup.addControl('operator', this.fb.control('', [Validators.required]));
        controlGroup.addControl('variableArray', this.fb.array([this.fb.group({
          dataType: [''],
          variableType: ['pagefield', [Validators.required]],
          variableName: ['', [Validators.required]]
        })
        ]));
        controlGroup.addControl('enableCompute', this.fb.control(''));
        this.isEnableCompute = true;
        if (!this.data[0].field.control) {
          this.addVariables();
        }
      } else {
        this.isComputationEnable = false;
        this.isEnableCompute = false;
      }
      if (this.data[0].field.enableHyperlink === true) {
        this.addFormControlsForHyperLinkEnable(controlGroup);
        if (this.data[0].field.control) {
          const tableName = this.data[0].field.control.targetPageId;
          const form = this.form.get('field').get('control');
          form.get('screenType').setValue(this.data[0].field.control.screenType);
          form.get('targetPageName').setValue(this.data[0].field.control.targetPageName);
          form.get('targetPageId').setValue(this.data[0].field.control.targetPageId);
          form.get('version').setValue(this.data[0].field.control.version);
          this.loadTargetPageColumns(tableName, 1);
        }
      }
      if (this.data[0].field.control && this.data[11] && this.data[11].length > 1) {
        this.form.get('field').get('control').get('enableCompute').setValue(this.data[0].field.control.enableCompute);
      }
      if (this.data[11] && this.data[11].length > 1 && this.data[0].field.control && this.data[0].field.dataType !== 'string') {
        this.form.get('field').get('control').get('operator').setValue(this.data[0].field.control.operator);
        if (this.data[0].field.control.variableArray) {
          this.isComputationEnable = true;
          if (this.data[0].field.control.operator === 'division') {
            this.isLogicEnable = true;
          }
          for (let i = 0; i < this.data[0].field.control.variableArray.length; i++) {
            const index = '' + i;
            if (i > 0) {
              this.addVariables();
            }
            const variableArray = (this.form.get('field').get('control').get('variableArray') as FormArray).get(index);
            variableArray.get('dataType').setValue(this.data[0].field.control.variableArray[i].dataType);
            variableArray.get('variableType').setValue(this.data[0].field.control.variableArray[i].variableType);
            variableArray.get('variableName').setValue(this.data[0].field.control.variableArray[i].variableName);
          }
        }
      }
    } else if (this.data[0].controlType === 'chip') {
      const form = this.form.get('field');
      form.get('chipSize').setValidators([Validators.required, Validators.min(1)]);
      if (this.data[0].field) {
        form.get('chipSize').setValue(this.data[0].field.chipSize);
      }
    } else if (this.data[0].controlType === 'table') {
      controlGroup.addControl('tableName', this.fb.control('', [Validators.required]));
      controlGroup.addControl('tableId', this.fb.control('', [Validators.required]));
      controlGroup.addControl('noOfRows', this.fb.control('', [Validators.required]));
      controlGroup.addControl('headerOrientation', this.fb.control({ value: 'top', disabled: true }, [Validators.required]));
      controlGroup.addControl('isChildTable', this.fb.control(false));
      controlGroup.addControl('enableSequenceNumberForExcel', this.fb.control(false));
      controlGroup.addControl('headerColor', this.fb.control('#72cffd'));
      controlGroup.addControl('borderStyle', this.fb.control('', [Validators.required]));
      controlGroup.addControl('columns', this.fb.array([this.getColumnObjectFormGroup()]));
      controlGroup.addControl('computeFields', this.fb.control(''));
      controlGroup.addControl('enableSequnceNumber', this.fb.control(''));
      controlGroup.addControl('enableColumnLevelComputation', this.fb.group({
        option: [false, [Validators.required]],
      }));
      controlGroup.addControl('enableRowLevelComputation', this.fb.group({
        option: [false, [Validators.required]],
      }));
      if (this.data[0].field.control && this.data[0].field.control.columns) {
        this.showCreateButton = false;
        const form = this.form.get('field').get('control');
        form.get('tableName').setValue(this.data[0].field.control.tableName);
        form.get('tableId').setValue(this.data[0].field.control.tableId);
        form.get('noOfRows').setValue(this.data[0].field.control.noOfRows);
        form.get('headerOrientation').setValue(this.data[0].field.control.headerOrientation);
        form.get('isChildTable').setValue(this.data[0].field.control.isChildTable);
        form.get('enableSequnceNumber').patchValue(this.data[0].field.control.enableSequnceNumber);
        form.get('borderStyle').patchValue(this.data[0].field.control.borderStyle);
        form.get('headerColor').patchValue(this.data[0].field.control.headerColor);
        form.get('enableSequenceNumberForExcel').patchValue(this.data[0].field.control.enableSequenceNumberForExcel);
        if (this.data[0].field.control.enableColumnLevelComputation) {
          const columnLevelComputation = form.get('enableColumnLevelComputation');
          columnLevelComputation.get('option').setValue(this.data[0].field.control.enableColumnLevelComputation.option);
          if (this.data[0].field.control.enableColumnLevelComputation.option === true) {
            this.getTableComputationFormGroup('enableColumnLevelComputation');
            columnLevelComputation.get('computationFieldName')
              .setValue(this.data[0].field.control.enableColumnLevelComputation.computationFieldName);
            columnLevelComputation.get('computationLabelName')
              .setValue(this.data[0].field.control.enableColumnLevelComputation.computationLabelName);
            columnLevelComputation.get('operatorType').setValue(this.data[0].field.control.enableColumnLevelComputation.operatorType);
          }
        }
        if (this.data[0].field.control.enableRowLevelComputation) {
          const rowLevelComputation = form.get('enableRowLevelComputation');
          rowLevelComputation.get('option').setValue(this.data[0].field.control.enableRowLevelComputation.option);
          if (this.data[0].field.control.enableRowLevelComputation.option === true) {
            this.getTableComputationFormGroup('enableRowLevelComputation');
            rowLevelComputation.get('computationFieldName')
              .setValue(this.data[0].field.control.enableRowLevelComputation.computationFieldName);
            rowLevelComputation.get('computationLabelName')
              .setValue(this.data[0].field.control.enableRowLevelComputation.computationLabelName);
            rowLevelComputation.get('operatorType').setValue(this.data[0].field.control.enableRowLevelComputation.operatorType);
            rowLevelComputation.get('rowWidth').patchValue(this.data[0].field.control.enableRowLevelComputation.rowWidth);
          }
        }
        const columns: any[] = this.data[0].field.control.columns;
        const fieldNameArr = new FieldName();
        for (let i = 0; i < columns.length; i++) {
          const index = '' + i;
          if (i > 0) {
            this.addColumns(i);
          }
          this.getColumnsFormArray().get(index).patchValue(columns[i]);
          this.setCondtionalFieldsForTableColumns(this.getColumnsFormArray().get(index) as FormGroup, i);
          this.addComputeFields(i);
          if (columns[i].field && columns[i].field.conditionalChecks && columns[i].field.conditionalChecks.required) {
            const requiredFieldValueArray: any[] = columns[i].field.conditionalChecks.required.fields;
            for (let j = 0; j < requiredFieldValueArray.length; j++) {
              this.addRequiredConditionalChecksArrayInTableColumns(i);
              const requiredForm = (this.getTableControlRequiredValidationFormArray(i).get(j + '')) as FormGroup;
              requiredForm.setValue(requiredFieldValueArray[j]);
            }
          }
          if (columns[i].field.optionsValues && columns[i].field.optionsValues.length > 0) {
            const array = this.getColumnsFormArray().get(index).get('field').get('optionsValues') as FormArray;
            const values: any[] = columns[i].field.optionsValues;
            for (let i = 0; i < values.length; i++) {
              const index = i + '';
              array.push(this.optionValueFormArray())
              array.get(index).setValue(values[i]);
            }
          }
        }
        form.get('computeFields').patchValue(this.data[0].field.control.computeFields);
      }
    } else if (this.data[0].controlType === 'image') {
      controlGroup.addControl('image', this.fb.control('', [Validators.required]));
      controlGroup.addControl('height', this.fb.control('', [Validators.required, Validators.max(500), Validators.min(10)]));
      controlGroup.addControl('width', this.fb.control('', [Validators.required, Validators.max(500), Validators.min(10)]));
      controlGroup.addControl('imagePosition', this.fb.control('', [Validators.required]));
      controlGroup.addControl('isDynamicImage', this.fb.control(false));
      if (this.data[0].field.control) {
        controlGroup.get('image').setValue(this.data[0].field.control.image);
        controlGroup.get('height').setValue(this.data[0].field.control.height);
        controlGroup.get('width').setValue(this.data[0].field.control.width);
        controlGroup.get('imagePosition').setValue(this.data[0].field.control.imagePosition);
        controlGroup.get('isDynamicImage').setValue(this.data[0].field.control.isDynamicImage);
        if (controlGroup.get('isDynamicImage').value === true) {
          controlGroup.get('image').setValidators(null);
        }
        this.showCreateButton = false;
        this.previewUrl = this.data[0].field.control.image;
        if (this.previewUrl) {
          this.isLoad = true;
        }
        this.transform();
        this.changeDetectorRef.markForCheck();
      }
    } else if (this.data[0].controlType === 'shoppingcart') {
      controlGroup.addControl('shoppingCartId', this.fb.control(''));
      controlGroup.addControl('shoppingCartName', this.fb.control('', [Validators.required]));
      controlGroup.addControl('shoppingCartLabel', this.fb.control(''));
      controlGroup.addControl('shoppingCartJson', this.fb.control(''));
      this.loadShoppingCartName();
      if (this.data[0].field.control) {
        const form = this.form.get('field').get('control');
        form.get('shoppingCartId').setValue(this.data[0].field.control.shoppingCartId);
        form.get('shoppingCartName').setValue(this.data[0].field.control.shoppingCartName);
        form.get('shoppingCartLabel').setValue(this.data[0].field.control.shoppingCartLabel);
        form.get('shoppingCartJson').setValue(this.data[0].field.control.shoppingCartJson);
        this.showCreateButton = false;
      }

    }
  }




  setDynamicImage(event) {
    if (event.checked === true) {
      this.form.get('field').get('control').get('image').setValidators(null);
      this.form.get('field').get('control').get('image').setValue(null);
    } else {
      this.form.get('field').get('control').get('image').setValidators([Validators.required]);
      this.form.get('field').get('control').get('image').updateValueAndValidity();
    }
  }

  addOptionsForGridImage(event) {
    const form = this.getControlFormGroup();
    if (form.get('addOptions').value === true) {
      this.loadOptionsForGridImage = true;
    }
    if (form.get('addOptions').value === false) {
      this.loadOptionsForGridImage = false;
      const control = this.form.get('field').get('control') as FormGroup;
      if (control.get('optionsValues') !== undefined && control.get('optionsValues') !== null) {
        control.removeControl('optionsValues');
      }
      if (control.get('filter')) {
        control.removeControl('filter');
      }
      if (control.get('filters')) {
        control.removeControl('filters');
      }
    }
  }

  fileTypeChage(event: MatSelectChange): void {
    if (this.form.get('field').get('control').get('fileType').value === undefined
      || this.form.get('field').get('control').get('fileType').value === null
      || this.form.get('field').get('control').get('fileType').value.length === 0) {
      this.hideOptions = false;
    } else if (this.form.get('field').get('control').get('fileType').value.includes('any')) {
      this.form.get('field').get('control').get('fileType').setValue(['any']);
      this.hideOptions = true;
    } else {
      this.hideOptions = false;
    }

  }


  generateTableId() {
    this.form.get('field').get('control').get('tableId').setValue(this.camelize(this.form.get('field.control.tableName').value));
  }

  generateRowComputationFieldName() {
    this.form.get('field').get('control').get('enableRowLevelComputation').get('computationFieldName')
      .setValue(this.camelize(this.form.get('field.control.enableRowLevelComputation.computationLabelName').value));
  }

  generateColumnComputationFieldName() {
    this.form.get('field').get('control').get('enableColumnLevelComputation').get('computationFieldName')
      .setValue(this.camelize(this.form.get('field.control.enableColumnLevelComputation.computationLabelName').value));
  }

  getTableComputationFormGroup(computationType) {
    const form = this.form.get('field').get('control');
    if (this.form.get('field').get('control').get(computationType).get('option').value === true) {
      const computeGroup = this.form.get('field').get('control').get(computationType) as FormGroup;
      computeGroup.addControl('computationFieldName', this.fb.control(''));
      computeGroup.addControl('computationLabelName', this.fb.control(''));
      computeGroup.addControl('operatorType', this.fb.control(''));
      if (computationType === 'enableRowLevelComputation') {
        computeGroup.addControl('rowWidth', this.fb.control('', [Validators.required, Validators.min(1), Validators.max(100)]));
      }
      form.get('computeFields').setValidators(Validators.required);
    } else if (this.form.get('field').get('control').get(computationType).get('option').value === false) {
      const computeGroup = this.form.get('field').get('control').get(computationType) as FormGroup;
      computeGroup.removeControl('computationFieldName');
      computeGroup.removeControl('computationLabelName');
      computeGroup.removeControl('operatorType');
      if (computationType === 'enableRowLevelComputation') {
        computeGroup.removeControl('rowWidth');
      }
      form.get('computeFields').setValue(null);
      form.get('computeFields').setValidators(null);
      form.get('computeFields').setErrors(null);
      form.get('computeFields').updateValueAndValidity();
    }
  }

  getColumnObjectFormGroup() {
    return this.fb.group({
      controlType: [''],
      field: this.fb.group({
        name: [{ value: '', disabled: true }, [Validators.required]],
        dataType: ['', [Validators.required]],
        required: [false],
        editable: [true],
        label: this.fb.group({
          labelName: ['', [Validators.required, this.noWhitespaceValidator]],
        }),
        dateFormat: [''],
        allowPastDate: [false],
        allowFutureDate: [false],
        control: this.fb.group({
          columnWidth: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
          columnHeaderAlignment: ['', [Validators.required]],
          textFieldType: ['textField']
        }),
        minLength: [''],
        maxLength: [''],
        optionType: '',
        optionsValues: this.fb.array([
        ]),
        conditionalChecks: this.fb.group({
          enable: this.fb.group({
            option: [],
            fields: this.fb.array([]),
          }),
          show: this.fb.group({
            option: [],
            fields: this.fb.array([]),
          }),
          required: this.fb.group({
            option: [],
            fields: this.fb.array([]),
          }),
        })
      })
    });
  }

  public noWhitespaceValidator(control: FormControl) {
    if (control.value !== null) {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { 'whitespace': true };
    }

  }

  setControlTypeForTable(i, dataType) {
    if (dataType === 'date') {
      this.getColumnsFormArray().get('' + i).get('controlType').setValue('date');
    } else if (dataType === 'textarea') {
      this.getColumnsFormArray().get('' + i).get('controlType').setValue('textarea');
    } else if (dataType === 'telephone') {
      this.getColumnsFormArray().get('' + i).get('controlType').setValue('tel');
    } else if (dataType === 'email') {
      this.getColumnsFormArray().get('' + i).get('controlType').setValue('email');
    } else if (dataType === 'boolean') {
      this.getColumnsFormArray().get('' + i).get('controlType').setValue('checkbox');
    } else if (dataType === 'select') {
      this.getColumnsFormArray().get('' + i).get('controlType').setValue('select');
    } else if (dataType === 'multipleselect') {
      this.getColumnsFormArray().get('' + i).get('controlType').setValue('multipleselect');
    } else if (dataType === 'radiobutton') {
      this.getColumnsFormArray().get('' + i).get('controlType').setValue('radiobutton');
    } else {
      this.getColumnsFormArray().get('' + i).get('controlType').setValue('input');
    }
    const columnName = this.getColumnsFormArray().get('' + i).get('field').get('label').get('labelName').value;
    if (columnName !== null && columnName !== '' && dataType !== '' && dataType !== null && dataType !== 'string' && dataType !== 'date') {
      const updateFieldName = this.getColumnsFormArray().get('' + i).get('field').get('name').value;
      const fieldNameArr = new FieldName();
      fieldNameArr.label = columnName;
      fieldNameArr.name = updateFieldName;
      const removeIndex = this.fieldName.findIndex(x => x.name === updateFieldName);
      if (removeIndex !== -1) {
        this.fieldName.splice(removeIndex, 1, fieldNameArr);
      } else {
        this.fieldName.push(fieldNameArr);
      }
    }
  }

  colorPicker(color) {
  }

  getColumnsFormArray() {
    return (this.form.get('field').get('control').get('columns') as FormArray);
  }

  addColumns(i) {
    this.getColumnsFormArray().push(this.getColumnObjectFormGroup());
    this.form.markAsDirty();
    this.addComputeFields(i);
  }

  addHeaderName() {

  }
  removeColumns(i: number) {
    this.getColumnsFormArray().removeAt(i);
    if (this.getColumnsFormArray().length === 0) {
      this.addColumns(i);
    }
    this.form.markAsDirty();
  }

  generateColumnName(i: number) {
    const columnName = this.getColumnsFormArray().get('' + i).get('field').get('label').get('labelName').value;
    this.getColumnsFormArray().get('' + i).get('field').get('name').setValue(this.camelize(columnName));
    const dataType = this.getColumnsFormArray().get('' + i).get('field').get('dataType').value;
    if (columnName !== null && columnName !== '' && dataType !== '' && dataType !== null && dataType !== 'string' && dataType !== 'date') {
      const updateFieldName = this.getColumnsFormArray().get('' + i).get('field').get('name').value;
      const fieldNameArr = new FieldName();
      fieldNameArr.label = columnName;
      fieldNameArr.name = updateFieldName;
      const removeIndex = this.fieldName.findIndex(x => x.name === updateFieldName);
      if (removeIndex !== -1) {
        this.fieldName.splice(removeIndex, 1, fieldNameArr);
      } else {
        this.fieldName.push(fieldNameArr);
      }
    }
  }

  addComputeFields(i: number) {
    const columnName = this.getColumnsFormArray().get('' + i).get('field').get('label').get('labelName').value;
    const dataType = this.getColumnsFormArray().get('' + i).get('field').get('dataType').value;
    if (columnName !== null && columnName !== '' && dataType !== '' && dataType !== null && dataType !== 'string' && dataType !== 'date') {
      const updateFieldName = this.getColumnsFormArray().get('' + i).get('field').get('name').value;
      const fieldNameArr = new FieldName();
      fieldNameArr.label = columnName;
      fieldNameArr.name = updateFieldName;
      const removeIndex = this.fieldName.findIndex(x => x.name === updateFieldName);
      if (removeIndex !== -1) {
        this.fieldName.splice(removeIndex, 1, fieldNameArr);
      } else {
        this.fieldName.push(fieldNameArr);
      }
    }
  }

  setVersionForButtonAction(option, control: AbstractControl, pageId: AbstractControl) {
    control.setValue(option.version);
    pageId.setValue(option.pageId);
  }

  confirmPassword(event) {
    this.form.markAsDirty();
    const form = this.getControlFormGroup();
    if (event.checked === true && this.enableConfirmpassword) {
      this.enablePasswordFiledName = true;
      form.get('passwordFieldName').setValidators(Validators.required);
      form.get('passwordfieldLabelName').setValidators(Validators.required);
    } else {
      form.get('passwordFieldName').clearValidators();
      form.get('passwordfieldLabelName').clearValidators();
      form.get('passwordFieldName').updateValueAndValidity();
      form.get('passwordfieldLabelName').updateValueAndValidity();
      this.enablePasswordFiledName = false;
    }
    if (form.get('isConfirmPassword').value === true && this.data[8].length === 0) {
      form.get('isConfirmPassword').setErrors({ noPassword: true });
    } else {
      form.get('isConfirmPassword').setErrors(null);
    }
  }

  setPasswordLabelName(option, event) {
    if (event.isUserInput === true) {
      const form = this.getControlFormGroup();
      form.get('passwordFieldName').setValue(option.name);
      form.get('passwordfieldLabelName').setValue(option.label);
    }
  }

  getHyperLinkFormArray() {
    return this.getControlFormGroup().get('hyperLink') as FormArray;
  }

  addHyperLinkFormGroupToArray() {
    this.getHyperLinkFormArray().push(this.getHyperLinkFormGroup());
    this.validateFormArrayFieldsForHyperLink(this.getHyperLinkFormArray());
  }

  removeHyperLinkFormGroupFromArray(i) {
    this.getHyperLinkFormArray().removeAt(i);
    this.getHyperLinkFormArray().markAsDirty();
    this.validateFormArrayFieldsForHyperLink(this.getHyperLinkFormArray());
  }

  getHyperLinkFormGroup() {
    return this.fb.group({
      link: ['', [Validators.required]],
      linkName: ['', [Validators.required]]
    });
  }
  optionTypes() {
    if ((this.data[0].controlType === 'select' || this.data[0].controlType === 'imagegrid' || this.data[0].controlType === 'multipleselect' || this.data[0].controlType === 'radiobutton') && this.data[0].field.control) {
      if (this.data[0].field.control.optionType === 's') {

        const form = this.form.get('field').get('control');
        form.get('optionType').setValue(this.data[0].field.control.optionType);
        for (let i = 0; i < this.data[0].field.control.optionsValues.length; i++) {
          const index = '' + i;
          if (i > 0) {
            this.addOptions();
          }
          const form = (this.form.get('field').get('control').get('optionsValues') as FormArray).get(index);
          form.get('code').setValue(this.data[0].field.control.optionsValues[i].code);
          form.get('description').setValue(this.data[0].field.control.optionsValues[i].description);
        }
      } else if (this.data[0].field.control.optionType === 'd') {

        const form = this.form.get('field').get('control');
        form.get('optionType').setValue(this.data[0].field.control.optionType);
        const dynamic = this.form.get('field').get('control').get('filter') as FormGroup;
        dynamic.get('tableName').setValue(this.data[0].field.control.filter.tableName);
        dynamic.get('pageName').setValue(this.data[0].field.control.filter.pageName);
        dynamic.get('keyColumnName').setValue(this.data[0].field.control.filter.keyColumnName);
        dynamic.get('descriptionColumnName').setValue(this.data[0].field.control.filter.descriptionColumnName);
        dynamic.get('orderBy').setValue(this.data[0].field.control.filter.orderBy);
        dynamic.get('joinClause').setValue(this.data[0].field.control.filter.joinClause);

      }
    }

  }
  loadOnSelection() {
    const selectionField = this.form.get('field').get('onSelection') as FormGroup;
    selectionField.addControl('onSelectionChange', this.fb.control(''));
    selectionField.addControl('fieldType', this.fb.control(''));
    selectionField.addControl('loadDataLabel', this.fb.control(''));
    selectionField.addControl('targetPageId', this.fb.control(''));
    selectionField.addControl('passParameter', this.fb.control(''));
    selectionField.addControl('pageType', this.fb.control(''));
    selectionField.addControl('version', this.fb.control(''));
  }

  loadDynamicPageName() {
    const pageName = this.form.get('field').get('control').get('filter').get('pageName');
    pageName.valueChanges.pipe(debounceTime(500)).subscribe(
      data => {
        if (pageName.value !== '') {
          this.pageService.getAutoCompletePageName(pageName.value, this.isPublicForm).subscribe(result => {
            this.pageNameOptions = result;
            if (result.length === 0) {
              this.dynamicpageName = pageName.value;
              this.isFilterFieldName.emit(this.dynamicpageName);
            }
          });
        }
      });
  }

  loadDynamicPageNameForOnSelection() {
    const pageName = this.form.get('field').get('onSelection').get('targetPageName');
    pageName.valueChanges.pipe(debounceTime(500)).subscribe(
      () => {
        if (pageName.value !== '') {
          this.pageService.getAutoCompletePageName(pageName.value, this.isPublicForm).subscribe(result => {
            this.pageNameOptions = result;
          });
        }
      });
  }

  cancel() {
    if (this.data[0].controlType === 'grid') {
      if (this.updateCancel === true) {
      } else {
        this.onAdd.emit(false);
      }
    } else if (this.data[0].controlType === 'button' || this.data[0].controlType === 'label') {
      if (this.data[0].field.label.labelName === null ||
        this.data[0].field.label.labelName === '' || !this.data[0].field.label.labelName) {
        this.onAdd.emit(false);
      }
    } else if (this.data[0].controlType === 'tabbedmenu') {
      if (!this.data[0].field.control || this.data[0].field.control.menuId === null || this.data[0].field.control.menuId === ''
        || !this.data[0].field.control.menuId) {
        this.onAdd.emit(false);
      }
    } else if (this.data[0].controlType === 'paragraph') {
      if (!this.data[0].field.control) {
        this.onAdd.emit(false);

      }
    } else if (this.data[0].controlType === 'table') {
      if (!this.data[0].field.control) {
        this.onAdd.emit(false);
      }
    } else if (this.data[0].controlType !== 'page' && this.data[0].controlType !== 'image' && this.data[0].controlType !== 'imagegrid') {
      if (this.data[0].field.name === null || this.data[0].field.name === ''
        || !this.data[0].field.name) {
        this.onAdd.emit(false);
      }
    } else if (this.data[0].controlType === 'page') {
      if (!this.data[0].field.control) {
        this.onAdd.emit(false);
      }
    } else if (this.data[0].controlType === 'image' && !this.data[0].field.control) {
      this.onAdd.emit(false);
    } else if (this.data[0].controlType === 'imagegrid' && !this.data[0].field.control) {
      this.onAdd.emit(false);
    }
  }

  loadWorkFlowList() {
    this.pageService.getWorkFlowList().subscribe(data => {
      this.workFlowList = data;
      if (this.data[0].field.control && this.data[0].field.control.workflowName) {
        const form = this.form.get('field').get('control');
        form.get('workflowName').patchValue(this.data[0].field.control.workflowName);
        this.selectVersion(form.get('workflowKey').value, { isUserInput: false });
      }
    });
  }

  selectVersion(key, event) {
    const form = this.form.get('field').get('control');
    if (key && event.isUserInput) {
      form.get('workflowKey').setValue(key);
      this.pageService.getWorkflowVersionList(key).subscribe(data => {
        this.workflowVersionList = data;
        if (this.data[0].field.control && this.data[0].field.control.workflowVersion) {
          form.get('workflowVersion').patchValue(this.data[0].field.control.workflowVersion);
        }
      });
    }
  }


  validatorFormarray(): FormGroup {
    return this.fb.group({
      type: [],
      value: []
    });
  }

  ConditionalChecksFormarray(): FormGroup {
    return this.fb.group({
      fieldLabel: [],
      fieldName: ['', Validators.required],
      value: ['', Validators.required],
      dataType: ['']
    });
  }

  orientationChange(event) {
    if (event.value) {
      this.form.get('field').get('control').get('orientation').setValue(event.value);
    }
  }

  optionTypeChange(event) {
    if (event.value === 'd') {
      this.removeStaticOptionTypeFormControls();
      this.addDynamicFormControls();
    } else {
      this.removeDynamicOptionTypeValues();
      this.addStaticFormControls();
    }
    this.optionType = event.value;
  }

  removeStaticOptionTypeFormControls() {
    const control = this.form.get('field').get('control') as FormGroup;
    const oldFormGroup = control.get('optionsValues');
    control.removeControl('optionsValues');

    return oldFormGroup;
  }

  removeDynamicOptionTypeValues() {
    const control = this.form.get('field').get('control') as FormGroup;
    const oldFormGroup = control.get('filter');
    control.removeControl('filter');
    if (control.get('filters')) {
      control.removeControl('filters');
    }
    return oldFormGroup;
  }

  optionValueFormArray(): FormGroup {
    return this.fb.group({
      code: [, [Validators.required]],
      description: [, [Validators.required]],
    });
  }
  addOptions() {
    (this.form.get('field').get('control').get('optionsValues') as FormArray).push(this.optionValueFormArray());
    this.form.markAsDirty();
  }

  removeOptions(i: number) {
    (this.form.get('field').get('control').get('optionsValues') as FormArray).removeAt(i);
    this.form.markAsDirty();
  }

  addVariables() {
    (this.form.get('field').get('control').get('variableArray') as FormArray).push(this.getVariablesArray());
    this.form.markAsDirty();
  }

  removeVariables(i: number) {
    (this.form.get('field').get('control').get('variableArray') as FormArray).removeAt(i);
    this.form.markAsDirty();
  }

  getVariablesFormArray() {
    return (this.form.get('field').get('control').get('variableArray') as FormArray).controls;
  }

  validateFormArrayFields(formArray: FormArray) {
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.get(i + '') as FormGroup;
      group.get('columnName').markAsTouched({ onlySelf: true });
      group.get('columnName').updateValueAndValidity();
      group.get('operator').markAsTouched({ onlySelf: true });
      group.get('operator').updateValueAndValidity();
      group.get('dataType').markAsTouched({ onlySelf: true });
      group.get('dataType').updateValueAndValidity();
      group.get('valueType').markAsTouched({ onlySelf: true });
      group.get('valueType').updateValueAndValidity();
    }
  }

  validateSortArrayFields(formArray: FormArray) {
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.get(i + '') as FormGroup;
      group.get('sortColumnName').markAsTouched({ onlySelf: true });
      group.get('sortColumnName').updateValueAndValidity();
      // group.get('operator').markAsTouched({ onlySelf: true });
      // group.get('operator').updateValueAndValidity();
      // group.get('dataType').markAsTouched({ onlySelf: true });
      // group.get('dataType').updateValueAndValidity();
      // group.get('valueType').markAsTouched({ onlySelf: true });
      // group.get('valueType').updateValueAndValidity();
    }
  }

  setFormArrayFieldsAsNotRequired(formArray: FormArray) {
    formArray.clear();
  }


  validateFormArrayFieldsForHyperLink(formArray: FormArray) {
    this.hyperLinkErrorForLink = false;
    this.hyperLinkErrorForLinkName = false;
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.get(i + '') as FormGroup;
      Object.keys(group.controls).forEach(arrayField => {
        const formArrayControl = group.get(arrayField);
        if (formArrayControl.status === 'INVALID' && arrayField === 'link') {
          this.hyperLinkErrorForLink = true;
        }
        if (formArrayControl.status === 'INVALID' && arrayField === 'linkName') {
          this.hyperLinkErrorForLinkName = true;
        }
      });
    }
  }

  submit(userForm) {
    const form = this.form.get('field').get('control');

    if (this.data[0].controlType !== 'input') {
      this.form.get('field').get('dataType').setValidators(null);
      this.form.get('field').get('dataType').updateValueAndValidity();
    }
    if (this.data[0].controlType === 'button' && this.isWorkflowForm) {
      this.form.get('field').get('control').get('targetPageId').setErrors(null);
      this.form.get('field').get('control').get('targetPageName').setErrors(null);
      this.form.get('field').get('control').get('parameterFieldNames').setErrors(null);
    }

    if (this.data[0].controlType !== 'label') {
      this.form.get('field').get('label').get('labelSize').setValidators(null);
      this.form.get('field').get('label').get('labelStyle').setValidators(null);
      this.form.get('field').get('label').get('labelPosition').setValidators(null);
      this.form.get('field').get('label').get('labelSize').setErrors(null);
      this.form.get('field').get('label').get('labelStyle').setErrors(null);
      this.form.get('field').get('label').get('labelPosition').setErrors(null);
    }

    if (this.data[0].controlType === 'label') {
      this.form.get('field').get('name').setValidators(null);
      this.form.get('field').get('name').updateValueAndValidity();
    }

    if (this.data[0].controlType === 'currency') {

      // this.form.get('field').get('control').setValidators(null);
      // this.form.get('field').get('currencyCode').updateValueAndValidity();
    }

    if (this.data[0].controlType === 'paragraph') {
      this.form.get('field').get('name').setValidators(null);
      this.form.get('field').get('name').updateValueAndValidity();
      this.form.get('field').get('label').get('labelName').setValidators(null);
      this.form.get('field').get('label').get('labelName').updateValueAndValidity();
    }

    if ((this.data[0].controlType === 'select' || this.data[0].controlType === 'multipleselect'
      || this.data[0].controlType === 'radiobutton'
      || this.data[0].controlType === 'card')
      && this.form.get('field').get('control').get('optionType').value === 'd') {
      this.form.get('field').get('defaultCode').setValue('');
      this.form.get('field').get('defaultValue').setValue('');
      if (this.form.get('field').get('control').get('filter').get('sortOption').value === false) {
        const formArray = this.form.get('field').get('control').get('filter').get('sortBy') as FormArray;
        formArray.clear();
      }
    }

    if (this.data[0].controlType === 'imagegrid') {
      if (form.get('addOptions').value === false) {
        const selectGroup = this.form.get('field').get('control').get('filter') as FormGroup;
        if (selectGroup != null) {
          selectGroup.setValidators(null);
        }
      }
      if (this.form.get('field').get('control').get('filter').get('sortOption').value === false) {
        const formArray = this.form.get('field').get('control').get('filter').get('sortBy') as FormArray;
        formArray.clear();
      }
      form.get('optionType').setValidators(null);
      form.updateValueAndValidity();
    }

    if (this.data[0].controlType === 'computeFields') {
      const controlGroup = this.getControlFormGroup();
      const formula = controlGroup.get('formula').value;
      const formulaField = [];
      if (formula !== null) {
        this.data[1]?.forEach(formV => {
          if (formula.includes(formV)) {
            formulaField.push(formV);
          }
        });
      }
      controlGroup.get('formulaFields').setValue(formulaField);
    }

    if (this.page) {
      let i = 0;
      this.page.sections.forEach(section => {
        section.rows.forEach(row => {
          row.columns.forEach(column => {
            column = this.form.getRawValue();
            if (column.controlType === 'button'
              && this.data[7] === 'publicForm' && this.form.get('field').get('control').get('allignment')) {
              row.alignment = this.form.get('field').get('control').get('allignment').value;
            }
            if (column.controlType !== 'image' && this.form.get('field').get('name').value
              && (column.field.name === this.form.get('field').get('name').value) && i === 0) {
              column.field.style = this.form.get('field').get('style').value;
              column.field.rowBackground = this.form.get('field').get('rowBackground').value;
              i = 1;
            } else if (this.form.get('field').get('label').get('labelName') && this.form.get('field').get('label').get('labelName').value &&
              (column.field.label.labelName === this.form.get('field').get('label').get('labelName').value) && i === 0) {
              column.field.style = this.form.get('field').get('style').value;
              column.field.rowBackground = this.form.get('field').get('rowBackground').value;
              i = 1;
            } else if (column.controlType === 'table' && this.form.get('field').get('control').get('tableName')
              && this.form.get('field').get('control').get('tableName').value
              && (this.form.get('field').get('control').get('tableName').value === column.field.control.tableName) && i === 0) {
              column.field.style = this.form.get('field').get('style').value;
              column.field.rowBackground = this.form.get('field').get('rowBackground').value;
              i = 1;
            } else if (this.form.get('field').get('control').get('menuId')
              && this.form.get('field').get('control').get('menuId').value
              && (this.form.get('field').get('control').get('menuId').value === column.field.control.menuId) && i === 0) {
              column.field.style = this.form.get('field').get('style').value;
              column.field.rowBackground = this.form.get('field').get('rowBackground').value;
              i = 1;
            } else if (this.form.get('field').get('control').get('gridId')
              && this.form.get('field').get('control').get('gridId').value
              && (this.form.get('field').get('control').get('gridId').value === column.field.control.gridId) && i === 0) {
              column.field.style = this.form.get('field').get('style').value;
              i = 1;
              column.field.rowBackground = this.form.get('field').get('rowBackground').value;
            } else if (column.controlType === 'paragraph' && this.form.get('field').get('control').get('paragraph')
              && this.form.get('field').get('control').get('paragraph').value
              && (this.form.get('field').get('control').get('paragraph').value === column.field.control.paragraph) && i === 0) {
              column.field.style = this.form.get('field').get('style').value;
              column.field.rowBackground = this.form.get('field').get('rowBackground').value;
              i = 1;
            } else if (this.form.get('field').get('control').get('image')
              && (this.form.get('field').get('control').get('image').value === column.field.control.image) && i === 0) {
              column.field.style = this.form.get('field').get('style').value;
              column.field.rowBackground = this.form.get('field').get('rowBackground').value;
              i = 1;
            }
          });
        });
      });
    }

    if (this.data[0].controlType === 'hyperlink') {
      this.validateFormArrayFieldsForHyperLink(form.get('hyperLink') as FormArray);
    }

    if (this.data[0].controlType === 'fileupload') {
      this.form.get('field').get('name').setValidators(null);
      this.form.get('field').get('name').setErrors(null);
    }
    if (this.data[0].controlType !== 'textarea') {
      this.form.get('field').get('rows').setValidators(null);
      this.form.get('field').get('rows').setErrors(null);
      this.form.get('field').get('cols').setValidators(null);
      this.form.get('field').get('cols').setErrors(null);
    }

    if (this.data[0].controlType === 'table') {
      if (this.form.get('field').get('control').get('headerColor').value === undefined) {
        this.form.get('field').get('control').get('headerColor').setValue('#000000');
      }
      this.form.get('field').get('label').get('labelName').setValidators(null);
      this.form.get('field').get('label').get('labelName').updateValueAndValidity();
    }

    if (this.form.get('controlType').value === 'input'
      && this.form.get('field').get('control').get('enableCompute')
      && (this.form.get('field').get('control').get('enableCompute').value === false
        || this.form.get('field').get('control').get('enableCompute').value === '' || this.form.get('field').get('control').get('enableCompute').value === undefined)) {
      const controlGroup = this.getControlFormGroup();
      if (this.form.get('field').get('control').get('operator')) {
        this.form.get('field').get('control').get('operator').setValue(null);
      }
      controlGroup.removeControl('operator');
      controlGroup.removeControl('variableArray');
    }

    this.isEnableFilterValidation.emit(true);
    // if (this.form.get('controlType').value === 'fileupload' && this.selectedFiles.length > 0) {
    //   this.form.get('field').get('control').get('fileType').setValidators(null);
    //   this.form.get('field').get('control').get('fileType').updateValueAndValidity();
    // }
    if (userForm.valid && userForm.dirty) {
      // if (this.form.get('controlType').value === 'fileupload') {
      //   let selectedFilesExtensions: string[] = [];
      //   for (let i = 0; i < this.selectedFiles.length; i++) {
      //     selectedFilesExtensions.push(this.selectedFiles[i].value);
      //   }
      //   this.form.get('field').get('control').get('fileType').setValue(selectedFilesExtensions);
      // }
      if (this.data[0].controlType === 'checkbox' || this.data[0].controlType === 'radiobutton') {
        if (this.form.get('field').get('control').get('orientation').value === true) {
          this.form.get('field').get('control').get('orientation').setValue('horizontal');
        } else if (this.form.get('field').get('control').get('orientation').value === false) {
          this.form.get('field').get('control').get('orientation').setValue('vertical');
        }
      }
      this.inputField = this.form.getRawValue();
      if (this.inputField.controlType === 'currency') {
        // this.inputField.field.label.labelPosition = this.currencySymbol;
      }

      if (this.inputField.controlType === 'autocomplete') {
        this.inputField.field.control.descriptionColumnName = form.get('descriptionColumnName').value.join(',');
      }

      if (this.inputField.controlType === 'page' && this.appPageId !== null) {
        this.inputField.field.control.pageId = this.appPageId;

      }

      if (this.inputField.controlType === 'button' && form.get('screenType').value === 'callWorkflow') {
        if (form.get('saveAndCallWorkflow').value === null) {
          form.get('saveAndCallWorkflow').setValue(false);
        }
        this.inputField.field.control.saveAndCallWorkflow = form.get('saveAndCallWorkflow').value;
      }

      if (this.inputField.controlType === 'date') {
        this.inputField.field.dataType = 'date';
      }
      if (this.inputField.controlType === 'email') {
        this.inputField.field.dataType = 'string';
      }
      if (this.inputField.controlType === 'tel') {
        this.inputField.field.dataType = 'string';
      }
      const required = this.form.get('field').get('required').value;
      const minLength = this.form.get('field').get('minLength').value;
      const maxLength = this.form.get('field').get('maxLength').value;
      const pattern = this.form.get('field').get('pattern').value;

      if (required === true) {
        this.addValidation();
        const group = (this.getValidationFormArray().get('' +
          (this.getValidationFormArray().length - 1)) as FormGroup);
        group.get('type').setValue('required');
        if (this.inputField.controlType === 'email') {
          this.addValidation();
          const emailFormGroup = (this.getValidationFormArray().get('' +
            (this.getValidationFormArray().length - 1)) as FormGroup);
          emailFormGroup.get('type').setValue('email');
        }
        /*    if (this.inputField.controlType === 'tel') {
              const group = (this.getValidationFormArray().get('' +
                (this.getValidationFormArray().length - 1)) as FormGroup);
              group.get('type').setValue('pattern');
              group.get('value').setValue('[0-9]{3}-[0-9]{3}-[0-9]{4}');
            }*/
      } else if (required === false || required === null) {
        this.addValidation();
        if (this.inputField.controlType === 'email') {
          const group = (this.getValidationFormArray().get('' +
            (this.getValidationFormArray().length - 1)) as FormGroup);
          group.get('type').setValue('email');
        }
        /* if (this.inputField.controlType === 'tel') {
           const group = (this.getValidationFormArray().get('' +
             (this.getValidationFormArray().length - 1)) as FormGroup);
           group.get('type').setValue('pattern');
           group.get('value').setValue('[0-9]{3}-[0-9]{3}-[0-9]{4}');
         }*/

      }

      if (minLength !== null && minLength !== '') {
        this.addValidation();
        const group = (this.getValidationFormArray().get('' +
          (this.getValidationFormArray().length - 1)) as FormGroup);
        group.get('type').setValue('minlength');
        group.get('value').setValue(minLength);
      }

      if (maxLength !== null && maxLength !== '') {
        this.addValidation();
        const group = (this.getValidationFormArray().get('' +
          (this.getValidationFormArray().length - 1)) as FormGroup);
        group.get('type').setValue('maxlength');
        group.get('value').setValue(maxLength);
      }

      if (pattern !== null && pattern !== '') {
        this.addValidation();
        const group = (this.getValidationFormArray().get('' +
          (this.getValidationFormArray().length - 1)) as FormGroup);
        group.get('type').setValue('pattern');
        group.get('value').setValue(pattern);
      }
      this.inputField.field.validations = this.getValidationFormArray().value;
      this.onAdd.emit(this.inputField);
      this.savedColumn.emit(this.inputField);
      this.dialogRef.close(this.inputField);
    } else {
    }
  }

  reset() {
    this.form.reset();
  }

  getValidationFormArray() {
    return (this.form.get('field').get('validations') as FormArray);
  }

  getConditionallyCheckFormArray(type: string) {
    return (this.form.get('field').get('conditionalChecks').get(type).get('fields') as FormArray);
  }

  getCondtionalChecksShowFieldsArray() {
    return (this.form.get('field').get('conditionalChecks').get('show').get('fields') as FormArray).controls;
  }

  getConditionalCheckFieldsFormArray() {
    return (this.form.get('field').get('conditionalChecks').get('enable').get('fields') as FormArray).controls;
  }

  getConditionalCheckRequiredFieldsFormArray() {
    return (this.form.get('field').get('conditionalChecks').get('required').get('fields') as FormArray).controls;
  }

  getTableConditionalLevelFormArrayControl(i: number) {
    return (this.form.get('field').get('control').get('columns')
      .get(i + '').get('field').get('conditionalChecks').get('required').get('fields') as FormArray).controls;
  }

  getTableControlRequiredValidationFormArray(i: number) {
    return (this.form.get('field').get('control').get('columns')
      .get(i + '').get('field').get('conditionalChecks').get('required').get('fields') as FormArray);
  }

  addValidation() {
    this.getValidationFormArray()
      .push(this.validatorFormarray());
  }


  generateName() {

    if (this.data[0].controlType !== 'grid' || this.data[0].controlType !== 'label') {

      this.form.get('field').get('name').setValue(this.camelize(this.form.get('field.label.labelName').value));
      if (this.data[1] && this.data[1].length) {
        for (let i = 0; i < this.data[1].length; i++) {
          if (this.form.get('field').get('name').value === this.data[1][i]) {
            this.formNameError = true;
            return this.form.get('field.name').setErrors({ unique: true });
          }
        }
      }
    }
  }

  getOptionValuesFormArray() {
    return (this.form.get('field').get('control').get('optionsValues') as FormArray).controls;
  }


  loadPageNameByIdentifierButton() {
    const targetPageName = this.form.get('field').get('control').get('targetPageName');
    const version = this.form.get('field').get('control').get('version');
    targetPageName.valueChanges.pipe(debounceTime(500)).subscribe(
      () => {
        if (targetPageName.value !== '' && targetPageName.value !== null) {
          this.pageService.getAutoCompletePageName(targetPageName.value, this.isPublicForm).subscribe(result => {
            this.pageNameOptions = result;
          });
        }
      });
  }

  loadPageNameByIdentifier() {
    const targetPageName = this.form.get('field').get('control').get('targetPageId');
    const version = this.form.get('field').get('control').get('version');
    targetPageName.valueChanges.pipe(debounceTime(500)).subscribe(
      () => {
        if (targetPageName.value !== '' && targetPageName.value !== null) {
          this.pageService.getAutoCompletePageName(targetPageName.value, this.isPublicForm).subscribe(result => {
            this.pageNameOptions = result;
          });
        }
      });
  }
  loadGridName() {
    this.form.get('field').get('control').get('gridId').valueChanges.pipe(debounceTime(100)).subscribe(
      () => {
        if (this.form.get('field').get('control').get('gridId').value !== '') {
          this.pageService.getGridName(this.form.get('field')
            .get('control').get('gridId').value).subscribe(result => {
              this.gridNameOptions = result;
              if (this.gridNameOptions.length === 0) {
                this.form.get('field').get('control').get('gridId').setErrors({ unique: true });
              }
            });
        }
      });
  }

  loadShoppingCartName() {
    this.form.get('field').get('control').get('shoppingCartLabel').valueChanges.pipe(debounceTime(100)).subscribe(
      (value) => {
        if (this.form.get('field').get('control').get('shoppingCartLabel').value !== '') {
          this.pageService.getShoppingCartNameUrl(value).subscribe(data => {
            if (data) {
              this.shoppingCartName = data;
            }
          });

        }
      });
  }

  setShoppingCartName($event, cart) {
    if ($event && $event.isUserInput) {
      this.form.get('field').get('control').get('shoppingCartName').setValue(cart.shoppingCartName);
      this.form.get('field').get('control').get('shoppingCartId').setValue(cart.shoppingCartId);
      this.form.get('field').get('control').get('shoppingCartLabel').setValue(cart.shoppingCartlabel);
      this.form.get('field').get('label').get('labelName')
        .setValue(cart.shoppingCartlabel);
      this.form.get('field').get('name').setValue(cart.shoppingCartName);
    }
  }
  checkFormControlName(event: any) {
    if (this.data[1].length === 0) {
      this.form.get('field').get('name').setValue(this.camelize(event.target.value));
    } else {
      for (let i = 0; i < this.data[1].length; i++) {
        if (this.form.get('field').get('name').value === this.data[1][i]) {
          if (this.form.get('field').get('name').value !== this.data[0].field.name) {
            this.formNameError = true;
            return this.form.get('field.name').setErrors({ unique: true });
          }
        }
      }
      this.form.get('field').get('name').setValue(this.camelize(this.form.get('field').get('name').value));
    }
  }
  camelize(str) {
    if (str) {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '').replace(/[^\w]/g, '').replace(/_/g, '');
    }
  }

  buttonValidation(event: any) {
    this.updateValidatorBasedOnSelection(event.source.value);
  }

  webServiceAction(event: any) {
    const controlGroup = this.getControlFormGroup();
    if (event.value === 'webServiceCall') {
      controlGroup.get('workflowName').setValue(null);
      controlGroup.get('workflowName').setValidators(null);
      controlGroup.get('workflowVersion').setValue(null);
      controlGroup.get('workflowVersion').setValidators(null);
      controlGroup.get('saveAndCallWorkflow').setValue(null);
      controlGroup.get('targetPageId').setValue(null);
      controlGroup.get('targetPageId').setValidators(null);
      controlGroup.get('parameterFieldNames').setValue(null);
      controlGroup.get('parameterFieldNames').setValidators(null);
      controlGroup.get('targetPageName').setValue(null);
      controlGroup.get('targetPageName').setValidators(null);
      controlGroup.get('webServiceCallUrl').setValidators([Validators.required, Validators.pattern('^((\\https:-?))+[a-z0-9._%/+-]{2,200}$')]);

    } else if (event.value === 'callWorkflow') {
      this.loadWorkFlowList();
      controlGroup.get('targetPageId').setValue(null);
      controlGroup.get('targetPageId').setValidators(null);
      controlGroup.get('parameterFieldNames').setValue(null);
      controlGroup.get('parameterFieldNames').setValidators(null);
      controlGroup.get('targetPageName').setValue(null);
      controlGroup.get('targetPageName').setValidators(null);
      controlGroup.get('webServiceCallUrl').setValidators(null);
      controlGroup.get('webServiceCallUrl').setValue(null);
      controlGroup.get('workflowName').setValidators([Validators.required]);
      controlGroup.get('workflowVersion').setValidators([Validators.required]);
    } else {
      controlGroup.get('workflowName').setValue(null);
      controlGroup.get('workflowName').setValidators(null);
      controlGroup.get('workflowVersion').setValue(null);
      controlGroup.get('workflowVersion').setValidators(null);
      controlGroup.get('saveAndCallWorkflow').setValue(null);
      controlGroup.get('webServiceCallUrl').setValidators(null);
      controlGroup.get('webServiceCallUrl').setValue(null);
      controlGroup.get('targetPageId').setValidators([Validators.required]);
      controlGroup.get('parameterFieldNames').setValidators([Validators.required]);
      controlGroup.get('targetPageName').setValidators([Validators.required]);
    }
    controlGroup.get('webServiceCallUrl').updateValueAndValidity();
    controlGroup.get('workflowName').updateValueAndValidity();
    controlGroup.get('workflowVersion').updateValueAndValidity();
    controlGroup.get('saveAndCallWorkflow').updateValueAndValidity();
    controlGroup.get('targetPageId').updateValueAndValidity();
    controlGroup.get('parameterFieldNames').updateValueAndValidity();
    controlGroup.get('targetPageName').updateValueAndValidity();
  }

  updateValidatorBasedOnSelection(param: string) {
    const controlGroup = this.getControlFormGroup();
    if (param === 'submit' || param === 'reset' || param === 'delete') {
      controlGroup.get('workflowName').setValue(null);
      controlGroup.get('workflowName').setValidators(null);
      controlGroup.get('workflowVersion').setValue(null);
      controlGroup.get('workflowVersion').setValidators(null);
      controlGroup.get('saveAndCallWorkflow').setValue(null);
      controlGroup.get('saveAndCallWorkflow').setValidators(null);
      controlGroup.get('targetPageId').setValue(null);
      controlGroup.get('targetPageId').setValidators(null);
      controlGroup.get('parameterFieldNames').setValue(null);
      controlGroup.get('parameterFieldNames').setValidators(null);
      controlGroup.get('targetPageName').setValue(null);
      controlGroup.get('targetPageName').setValidators(null);
      controlGroup.get('webServiceCallUrl').setValidators(null);
      controlGroup.get('webServiceCallUrl').setValue(null);
      controlGroup.get('webServiceCallUrl').updateValueAndValidity();
      controlGroup.get('workflowName').updateValueAndValidity();
      controlGroup.get('workflowVersion').updateValueAndValidity();
      controlGroup.get('saveAndCallWorkflow').updateValueAndValidity();
      controlGroup.get('targetPageId').updateValueAndValidity();
      controlGroup.get('parameterFieldNames').updateValueAndValidity();
      controlGroup.get('targetPageName').updateValueAndValidity();
    } else {
      this.webServiceAction({ value: controlGroup.get('screenType').value });
    }
  }


  changeConditionallyEnableChecks(event: MatSlideToggle) {
    if (event.checked) {
      this.conditionallyEnableChecks = true;
      this.addEnableConditionalChecks();
    } else {
      this.conditionallyEnableChecks = false;
      if (this.conditonallyEnablefieldType.length > 0) {
        this.conditonallyEnablefieldType = []
      }
      this.clearFormArray(this.getConditionallyCheckFormArray('enable'));

    }

  }

  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  changeConditionallyShowChecks(event: MatSlideToggle) {
    if (event.checked) {
      this.conditionallyShowChecks = true;
      this.addShowConditionalChecks();
    } else {
      this.conditionallyShowChecks = false;
      if (this.conditonallyShowfieldType.length > 0) {
        this.conditonallyShowfieldType = []
      }
      this.clearFormArray(this.getConditionallyCheckFormArray('show'));
    }
  }
  changeConditionallyRequiredChecks(event: MatSlideToggle) {
    if (event.checked) {
      this.conditionallyShowChecks = true;
      this.addRequiredConditionalChecks();
    } else {
      this.conditionallyShowChecks = false;
      if (this.fieldType.length > 0) {
        this.fieldType = []
      }
      this.clearFormArray(this.getConditionallyCheckFormArray('required'));
    }
  }

  changeValidationsTableColumns(i) {
    const field = this.form.get('field').get('control').get('columns')
      .get(i + '').get('field');
    let allowMinMaxVal = true;
    let dataType = null;
    if (field.get('dataType').value === 'date') {
      allowMinMaxVal = false;
      dataType = field.get('dataType').value;
    }
    if (field.get('control').get('textFieldType').value === 'textarea') {
      allowMinMaxVal = false;
      dataType = field.get('control').get('textFieldType').value;
    }
    const dialogRef = this.dialog.open(TableControlValidationComponent, {
      disableClose: true,
      data: {
        type: 'validation',
        columnHeadersCondtionalFields: this.columnHeadersCondtionalFields, allowMinMaxVal, datatype: dataType,
        required: field.get('required').value, editable: field.get('editable').value, fieldId: field.get('name').value,
        minLength: field.get('minLength').value, maxLength: field.get('maxLength').value,
        requiredWhen: field.get('conditionalChecks').get('required').value,
        allowPastDate: field.get('allowPastDate').value, allowFutureDate: field.get('allowFutureDate').value
      },
      width: '50%',
      height: '52%',
    });
    dialogRef.afterClosed().subscribe(validations => {
      if (!validations) {
      } else {
        this.clearFormArray(this.getTableControlRequiredValidationFormArray(i));
        field.get('required').setValue(validations.required);
        field.get('editable').setValue(validations.editable);
        field.get('minLength').setValue(validations.minLength);
        field.get('maxLength').setValue(validations.maxLength);
        field.get('allowPastDate').setValue(validations.allowPastDate);
        field.get('allowFutureDate').setValue(validations.allowFutureDate);
        field.get('conditionalChecks').get('required').get('option').setValue(validations.conditionalChecks.required.option);
        if (validations.conditionalChecks.required.option !== null && validations.conditionalChecks.required.option) {
          const requiredFieldValueArray: any[] = validations.conditionalChecks.required.fields;
          for (let j = 0; j < requiredFieldValueArray.length; j++) {
            this.addRequiredConditionalChecksArrayInTableColumns(i);
            const requiredForm = (this.getTableControlRequiredValidationFormArray(i).get(j + '')) as FormGroup;
            requiredForm.setValue(requiredFieldValueArray[j]);
          }
        }
        field.get('minLength').updateValueAndValidity();
        field.get('maxLength').updateValueAndValidity();
      }
    });
  }

  changeOptionTableColumns(i) {
    const formGroup = (this.form.get('field').get('control').get('columns')
      .get(i + '') as FormGroup).get('field') as FormGroup;
    let optionsValues: any[] = []
    if (formGroup.get('optionsValues')) {
      optionsValues = (formGroup.get('optionsValues') as FormArray).value
    }
    const dialogRef = this.dialog.open(TableControlValidationComponent, {
      disableClose: true,
      data: {
        type: 'option',
        formGroup: formGroup,
        optionsValues: optionsValues
      },
      width: '50%',
      height: '52%',
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        formGroup.get('pageName').setValue(data.pageName);
        formGroup.get('keyColumnName').setValue(data.keyColumnName);
        formGroup.get('descriptionColumnName').setValue(data.descriptionColumnName);
        formGroup.get('sortOption').setValue(data.sortOption);
        formGroup.get('filterOptions').setValue(data.filterOptions);
        formGroup.get('loadFirstOption').setValue(data.loadFirstOption);
        formGroup.get('pageName').setValue(data.pageName);
        formGroup.get('pageName').setValue(data.pageName);
      }
    });
  }

  changeConditionallyRequiredTableColumns(event: MatSlideToggle, i) {
    if (event.checked) {
      this.addRequiredConditionalChecksArrayInTableColumns(i);
    } else {
      this.clearFormArray(this.getTableControlRequiredValidationFormArray(i));
    }
  }
  changeConditionallySelection(event: MatSlideToggle) {
    const form = this.form.get('field').get('onSelection');
    if (event.checked) {
      this.onselection = true;
      this.pageService.getPageNames().subscribe(data => {
        this.pageNameOptions = data;
        const pageIdArr = [];
        for (let i = 0; i < this.pageNameOptions.length; i++) {
          pageIdArr.push(this.pageNameOptions[i].pageId);
        }
        this.onselectionMessgae = !(pageIdArr.includes(this.pageId));
      });
      this.setFieldTypeValidation(form);
    } else {
      this.onselection = false;
      this.onselectionMessgae = false;
      this.removeFieldTypeValidation(form);
    }
  }

  setFieldTypeValidation(form: AbstractControl) {
    form.get('fieldType').setValidators(Validators.required);
    form.get('fieldType').updateValueAndValidity();
  }

  removeFieldTypeValidation(form: AbstractControl) {
    form.get('fieldType').setValidators(null);
    form.get('fieldType').updateValueAndValidity();
    this.removeGotoPageValidation(form);
  }

  setGotoPageValidation(form: AbstractControl) {
    form.get('targetPageName').setValidators(Validators.required);
    form.get('passParameter').setValidators(Validators.required);
    form.get('pageType').setValidators(Validators.required);
    form.get('version').setValidators(Validators.required);
    form.get('targetPageName').updateValueAndValidity();
    form.get('passParameter').updateValueAndValidity();
    form.get('pageType').updateValueAndValidity();
    form.get('version').updateValueAndValidity();
  }

  removeGotoPageValidation(form: AbstractControl) {
    form.get('targetPageName').setValidators(null);
    form.get('passParameter').setValidators(null);
    form.get('pageType').setValidators(null);
    form.get('version').setValidators(null);
    form.get('targetPageName').updateValueAndValidity();
    form.get('passParameter').updateValueAndValidity();
    form.get('pageType').updateValueAndValidity();
    form.get('version').updateValueAndValidity();
  }

  getAllPageNames() {
    const pageName = this.form.get('field').get('control').get('filter').get('pageName');
    if (pageName.value === null || pageName.value === '') {
      this.pageService.getTableObjectNames().subscribe(data => {
        this.pageNameOptions = data;
      });
    }
  }

  getAllCartNames() {
    const cartName = this.form.get('field').get('control').get('shoppingCartLabel');
    if (cartName.value === null || cartName.value === '') {
      this.pageService.getCartNames().subscribe(data => {
        if (data) {
          this.shoppingCartName = data;
        }
      });
    }
  }
  setAutocompleteValidation() {
    const name = this.form.get('field').get('control').get('filter').get('pageName');
    if (this.pageNameOptions !== undefined && this.pageNameOptions.length > 0 &&
      !this.pageNameOptions.some(pageName => pageName.pageName === name.value)) {
      name.setErrors({ invalidPageName: true });
      this.pageFields = [];
    }
  }

  radioSelectLoadData(event: MatRadioChange) {
    this.goToPage = false;
    this.onselectionMessgae = false;
    const selectionField = this.form.get('field').get('onSelection');
    const fieldName = this.form.get('field').get('name').value;
    this.form.get('field').get('onSelection').get('loadDataLabel').setValue(fieldName);
    this.removeGotoPageValidation(selectionField);
  }

  loadVersion(pageId, version) {
    this.onSelectPageFields = [];
    this.form.get('field').get('onSelection').get('targetPageId').setValue(pageId);
    this.form.get('field').get('onSelection').get('version').setValue(version);
    this.loadTargetPageColumnsForOnSelection(pageId, version);
  }


  setTargetPageAutocompleteValidation() {
    const name = this.form.get('field').get('onSelection').get('targetPageName');
    if (this.pageNameOptions !== undefined && this.pageNameOptions.length > 0 &&
      !this.pageNameOptions.some(pageName => pageName.pageName === name.value)) {
      name.setErrors({ invalidTargetPageName: true });
      this.pageFields = [];
    }
  }

  setHyperlinkPageAutocompleteValidation() {
    if (this.form.get('field').get('enableHyperlink').value === true) {
      const name = this.form.get('field').get('control').get('targetPageName');
      if (this.pageNameOptions !== undefined && this.pageNameOptions.length > 0 &&
        !this.pageNameOptions.some(pageName => pageName.pageName === name.value)) {
        name.setErrors({ invalidHyperlinkTargetPageName: true });
        this.pageFields = [];
      }
    }
  }
  radioSelectionChange(event: MatRadioChange) {
    const selectionField = this.form.get('field').get('onSelection');
    if (event.source.checked === true) {
      this.goToPage = true;
      this.setGotoPageValidation(selectionField);
    } else {
      this.goToPage = false;
      this.removeGotoPageValidation(selectionField);
    }
  }

  changeDefaultValue(event: MatSlideToggle) {
    if (event.checked === true) {
      this.defaultValue = true;
      const defaultValueGroup = this.form.get('field').get('control').get('defaultValues');
      defaultValueGroup.get('defaultValue').setValue(true);
      defaultValueGroup.get('keyValue').setValidators([Validators.required]);
      defaultValueGroup.get('descValue').setValidators([Validators.required]);
      defaultValueGroup.get('keyValue').updateValueAndValidity();
      defaultValueGroup.get('descValue').updateValueAndValidity();
    } else {
      this.defaultValue = false;
      const defaultValueGroup = this.form.get('field').get('control').get('defaultValues') as FormGroup;
      defaultValueGroup.get('keyValue').setValue('');
      defaultValueGroup.get('descValue').setValue('');
      defaultValueGroup.get('keyValue').clearValidators();
      defaultValueGroup.get('descValue').clearValidators();
      defaultValueGroup.get('keyValue').updateValueAndValidity();
      defaultValueGroup.get('descValue').updateValueAndValidity();

    }

  }
  addEnableConditionalChecks() {
    this.getConditionallyCheckFormArray('enable')
      .push(this.ConditionalChecksFormarray());
  }

  removeRequiredConditionalChecks(i: number) {
    this.getConditionallyCheckFormArray('required').removeAt(i);
    this.form.markAsDirty();
  }

  addRequiredConditionalChecks() {
    this.getConditionallyCheckFormArray('required')
      .push(this.ConditionalChecksFormarray());
  }

  removeEnableConditionalChecks(i: number) {
    this.getConditionallyCheckFormArray('enable').removeAt(i);
    this.form.markAsDirty();
  }

  addShowConditionalChecks() {
    this.getConditionallyCheckFormArray('show')
      .push(this.ConditionalChecksFormarray());
  }

  removeShowConditionalChecks(i: number) {
    this.getConditionallyCheckFormArray('show').removeAt(i);
    this.form.markAsDirty();
  }

  lengthValidation() {
    const minLength = this.form.get('field').get('minLength');
    const maxLength = this.form.get('field').get('maxLength');
    if (minLength.value !== null && maxLength.value !== null && minLength.value > maxLength.value) {
      maxLength.setErrors({ maxLogicalError: true });
    } else {
      maxLength.setErrors(null);
    }
  }

  setDateValidators() {
    const dateOperator = this.form.get('field').get('dateValidation').get('operator');
    const toField = this.form.get('field').get('dateValidation').get('toField');
    if ((dateOperator.value === null) &&
      (toField.value !== null)) {
      dateOperator.setErrors({ dateValidatorOperatorReq: true });
    }
    if ((dateOperator.value !== null) &&
      (toField.value === null)) {
      toField.setErrors({ dateValidatorFieldReq: true });
    } else if (!this.dateFieldName.some(fieldNames => fieldNames.name === toField.value) && toField.value !== null) {
      toField.setErrors({ invalidField: true });
    }
  }

  addRequiredConditionalChecksArray() {
    this.addRequiredConditionalChecks();
    this.form.markAsDirty();
  }

  addRequiredConditionalChecksArrayInTableColumns(i) {
    this.getTableControlRequiredValidationFormArray(i).push(this.ConditionalChecksFormarray());
  }

  removeRequiredConditionalChecksInTableColumns(i, j) {
    this.getTableControlRequiredValidationFormArray(i).removeAt(j);
  }

  addShowConditionalChecksArray() {
    this.addShowConditionalChecks();
    this.form.markAsDirty();
  }

  addEnableConditionalChecksArray() {
    this.addEnableConditionalChecks();
    this.form.markAsDirty();
  }
  validateConditionalFieldValues(form: AbstractControl) {
    if (!this.data[1].some(fieldNames => fieldNames === form.value) && form.value !== '' && form.value !== null) {
      form.setErrors({ invalidField: true });
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.selectedFiles.push(value);
    }
    event.chipInput!.clear();
    this.form.get('field').get('control').get('fileType').setValue(null);
  }

  remove(fruit: string): void {
    const index = this.selectedFiles.indexOf(fruit);
    if (index >= 0) {
      this.selectedFiles.splice(index, 1);
    }
    this.form.markAsDirty();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedFiles.push(event.option.value);
    // this.fruitInput.nativeElement.value = '';
    this.form.get('field').get('control').get('fileType').setValue(null);
  }

  close() {
    this.reset();
    this.dialogRef.close();
  }

}
