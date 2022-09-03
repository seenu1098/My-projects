import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators, AbstractControl, FormControl } from '@angular/forms';
import { MatChipInputEvent, MatSnackBar } from '@angular/material';
import { LivetestService } from '../../shared/service/livetest.service';
import {
  ClaimEntityVO, ClaimVO, TestGroupCaseVO, TestGroupVO,
  BeneficiaryVO, ProviderVO, PayorVO, DuplicateTemplateVO, AddressVO
} from '../../shared/vo/claim-vo';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { PaVO } from 'src/shared/vo/environment-preset-vo';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { ElementConfigVO, ElementConfigListVO } from 'src/shared/vo/element-config-vo';
import { group } from '@angular/animations';
import { validateVerticalPosition } from '@angular/cdk/overlay';
import { element } from 'protractor';

@Component({
  selector: 'app-create-template',
  templateUrl: './create-template.component.html',
  styleUrls: ['./create-template.component.css']
})
export class CreateTemplateComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  @Input() editing = false;
  today = new Date();
  selectable = true;
  removable = true;
  addOnBlur = true;

  claimVo = new ClaimVO();
  fromClaim = 0;
  responseMsg = '';
  claimsId: number;
  chipHeaderSecondaryDiagnosisList: Placeholder[] = [];

  primaryDiagnosis: string;
  lineModifiersList: Placeholder[][] = [];
  lineExpectedErrors: Placeholder[][] = [];

  chipClaimConditionCodeList: Placeholder[] = [];
  chipClaimTreatmentCodeList: Placeholder[] = [];
  lineToothCodeList: Placeholder[][] = [];
  lineOralCavityDesignationCodesList: Placeholder[][] = [];
  secondaryDiagnoses: any;

  form: FormGroup;
  claim: FormGroup;

  testGroupCaseVO = new TestGroupCaseVO();
  claimEnity = new ClaimEntityVO();
  duplicateTemplateVO = new DuplicateTemplateVO();
  checked = true;
  checkBoxControl = false;
  isTemplate = true;
  isDuplicateTemplate = true;
  templateId: number;
  claimTypeList: any;
  submitterList: any;
  receiverList: any;
  formtypeList: any;
  frequencyList: any;
  sourceList: any;
  servicingFieldDisabled = false;
  selected: string;
  beneficiaryList: BeneficiaryVO[] = [new BeneficiaryVO()];
  userAccess = true;
  providerList: ProviderVO[] = [new ProviderVO()];
  payorList: PayorVO[] = [new PayorVO()];
  paList: PaVO[] = [new PaVO()];
  elementConfigList: ElementConfigListVO[];
  lineElementConfigList: ElementConfigListVO[];
  elementsConfig: string;
  headerExpectedElementsChipList = {};
  lineExepectedElementChipList = {};
  list: Placeholder[] = [];
  lineCheckBoxontrol = {};
  lineServiceFacilityReadOnlyValue = {};
  headerExpectedElementsOptions: any;
  lineExpectedElementsOptions: any;

  constructor(private fb: FormBuilder, private service: LivetestService, private datePipe: DatePipe,
    private snackBar: MatSnackBar, private cdr: ChangeDetectorRef, private router: Router) {
    this.loadInitialData();
    this.userAccess = true;
  }



  loadInitialData() {
    this.service.getLookupDataList('Submitters').subscribe(data => {
      this.submitterList = data;
    });

    this.service.getLookupDataList('Receiver').subscribe(data => {
      this.receiverList = data;
    });

    this.service.getLookupDataList('Frequency').subscribe(data => {
      this.frequencyList = data;
    });

    this.service.getLookupDataList('Source').subscribe(data => {
      this.sourceList = data;
    });
  }

  ngOnInit() {

    this.form = this.fb.group({
      templateId: [this.claimVo.templateId],
      claimId: [this.claimVo.claimId],
      claimTestcaseName: [this.claimVo.claimTestcaseName],
      templateName: [this.claimVo.templateName, Validators.required],
      testScenario: [this.claimVo.testScenario, Validators.required],
      claimSubmitters: [this.claimVo.claimSubmitters, Validators.required],
      claimReceiver: [this.claimVo.claimReceiver, Validators.required],
      formType: [this.claimVo.formType, Validators.required],
      claimType: [this.claimVo.claimType],

      beneficiary: this.fb.group({
        identifier: [this.claimVo.beneficiary.identifier, Validators.required],
        firstName: [this.claimVo.beneficiary.firstName, Validators.required],
        lastName: [this.claimVo.beneficiary.lastName, Validators.required],
        dob: [this.claimVo.beneficiary.dob, Validators.required],
        gender: [this.claimVo.beneficiary.gender, Validators.required],
        description: [],
        address: this.fb.group({
          address: [this.claimVo.beneficiary.address.address, Validators.required],
          city: [this.claimVo.beneficiary.address.city, Validators.required],
          state: [this.claimVo.beneficiary.address.state, Validators.required],
          zipcode: [this.claimVo.beneficiary.address.zipcode, Validators.required],
        })
      }),

      subscriber: this.fb.group({
        identifier: [this.claimVo.subscriber ? this.claimVo.subscriber.identifier : ''],
        firstName: [this.claimVo.subscriber ? this.claimVo.subscriber.firstName : ''],
        lastName: [this.claimVo.subscriber ? this.claimVo.subscriber.lastName : ''],
        dob: [this.claimVo.subscriber ? this.claimVo.subscriber.dob : ''],
        gender: [this.claimVo.subscriber ? this.claimVo.subscriber.gender : ''],
        description: [],
        address: this.fb.group({
          address: [this.claimVo.subscriber && this.claimVo.subscriber.address ? this.claimVo.subscriber.address.address : ''],
          city: [this.claimVo.subscriber && this.claimVo.subscriber.address ? this.claimVo.subscriber.address.city : ''],
          state: [this.claimVo.subscriber && this.claimVo.subscriber.address ? this.claimVo.subscriber.address.state : ''],
          zipcode: [this.claimVo.subscriber && this.claimVo.subscriber.address ? this.claimVo.subscriber.address.zipcode : ''],
        })
      }),

      billing: this.fb.group({
        npi: [this.claimVo.billing.npi, Validators.required],
        taxonomy: [this.claimVo.billing.taxonomy, Validators.required],
        firstName: [this.claimVo.billing.firstName],
        lastName: [this.claimVo.billing.lastName],
        organizationName: [this.claimVo.billing.organizationName],
        taxId: [this.claimVo.billing.taxId, Validators.required],
        type: [this.claimVo.billing.type, Validators.required],
        description: [],
        serviceFacility: [],
        address: this.fb.group({
          address: [this.claimVo.billing.address.address, Validators.required],
          city: [this.claimVo.billing.address.city, Validators.required],
          state: [this.claimVo.billing.address.state, Validators.required],
          zipcode: [this.claimVo.billing.address.zipcode, Validators.required],
        })
      }),
      checkboxControl: [''],

      servicing: this.fb.group({
        npi: [this.claimVo.servicing.npi],
        taxonomy: [this.claimVo.servicing.taxonomy],
        firstName: [this.claimVo.servicing.firstName],
        lastName: [this.claimVo.servicing.lastName],
        organizationName: [this.claimVo.servicing.organizationName],
        taxId: [this.claimVo.servicing.taxId],
        type: [this.claimVo.servicing.type],
        description: [],
        serviceFacility: [],
        address: this.fb.group({
          address: [this.claimVo.servicing.address.address],
          city: [this.claimVo.servicing.address.city],
          state: [this.claimVo.servicing.address.state],
          zipcode: [this.claimVo.servicing.address.zipcode],
        })
      }),

      payor: this.fb.group({
        identifier: [this.claimVo.payor.identifier, Validators.required],
        name: [this.claimVo.payor.name, Validators.required],
        description: [],
        address: this.fb.group({
          address: [this.claimVo.payor.address.address, Validators.required],
          city: [this.claimVo.payor.address.city, Validators.required],
          state: [this.claimVo.payor.address.state, Validators.required],
          zipcode: [this.claimVo.payor.address.zipcode, Validators.required],
        })
      }),

      claimHeader: this.fb.group({
        billedAmount: [this.claimVo.claimHeader.billedAmount, Validators.required],
        billedUnits: [this.claimVo.claimHeader.billedUnits, Validators.required],
        fromDate: [this.claimVo.claimHeader.fromDate, Validators.required],
        toDate: [this.claimVo.claimHeader.toDate, Validators.required],
        frequency: [this.claimVo.claimHeader.frequency, Validators.required],
        parentTCN: [this.claimVo.claimHeader.parentTCN],
        source: [this.claimVo.claimHeader.source, Validators.required],
        primaryDiagnosis: [this.claimVo.claimHeader.primaryDiagnosis],
        patientControlNo: [this.claimVo.claimHeader.patientControlNo, Validators.required],
        facilityType: [this.claimVo.claimHeader.facilityType, Validators.required],
        serviceFacility: this.fb.group({
          npi: [this.claimVo.claimHeader.serviceFacility.npi],
          taxonomy: [this.claimVo.claimHeader.serviceFacility.taxonomy],
          firstName: [this.claimVo.claimHeader.serviceFacility.firstName],
          lastName: [this.claimVo.claimHeader.serviceFacility.lastName],
          organizationName: [this.claimVo.claimHeader.serviceFacility.organizationName],
          taxId: [this.claimVo.claimHeader.serviceFacility.taxId],
          type: [this.claimVo.claimHeader.serviceFacility.type],
          serviceFacility: [this.claimVo.claimHeader.serviceFacility.serviceFacility],
          description: [],
          address: this.fb.group({
            address: [this.claimVo.claimHeader.serviceFacility.address ? this.claimVo.claimHeader.serviceFacility.address.address : ''],
            city: [this.claimVo.claimHeader.serviceFacility.address ? this.claimVo.claimHeader.serviceFacility.address.city : ''],
            state: [this.claimVo.claimHeader.serviceFacility.address ? this.claimVo.claimHeader.serviceFacility.address.state : ''],
            zipcode: [this.claimVo.claimHeader.serviceFacility.address ? this.claimVo.claimHeader.serviceFacility.address.zipcode : ''],
          })
        }),
        secondaryDiagnosisList: [''],
        admitDiagnosis: [this.claimVo.claimHeader.admitDiagnosis],
        surgicalCode: [],
        surgicalCodeDate: [],
        priorAuth1: [this.claimVo.claimHeader.priorAuth1],
        priorAuth2: [this.claimVo.claimHeader.priorAuth2],
        drgCode: [this.claimVo.claimHeader.drgCode],
        admitDate: [this.claimVo.claimHeader.admitDate],
        dischargeDate: [this.claimVo.claimHeader.dischargeDate],
        patientStatus: [this.claimVo.claimHeader.patientStatus],
        dischargeStatus: [this.claimVo.claimHeader.dischargeStatus],
        admitTime: [this.claimVo.claimHeader.admitTime],
        dischargeTime: [this.claimVo.claimHeader.dischargeTime],
        surgicalCodeList: this.fb.array([
          this.addClaimSurgicalCode()
        ]),
        occuranceCodeList: this.fb.array([
          this.addClaimOccuranceCode()
        ]),
        occuranceSpanCodeList: this.fb.array([
          this.addClaimOccuranceSpanCode()
        ]),
        valueCodeList: this.fb.array([
          this.addClaimValueCode()
        ]),
        conditionCodeList: [''],
        treatmentCodeList: [''],
        dental: this.fb.group({
          toothStatusList: this.fb.array([
            this.addToothStatus()
          ]),
        }),
        expectedResult: this.fb.group({

          // paidAmount: [this.claimVo.claimHeader.expectedResult.paidAmount, Validators.required],
          // paidUnits: [this.claimVo.claimHeader.expectedResult.paidUnits, Validators.required],
          // allowedAmount: [this.claimVo.claimHeader.expectedResult.allowedAmount, Validators.required],
          // claimType: [this.claimVo.claimHeader.expectedResult.claimType, Validators.required],
          // errorCodesList: [this.claimVo.claimHeader.expectedResult.errorCodesList]
        })
      }),

      services: this.fb.array([
        this.addService()
      ]),
    });


    // add expected elements form controls

    this.service.getElementConfigList('Header').subscribe(data => {
      this.elementConfigList = data;
      if (this.elementConfigList.length > 0) {
        const headerFormGroup = (this.form.get('claimHeader').get('expectedResult') as FormGroup);
        this.elementConfigList.forEach(control => {
          headerFormGroup.registerControl(control.fieldName, this.fb.control('', []));
          // if (control.fieldType === 'Multi Choice') {
          //   this.headerExpectedElementsChipList[control.fieldName] = this.list;
          //   this.list = [];
          // }
        });
        headerFormGroup.updateValueAndValidity();
        this.elementConfigList.forEach(element => {
          if (element.controlType === 'Select Box') {
            this.headerExpectedElementsOptions = JSON.parse(element.json);
          }
          if (element.isMandatory === 'Y') {
            const expectedControls = this.form.get('claimHeader').get('expectedResult').get(element.fieldName);
            expectedControls.setValidators([Validators.required]);
            expectedControls.updateValueAndValidity();
          }
        });
      }
    });

    this.service.getElementConfigList('Line').subscribe(data => {
      this.lineElementConfigList = data;
      data.forEach(lineElement => {
        if (lineElement.controlType === 'Select Box') {
          this.lineExpectedElementsOptions = JSON.parse(lineElement.json);
        }
      });
      if (this.lineElementConfigList.length > 0) {
        this.addExpectedElementAtLineLevel(0, this.lineElementConfigList);
      }
    });

    this.loadInstitutionalForm();
    this.addAnotherToothStatus(null);


    // Benificiary Autocomplete list
    this.form.get('beneficiary').get('identifier').valueChanges
      .pipe(debounceTime(1300))
      .subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getBeneficiaryVOList(data).subscribe(result => {
              this.beneficiaryList = result;
            });
          }
        });

    // Subscriber Autocomplete list
    this.form.get('subscriber').get('identifier').valueChanges
      .pipe(debounceTime(1300))
      .subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getBeneficiaryVOList(data).subscribe(result => {
              this.beneficiaryList = result;
            });
          }
        });

    // Biling Provider Autocomplete list
    this.form.get('billing').get('npi').valueChanges
      .pipe(debounceTime(500)).subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getProviderVOList(data).subscribe(result => {
              this.providerList = result;
            });
          }
        });

    // Service Provider Autocomplete list
    this.form.get('servicing').get('npi').valueChanges
      .pipe(debounceTime(500)).subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getProviderVOList(data).subscribe(result => {
              this.providerList = result;
            });
          }
        });

    // servicing facility autocomplete list
    this.form.get('claimHeader').get('serviceFacility').get('npi').valueChanges
      .pipe(debounceTime(500)).subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getProviderVOList(data).subscribe(result => {
              this.providerList = result;
            });
          }
        });

    // Payor Autocomplete list
    this.form.get('payor').get('identifier').valueChanges
      .pipe(debounceTime(800))
      .subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getPayorVOList(data).subscribe(result => {
              this.payorList = result;
            });
          }
        });

    // PriorAuth1 Autocomplete list
    this.form.get('claimHeader').get('priorAuth1').valueChanges
      .pipe(debounceTime(500))
      .subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getPaVOList(data).subscribe(result => {
              this.paList = result;
            });
          }
        });

    // PriorAuth2 Autocomplete list
    this.form.get('claimHeader').get('priorAuth2').valueChanges
      .pipe(debounceTime(500))
      .subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getPaVOList(data).subscribe(result => {
              this.paList = result;
            });
          }
        });

    this.getServiceLineProviderAutoCompleteList('0');
    this.getServiceLinePaAutoCompleteList('0');
    this.getServiceLinePa2AutoCompleteList('0');
    this.lineCheckBoxontrol['0'] = false;
    this.lineServiceFacilityReadOnlyValue['0' + '_' + 'serviceFacility'] = false;
  }

  getOptionsValues(json) {
    const options: any[] = JSON.parse(json);
    return options;
  }

  setValidatorsOriginalClaim(event) {
    if (event.isUserInput === true) {
      if (event.source.value === '7' || event.source.value === '8') {
        this.form.get('claimHeader').get('parentTCN').setValidators([Validators.required]);
      } else {
        this.form.get('claimHeader').get('parentTCN').clearValidators();
      }
      this.form.get('claimHeader').get('parentTCN').updateValueAndValidity();
    }
  }

  setValidatorsForServicingFacility(form) {
    const serviceFacilityForm = form as FormGroup;
    const npi = serviceFacilityForm.get('npi').value;
    if (npi !== null && npi !== '' && npi !== undefined) {
      this.setValidatorsForProvider(serviceFacilityForm);
    } else {
      this.removeValidorsForProvider(serviceFacilityForm);
    }
  }


  setValidatorsForProvider(serviceFacilityForm: FormGroup) {
    const npi = serviceFacilityForm.get('npi');
    const taxonomy = serviceFacilityForm.get('taxonomy');
    const firstName = serviceFacilityForm.get('firstName');
    const lastName = serviceFacilityForm.get('lastName');
    const organizationName = serviceFacilityForm.get('organizationName');
    const taxId = serviceFacilityForm.get('taxId');
    const type = serviceFacilityForm.get('type');
    const serviceFacility = serviceFacilityForm.get('serviceFacility');
    const address = serviceFacilityForm.get('address');
    const addressControl = address.get('address');
    const city = address.get('city');
    const state = address.get('state');
    const zipCode = address.get('zipcode');
    npi.setValidators([Validators.required]);
    npi.updateValueAndValidity();
    taxonomy.setValidators([Validators.required]);
    taxonomy.updateValueAndValidity();
    firstName.setValidators([Validators.required]);
    firstName.updateValueAndValidity();
    lastName.setValidators([Validators.required]);
    lastName.updateValueAndValidity();
    organizationName.setValidators([Validators.required]);
    organizationName.updateValueAndValidity();
    taxId.setValidators([Validators.required]);
    taxId.updateValueAndValidity();
    type.setValidators([Validators.required]);
    type.updateValueAndValidity();
    serviceFacility.setValidators([Validators.required]);
    serviceFacility.updateValueAndValidity();
    addressControl.setValidators([Validators.required]);
    addressControl.updateValueAndValidity();
    city.setValidators([Validators.required]);
    city.updateValueAndValidity();
    state.setValidators([Validators.required]);
    state.updateValueAndValidity();
    zipCode.setValidators([Validators.required]);
    zipCode.updateValueAndValidity();
  }

  removeValidorsForProvider(serviceFacilityForm: FormGroup) {
    const npi = serviceFacilityForm.get('npi');
    const taxonomy = serviceFacilityForm.get('taxonomy');
    const firstName = serviceFacilityForm.get('firstName');
    const lastName = serviceFacilityForm.get('lastName');
    const organizationName = serviceFacilityForm.get('organizationName');
    const taxId = serviceFacilityForm.get('taxId');
    const type = serviceFacilityForm.get('type');
    const serviceFacility = serviceFacilityForm.get('serviceFacility');
    const address = serviceFacilityForm.get('address');
    const addressControl = address.get('address');
    const city = address.get('city');
    const state = address.get('state');
    const zipCode = address.get('zipcode');
    npi.clearValidators();
    npi.updateValueAndValidity();
    taxonomy.clearValidators();
    taxonomy.updateValueAndValidity();
    firstName.clearValidators();
    firstName.updateValueAndValidity();
    lastName.clearValidators();
    lastName.updateValueAndValidity();
    organizationName.clearValidators();
    organizationName.updateValueAndValidity();
    taxId.clearValidators();
    taxId.updateValueAndValidity();
    type.clearValidators();
    type.updateValueAndValidity();
    serviceFacility.clearValidators();
    serviceFacility.updateValueAndValidity();
    addressControl.clearValidators();
    addressControl.updateValueAndValidity();
    city.clearValidators();
    city.updateValueAndValidity();
    state.clearValidators();
    state.updateValueAndValidity();
    zipCode.clearValidators();
    zipCode.updateValueAndValidity();
  }

  addExpectedElementAtLineLevel(i, elementConfigList) {
    const index = '' + i;
    const serviceLine = (this.form.get('services') as FormArray).get(index);
    const expectedElement = (serviceLine.get('expectedElements') as FormGroup);
    if (elementConfigList) {
      elementConfigList.forEach(control => expectedElement.addControl(control.fieldName, this.fb.control('', [])));
      elementConfigList.forEach(element => {
        if (element.isMandatory === 'Y') {
          const expectedControls = expectedElement.get(element.fieldName);
          expectedControls.setValidators([Validators.required]);
          expectedControls.updateValueAndValidity();
        }
      });
    }
  }

  setHeaderLevelValidatorsForInstitutionalClaims(event) {
    if (event.isUserInput && event.source.value === 'I') {
      const headerForm = this.form.get('claimHeader');
      const drgCode = headerForm.get('drgCode');
      // const admitDate = headerForm.get('admitDate');
      // const dischargeDate = headerForm.get('dischargeDate');
      // const patientStatus = headerForm.get('patientStatus');
      // const dischargeStatus = headerForm.get('dischargeStatus');
      // const admitTime = headerForm.get('admitTime');
      // const dischargeTime = headerForm.get('dischargeTime');
      drgCode.setValidators([Validators.required]);
      // admitDate.setValidators([Validators.required]);
      // dischargeDate.setValidators([Validators.required]);
      // patientStatus.setValidators([Validators.required]);
      // dischargeStatus.setValidators([Validators.required]);
      // admitTime.setValidators([Validators.required]);
      // dischargeTime.setValidators([Validators.required]);
      drgCode.updateValueAndValidity();
      // admitDate.updateValueAndValidity();
      // dischargeDate.updateValueAndValidity();
      // patientStatus.updateValueAndValidity();
      // dischargeStatus.updateValueAndValidity();
      // admitTime.updateValueAndValidity();
      // dischargeTime.updateValueAndValidity();
    }
  }


  getBeneficiaryInfo(identifier: BeneficiaryVO) {
    this.form.get('beneficiary').setValue(identifier);
  }

  getSubscriberInfo(identifier: BeneficiaryVO) {
    this.form.get('subscriber').setValue(identifier);
  }

  getProviderInfo(npi: ProviderVO, type: string) {
    if (type === 'billing') {
      this.form.get('billing').setValue(npi);
    } else if (type = ' serviceFacility') {
      this.form.get('claimHeader').get('serviceFacility').setValue(npi);
    } else {
      this.form.get('servicing').setValue(npi);
    }
  }

  getPayourInfo(identifier: PayorVO) {
    this.form.get('payor').setValue(identifier);
  }

  getPa1Info(paVo: PaVO) {
    this.form.get('claimHeader').get('priorAuth1').setValue(paVo.number);
  }
  getPa2Info(paVo: PaVO) {
    this.form.get('claimHeader').get('priorAuth2').setValue(paVo.number);
  }

  sameAsBillingProvider(event) {
    this.checkBoxControl = !this.checkBoxControl;
    const servicing = this.form.get('servicing');
    if (event.checked) {
      servicing.setValue(this.form.get('billing').value);
      this.servicingFieldDisabled = true;
      this.form.controls.servicing.get('type').disable();
    } else {
      this.servicingFieldDisabled = false;
      this.form.controls.servicing.get('type').enable();
      this.resetServiceFacilityValues(servicing);
    }
  }

  sameAsClaimHeader(event, i: number) {
    const index = '' + i;
    const serviceForm = (this.form.get('services') as FormArray).get(index);
    const serviceFacility = serviceForm.get('serviceFacility');
    const headerServiceFacility = this.form.get('claimHeader').get('serviceFacility').value;
    const control = this.form.controls.services.get(index);

    if (event.checked) {
      serviceFacility.setValue(headerServiceFacility);
      this.lineServiceFacilityReadOnlyValue[i + '_' + 'serviceFacility'] = true;
      control.get('serviceFacility').get('type').disable();
    } else {
      this.lineServiceFacilityReadOnlyValue[i + '_' + 'serviceFacility'] = false;
      control.get('serviceFacility').get('type').enable();
      serviceFacility.get('npi').setValue('');
      this.resetServiceFacilityValues(serviceFacility);
    }
  }

  resetServiceFacilityValues(serviceFacility: AbstractControl) {
    serviceFacility.get('npi').setValue('');
    serviceFacility.get('taxonomy').setValue('');
    serviceFacility.get('firstName').setValue('');
    serviceFacility.get('lastName').setValue('');
    serviceFacility.get('organizationName').setValue('');
    serviceFacility.get('taxId').setValue('');
    serviceFacility.get('serviceFacility').setValue('');
    serviceFacility.get('type').setValue('');
    serviceFacility.get('address').get('address').setValue('');
    serviceFacility.get('address').get('city').setValue('');
    serviceFacility.get('address').get('state').setValue('');
    serviceFacility.get('address').get('zipcode').setValue('');
  }

  loadInstitutionalForm() {
    this.addAnotherClaimSurgicalCode(null);
    this.addAnotherClaimOccuranceCode(null);
    this.addAnotherClaimOccuranceSpanCode(null);
    this.addAnotherClaimValueCode(null);
  }

  // claim surgical code
  addClaimSurgicalCode(): FormGroup {
    return this.fb.group({
      surgicalCode: [''],
      surgicalDate: ['']
    });
  }

  getSurgicalCodeValidator(i) {
    const index = '' + i;
    const form = this.form.get('claimHeader').get('surgicalCodeList').get(index);
    const code = form.get('surgicalCode');
    const date = form.get('surgicalDate');
    if (code.value) {
      date.setValidators([Validators.required]);
    } else if (date.value) {
      code.setValidators([Validators.required]);
    }
    code.updateValueAndValidity();
    date.updateValueAndValidity();
  }

  addAnotherClaimSurgicalCode(event) {
    let j = 0;
    if (event) {
      j = 3;
    } else {
      j = 2;
    }
    for (let i = 0; i < j; i++) {
      (this.form.get('claimHeader').get('surgicalCodeList') as FormArray).push(this.addClaimSurgicalCode());
    }
  }

  removeClaimSurgicalCode(i: number) {
    (this.form.get('claimHeader').get('surgicalCodeList') as FormArray).removeAt(i);
  }



  // claim occurance code
  addClaimOccuranceCode(): FormGroup {
    return this.fb.group({
      occuranceCode: [''],
      occuranceCodeDate: ['']
    });
  }

  getOccuranceCodeValidator(i) {
    const index = '' + i;
    const form = this.form.get('claimHeader').get('occuranceCodeList').get(index);
    const code = form.get('occuranceCode');
    const date = form.get('occuranceCodeDate');
    if (code.value) {
      date.setValidators([Validators.required]);
    } else if (date.value) {
      code.setValidators([Validators.required]);
    }
    code.updateValueAndValidity();
    date.updateValueAndValidity();
  }


  addAnotherClaimOccuranceCode(event) {
    let j = 0;
    if (event) {
      j = 3;
    } else {
      j = 2;
    }
    for (let i = 0; i < j; i++) {
      (this.form.get('claimHeader').get('occuranceCodeList') as FormArray).push(this.addClaimOccuranceCode());
    }
  }

  removeClaimOccuranceCode(i: number) {
    (this.form.get('claimHeader').get('occuranceCodeList') as FormArray).removeAt(i);
  }

  // claim occurance span code
  addClaimOccuranceSpanCode(): FormGroup {
    return this.fb.group({
      occuranceSpanCode: [''],
      occuranceSpanCodeDate: ['']
    });
  }

  getOccuranceSpanCodeValidator(i) {
    const index = '' + i;
    const form = this.form.get('claimHeader').get('occuranceSpanCodeList').get(index);
    const code = form.get('occuranceSpanCode');
    const date = form.get('occuranceSpanCodeDate');
    if (code.value) {
      date.setValidators([Validators.required]);
    } else if (date.value) {
      code.setValidators([Validators.required]);
    }
    code.updateValueAndValidity();
    date.updateValueAndValidity();
  }

  addAnotherClaimOccuranceSpanCode(event) {
    let j = 0;
    if (event) {
      j = 3;
    } else {
      j = 2;
    }
    for (let i = 0; i < j; i++) {
      (this.form.get('claimHeader').get('occuranceSpanCodeList') as FormArray).push(this.addClaimOccuranceSpanCode());
    }
  }

  removeClaimOccuranceSpanCode(i: number) {
    (this.form.get('claimHeader').get('occuranceSpanCodeList') as FormArray).removeAt(i);
  }

  // claim value code
  addClaimValueCode(): FormGroup {
    return this.fb.group({
      valueCode: [''],
      valueCodeAmount: ['']
    });
  }

  getValueCodeValidator(i) {
    const index = '' + i;
    const form = this.form.get('claimHeader').get('valueCodeList').get(index);
    const code = form.get('valueCode');
    const amount = form.get('valueCodeAmount');
    if (code.value) {
      amount.setValidators([Validators.required]);
    } else if (amount.value) {
      code.setValidators([Validators.required]);
    }
    code.updateValueAndValidity();
    amount.updateValueAndValidity();
  }


  addAnotherClaimValueCode(event) {
    let j = 0;
    if (event) {
      j = 3;
    } else {
      j = 2;
    }
    for (let i = 0; i < j; i++) {
      (this.form.get('claimHeader').get('valueCodeList') as FormArray).push(this.addClaimValueCode());
    }
  }

  removeClaimValueCode(i: number) {
    (this.form.get('claimHeader').get('valueCodeList') as FormArray).removeAt(i);
  }

  // claim tooth status
  addToothStatus(): FormGroup {
    return this.fb.group({
      toothNumber: [''],
      toothStatus: ['']
    });
  }

  getToothStatusValidator(i) {
    const index = '' + i;
    const form = this.form.get('claimHeader').get('dental').get('toothStatusList').get(index);
    const toothNumber = form.get('toothNumber');
    const status = form.get('toothStatus');
    if (toothNumber.value) {
      status.setValidators([Validators.required]);
    } else if (status.value) {
      toothNumber.setValidators([Validators.required]);
    }
    toothNumber.updateValueAndValidity();
    status.updateValueAndValidity();
  }

  addAnotherToothStatus(event) {
    let j = 0;
    if (event) {
      j = 3;
    } else {
      j = 2;
    }
    for (let i = 0; i < j; i++) {
      (this.form.get('claimHeader').get('dental').get('toothStatusList') as FormArray).push(this.addToothStatus());
    }

  }

  removeToothStatus(i: number) {
    (this.form.get('claimHeader').get('dental').get('toothStatusList') as FormArray).removeAt(i);
  }

  addService(): FormGroup {
    this.lineModifiersList.push([]);
    this.lineExpectedErrors.push([]);
    this.lineToothCodeList.push([]);
    this.lineOralCavityDesignationCodesList.push([]);


    return this.fb.group({
      claimServiceId: [''],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      procedureCode: [''],
      revenueCode: [''],
      modifiersList: [''],
      diagnosisCode1: [''],
      diagnosisCode2: [''],
      diagnosisCode3: [''],
      diagnosisCode4: [''],
      facilityType: [''],
      billedAmount: ['', Validators.required],
      billedUnits: ['', Validators.required],
      procedureCodeType: [''],
      billedUnitsMeasure: [''],
      serviceFacility: this.fb.group({
        npi: [''],
        taxonomy: [''],
        firstName: [''],
        lastName: [''],
        organizationName: [''],
        taxId: [''],
        type: [''],
        description: [''],
        serviceFacility: [''],
        address: this.fb.group({
          address: [''],
          city: [''],
          state: [''],
          zipcode: [''],
        })
      }),
      dental: this.fb.group({
        toothCodeList: [''],
        oralCavityDesignationCodeList: [''],
      }),
      priorAuth1: [''],
      priorAuth2: [''],

      servicing: this.fb.group({
        npi: [''],
        taxonomy: [''],
        firstName: [''],
        lastName: [''],
        organizationName: [''],
        taxId: [''],
        type: [''],

      }),
      expectedResult: [],
      expectedElements: this.fb.group({
      }),
      internal: this.fb.group({
        diagnosisCodePointer1: [],
        diagnosisCodePointer2: [],
        diagnosisCodePointer3: [],
        diagnosisCodePointer4: [],
        lineSequenceNo: [],
        modifiers: this.fb.group({
          modifier1: [],
          modifier2: [],
          modifier3: [],
          modifier4: []
        })
      })
    });
  }


  setValidatorsForProcedureCodeType(service: FormGroup) {
    const procedureCode = service.get('procedureCode');
    const procedureCodeType = service.get('procedureCodeType');
    if (procedureCode.value !== null && procedureCode.value !== '') {
      procedureCodeType.setValidators([Validators.required]);
    } else {
      procedureCodeType.clearValidators();
    }
    procedureCodeType.updateValueAndValidity();
  }

  setValidatorsForBilledUnitsMeasure(service: FormGroup) {
    const billedUnits = service.get('billedUnits');
    const billedUnitsMeasure = service.get('billedUnitsMeasure');
    if (billedUnits.value !== null && billedUnits.value !== '') {
      billedUnitsMeasure.setValidators([Validators.required]);
    } else {
      billedUnitsMeasure.clearValidators();
    }
    billedUnitsMeasure.updateValueAndValidity();
  }



  getServiceLinePaAutoCompleteList(i) {
    const index = '' + i;
    const service = (this.form.get('services') as FormArray).get(index);
    const serviceLinePa = service.get('priorAuth1');
    serviceLinePa.valueChanges
      .pipe(debounceTime(800))
      .subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getPaVOList(data).subscribe(result => {
              this.paList = result;
            });
          }
        });
  }

  getServiceLinePa2AutoCompleteList(i) {
    const index = '' + i;
    const service = (this.form.get('services') as FormArray).get(index);
    const serviceLinePa2 = service.get('priorAuth2');
    serviceLinePa2.valueChanges
      .pipe(debounceTime(800))
      .subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getPaVOList(data).subscribe(result => {
              this.paList = result;
            });
          }
        });
  }


  getServiceLineProviderAutoCompleteList(i) {
    const index = '' + i;
    const service = (this.form.get('services') as FormArray).get(index);
    const servicingProvider = service.get('serviceFacility').get('npi');
    servicingProvider.valueChanges
      .pipe(debounceTime(800))
      .subscribe(
        data => {
          if (data !== '' && data !== null) {
            this.service.getProviderVOList(data).subscribe(result => {
              this.providerList = result;
            });
          }
        });
  }

  getServiceLinePaInfo(paVO: PaVO, i) {
    const index = '' + i;
    const service = (this.form.get('services') as FormArray).get(index);
    service.get('priorAuth1').setValue(paVO.number);
  }

  getServiceLinePa2Info(paVO: PaVO, i) {
    const index = '' + i;
    const service = (this.form.get('services') as FormArray).get(index);
    service.get('priorAuth2').setValue(paVO.number);
  }

  getLineProviderInfo(providerVO: ProviderVO, i) {
    const index = '' + i;
    const service = (this.form.get('services') as FormArray).get(index);
    const servicingProvider = service.get('serviceFacility');
    servicingProvider.setValue(providerVO);
  }

  addAnotherService(i, event): void {
    (<FormArray>this.form.get('services')).push(this.addService());
    const length = (<FormArray>this.form.get('services')).length - 1;
    this.getServiceLineProviderAutoCompleteList(length);
    this.getServiceLinePaAutoCompleteList(length);
    this.getServiceLinePa2AutoCompleteList(length);
    this.lineServiceFacilityReadOnlyValue[(i + 1) + '_' + 'serviceFacility'] = false;
    this.lineCheckBoxontrol[i + 1] = false;
    if (event && this.lineElementConfigList.length > 0) {
      this.addExpectedElementAtLineLevel(length, this.lineElementConfigList);
    }
  }

  removeThisService(i: number) {
    (this.form.get('services') as FormArray).removeAt(i);
  }


  save(userForm: NgForm) {
    let templateName = this.form.value.templateName;
    let templateId = this.form.value.templateId;
    if (this.claimVo.templateId > 0) {
      templateId = this.claimVo.templateId;
      templateName = this.claimVo.templateName;
    }
    this.removeEmptyFormGroupFormFormArray();
    this.clearFormArrayBasedOnFormType(this.form.get('formType').value);
    this.claimVo = this.form.value;

    // set value for header expected elements
    const expectedElementJson = JSON.parse(JSON.stringify(this.form.get('claimHeader').get('expectedResult').value));
    for (let i = 0; i < this.elementConfigList.length; i++) {
      const element = this.elementConfigList[i];
      if (element.fieldType === 'Multi Choice') {
        if (this.headerExpectedElementsChipList[element.fieldName]) {
          expectedElementJson[element.fieldName] = this.getListFromPlaceHolder(this.headerExpectedElementsChipList[element.fieldName]);
        }
      }
    }
    const stringify = JSON.stringify(expectedElementJson);
    this.claimVo.claimHeader.expectedElements = stringify;
    this.claimVo.templateName = templateName;
    this.claimVo.templateId = templateId;
    this.claimVo.claimHeader.secondaryDiagnosisList = this.getListFromPlaceHolder(this.chipHeaderSecondaryDiagnosisList);

    this.claimVo.claimHeader.conditionCodeList = this.getListFromPlaceHolder(this.chipClaimConditionCodeList);
    this.claimVo.claimHeader.treatmentCodeList = this.getListFromPlaceHolder(this.chipClaimTreatmentCodeList);

    for (let i = 0; i < (this.form.get('services') as FormArray).length; i++) {
      const index = '' + i;
      const serviceForm = (this.form.get('services') as FormArray).get(index);
      const lineExpectedElementJson = JSON.parse(JSON.stringify(serviceForm.get('expectedElements').value));
      for (let line = 0; line < this.lineElementConfigList.length; line++) {
        const lineElementConfig = this.lineElementConfigList[line];
        if (lineElementConfig.fieldType === 'Multi Choice' && this.lineExepectedElementChipList[i + '_' + lineElementConfig.fieldName]) {
          lineExpectedElementJson[lineElementConfig.fieldName] =
            this.getListFromPlaceHolder(this.lineExepectedElementChipList[i + '_' + lineElementConfig.fieldName]);
        }
      }
      this.claimVo.services[i].expectedElements = JSON.stringify(lineExpectedElementJson);
    }

    for (let index = 0; index < this.claimVo.services.length; index++) {
      if (this.lineModifiersList[index]) {
        this.claimVo.services[index].modifiersList = this.getListFromPlaceHolder(this.lineModifiersList[index]);
      }
      this.claimVo.services[index].dental.toothCodeList = this.getListFromPlaceHolder(this.lineToothCodeList[index]);
      this.claimVo.services[index].dental.oralCavityDesignationCodeList =
        this.getListFromPlaceHolder(this.lineOralCavityDesignationCodesList[index]);

    }
    if (userForm.valid) {
      let saveinDB: any;
      if (this.fromClaim === 0) {
        saveinDB = this.service.save(this.claimVo);
      } else if (this.fromClaim === 1) {
        if (this.claimsId === 0) {

          this.claimEnity.templateId = this.claimVo.templateId;
          this.claimEnity.testCaseName = this.testGroupCaseVO.claimName;

          const testCaseGroupNames = this.testGroupCaseVO.claimTestcaseGroupName.split(',');
          const testCaseGroups = [];
          for (let i = 0; i < testCaseGroupNames.length; i++) {
            const groupVo = new TestGroupVO();
            groupVo.id = parseInt(testCaseGroupNames[i], 10);
            testCaseGroups.push(groupVo);
          }
          this.claimEnity.testcaseGroups = testCaseGroups;
          this.claimEnity.jsonData = this.claimVo;
          saveinDB = this.service.saveClaim(this.claimEnity);
        } else {
          this.claimEnity.testCaseName = this.testGroupCaseVO.claimName;
          this.claimEnity.templateId = this.testGroupCaseVO.templateId;

          const testCaseGroupNames = this.testGroupCaseVO.claimTestcaseGroupName.split(',');
          const testCaseGroups = [];
          for (let i = 0; i < testCaseGroupNames.length; i++) {
            const groupVo = new TestGroupVO();
            groupVo.id = parseInt(testCaseGroupNames[i], 10);
            testCaseGroups.push(groupVo);
          }
          this.claimEnity.id = this.claimsId;
          this.claimEnity.testcaseGroups = testCaseGroups;
          this.claimEnity.jsonData = this.claimVo;
          saveinDB = this.service.updateClaim(this.claimEnity);
        }
      }
      saveinDB.subscribe(data => {
        this.responseMsg = data;
        if (data.response === 'Created' || 'Updated' && (data.response !== 'Already Exist')) {
          this.snackBar.openFromComponent(SnackBarComponent, {
            data: data.response,
          });
          if (data.response !== 'Template Name already exist') {
            this.servicingFieldDisabled = false;
            this.checkBoxControl = false;
            userForm.resetForm();
            this.resetForm();
            if (this.lineElementConfigList.length > 0) {
              this.addExpectedElementAtLineLevel(0, this.lineElementConfigList);
            }
            this.router.navigate(['/list-template']);
          }
        }
      });
    }

  }

  clearFormArrayBasedOnFormType(type) {

    if (type === 'I') {
      this.clearDentalFormArray();
    } else if (type === 'D') {
      this.clearInstitutionalFormArray();
    } else {
      this.clearDentalFormArray();
      this.clearInstitutionalFormArray();
    }
  }

  clearDentalFormArray() {
    this.clearFormArray((this.form.get('claimHeader').get('dental').get('toothStatusList') as FormArray));
  }
  clearInstitutionalFormArray() {
    this.clearFormArray(this.getClaimHeaderFormArray('surgicalCodeList'));
    this.clearFormArray(this.getClaimHeaderFormArray('occuranceCodeList'));
    this.clearFormArray(this.getClaimHeaderFormArray('occuranceSpanCodeList'));
    this.clearFormArray(this.getClaimHeaderFormArray('valueCodeList'));
  }
  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }



  getClaimHeaderFormArray(name: string): FormArray {
    return (this.form.get('claimHeader').get(name) as FormArray);
  }


  getListFromPlaceHolder(list: Placeholder[]): string[] {
    const values = [];
    list.forEach(placeholder => values.push(placeholder.name));

    return values;
  }

  getPlaceholderFromStringArrayForExpectedElements(values: string[], name: string): Placeholder[] {
    const output = [];
    if (values && values.length > 0) {
      values.forEach(token => output.push({ name: token, fieldName: name }));
    }
    return output;
  }

  getPlaceholderFromStringArray(values: string[]): Placeholder[] {
    const output = [];
    if (values && values.length > 0) {
      values.forEach(token => output.push({ name: token }));
    }
    return output;
  }



  addDiagnosis(event: MatChipInputEvent): void {
    this.addData(event, this.chipHeaderSecondaryDiagnosisList);
  }

  addConditionCodes(event: MatChipInputEvent): void {
    this.addData(event, this.chipClaimConditionCodeList);
  }

  addTreatmentCodes(event: MatChipInputEvent): void {
    this.addData(event, this.chipClaimTreatmentCodeList);
  }

  addHeaderExpectedData(event: MatChipInputEvent, name: string, type: string) {
    let holder = this.headerExpectedElementsChipList[name];
    if (!holder) {
      holder = this.list;
    }
    this.addExpectedData(event, holder, name, type);
    this.list = [];
  }

  addModifier(index: number, event: MatChipInputEvent): void {
    if (this.lineModifiersList[index].length < 4) {
      this.addData(event, this.lineModifiersList[index]);
    }
  }

  addData(event: MatChipInputEvent, list: Placeholder[]) {
    const input = event.input;
    const value = event.value;


    if ((value || '').trim()) {
      list.push({ name: value.trim() });
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  addServiceLineExpectedError(index: number, event: MatChipInputEvent, fieldName: string, type: string): void {
    const lineChipName = index + '_' + fieldName;
    let holder = this.lineExepectedElementChipList[lineChipName];
    if (!holder) {
      holder = this.list;
    }
    this.addExpectedData(event, holder, lineChipName, type);
    this.list = [];
  }

  addExpectedData(event: MatChipInputEvent, list: Placeholder[], name: string, type: string) {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      list.push({ name: value.trim() });
    }
    if (type === 'header') {
      this.headerExpectedElementsChipList[name] = list;
    } else {
      this.lineExepectedElementChipList[name] = list;
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  addServiceLineToothCodes(index: number, event: MatChipInputEvent): void {
    this.addData(event, this.lineToothCodeList[index]);
  }

  addServiceLineOralCavityCode(index: number, event: MatChipInputEvent): void {
    this.addData(event, this.lineOralCavityDesignationCodesList[index]);
  }

  removeServiceLineErrorCode(name: string, placeholder: Placeholder, fieldName: string, i: number, lineListIndex: number): void {
    const list = this.lineExepectedElementChipList[name];
    if (list.length === 1 && this.lineElementConfigList[lineListIndex].isMandatory === 'Y') {
      const index = '' + i;
      const serviceForm = (this.form.get('services') as FormArray).get(index);
      const expectedElements = serviceForm.get('expectedElements');
      expectedElements.get(fieldName).setValue('');
      expectedElements.get(fieldName).setValidators([Validators.required]);
      expectedElements.get(fieldName).updateValueAndValidity();
    }
    this.removeData(placeholder, this.lineExepectedElementChipList[name]);
  }

  removeServiceLineToothCodes(index: number, placeholder: Placeholder): void {
    this.removeData(placeholder, this.lineToothCodeList[index]);
  }

  removeServiceLineOralCavityCode(index: number, placeholder: Placeholder): void {
    this.removeData(placeholder, this.lineOralCavityDesignationCodesList[index]);
  }

  removeDiagnosis(placeholder: Placeholder): void {
    this.removeData(placeholder, this.chipHeaderSecondaryDiagnosisList);
    this.getSelectedValues();
  }

  removeConditionCode(placeholder: Placeholder): void {
    this.removeData(placeholder, this.chipClaimConditionCodeList);
  }

  removeTreatmentCode(placeholder: Placeholder): void {
    this.removeData(placeholder, this.chipClaimTreatmentCodeList);
  }

  removeModifier(index: number, placeholder: Placeholder): void {
    this.removeData(placeholder, this.lineModifiersList[index]);
  }

  removeHeaderExpectedError(placeholder: Placeholder, fieldName: string): void {
    const list = this.headerExpectedElementsChipList[fieldName];
    const headerFormGroup = (this.form.get('claimHeader').get('expectedResult') as FormGroup);
    if (list.length === 1) {
      headerFormGroup.get(fieldName).setValue('');
      headerFormGroup.get(fieldName).updateValueAndValidity();
    }
    this.removeData(placeholder, list);
  }

  removeData(placeholder: Placeholder, list: Placeholder[]): void {
    const index = list.indexOf(placeholder);

    if (index >= 0) {
      list.splice(index, 1);
    }
  }

  getSelectedValues(): void {
    this.secondaryDiagnoses = this.chipHeaderSecondaryDiagnosisList.map(a => a.name);
    this.secondaryDiagnoses.unshift(this.form.get('claimHeader').get('primaryDiagnosis').value);
  }

  formatDate(date: any): string {
    return this.datePipe.transform(date, 'MM/dd/yyyy');
  }

  loadUsingTemplateId(id: number, testGroupCaseVO: TestGroupCaseVO, claimId: number) {
    this.resetForm();
    if (testGroupCaseVO === null) {
      this.service.getAccessForTemplateInfo(id).subscribe(booleanData => {
        this.userAccess = booleanData;
        if (this.userAccess === false) {
          this.snackBar.openFromComponent(SnackBarComponent, {
            data: 'You don\'t have an access to update this Template'
          });
        }

      });
    }


    this.claimsId = claimId;
    this.isTemplate = false;
    this.isDuplicateTemplate = true;
    this.testGroupCaseVO = testGroupCaseVO;

    if (this.testGroupCaseVO != null) {
      this.fromClaim = 1;
    } else {
      this.fromClaim = 0;
    }

    if (this.claimsId === 0) { // edit template
      this.service.getTemplateInfo(id).subscribe(data => {
        this.loadTemplateWithData(data);
      });
    } else { // edit testcase (claim)
      this.service.getClaimDetail(this.claimsId).subscribe(data => {
        this.claimEnity = data;
        this.loadTemplateWithData(data.jsonData);
      });
    }
  }

  updateTestcaseGroupDetails(testGroupCaseVO: TestGroupCaseVO) {
    this.testGroupCaseVO = testGroupCaseVO;
  }

  loadTemplateWithData(data: any) {

    this.form.reset();

    this.clearFormArrayBasedOnFormType(data.formType);
    this.claimVo = data;
    this.userAccess = true;
    this.claimVo.templateId = data.templateId;
    this.claimVo.formType = data.formType;
    this.ngOnInit();
    const headerElements = JSON.parse(this.claimVo.claimHeader.expectedElements);
    const headerFormGroup = (this.form.get('claimHeader').get('expectedResult') as FormGroup);
    if (this.elementConfigList) {
      for (let i = 0; i < this.elementConfigList.length; i++) {
        const elements = this.elementConfigList[i];
        const key = elements.fieldName;
        if (elements.fieldType !== 'Multi Choice') {
          headerFormGroup.addControl(key, this.fb.control(headerElements[key], []));
        } else {
          if (headerElements[key]) {
            headerFormGroup.addControl(key, this.fb.control(' ', []));
          } else {
            headerFormGroup.addControl(key, this.fb.control('', []));
          }
        }
        if (elements.fieldType === 'Multi Choice') {
          const placeholder = this.getPlaceholderFromStringArray(headerElements[key]);
          this.headerExpectedElementsChipList[key] = placeholder;
        }
      }

    }
    this.chipHeaderSecondaryDiagnosisList = this.getPlaceholderFromStringArray(this.claimVo.claimHeader.secondaryDiagnosisList);
    this.chipClaimConditionCodeList = this.getPlaceholderFromStringArray(this.claimVo.claimHeader.conditionCodeList);
    this.chipClaimTreatmentCodeList = this.getPlaceholderFromStringArray(this.claimVo.claimHeader.treatmentCodeList);


    if (this.claimVo.formType === 'I') {

      // load claim surgical code
      for (let i = 0; i < this.claimVo.claimHeader.surgicalCodeList.length; i++) {
        const index = '' + i;
        const surgicalCodeFormArray = (this.form.get('claimHeader').get('surgicalCodeList') as FormArray);
        if (i > 0 && (!surgicalCodeFormArray.get(index))) {
          surgicalCodeFormArray.push(this.addClaimSurgicalCode());
        }
        const surgicalCodeForm = surgicalCodeFormArray.get(index);
        surgicalCodeForm.setValue(this.claimVo.claimHeader.surgicalCodeList[i]);
      }

      // load claim occurance code
      for (let i = 0; i < this.claimVo.claimHeader.occuranceCodeList.length; i++) {
        const index = '' + i;
        const occuranceCodeFormArray = (this.form.get('claimHeader').get('occuranceCodeList') as FormArray);
        if (i > 0 && (!occuranceCodeFormArray.get(index))) {
          occuranceCodeFormArray.push(this.addClaimOccuranceCode());
        }
        const occuranceCodeForm = occuranceCodeFormArray.get(index);
        occuranceCodeForm.setValue(this.claimVo.claimHeader.occuranceCodeList[i]);
      }

      // load claim occurance span code
      for (let i = 0; i < this.claimVo.claimHeader.occuranceSpanCodeList.length; i++) {
        const index = '' + i;
        const occuranceSpanCodeFormArray = (this.form.get('claimHeader').get('occuranceSpanCodeList') as FormArray);
        if (i > 0 && (!occuranceSpanCodeFormArray.get(index))) {
          occuranceSpanCodeFormArray.push(this.addClaimOccuranceSpanCode());
        }
        const occuranceCodeForm = occuranceSpanCodeFormArray.get(index);
        occuranceCodeForm.setValue(this.claimVo.claimHeader.occuranceSpanCodeList[i]);
      }

      // load claim value codes
      for (let i = 0; i < this.claimVo.claimHeader.valueCodeList.length; i++) {
        const index = '' + i;
        const valueCodesFormArray = (this.form.get('claimHeader').get('valueCodeList') as FormArray);
        if (i > 0 && (!valueCodesFormArray.get(index))) {
          valueCodesFormArray.push(this.addClaimValueCode());
        }
        const codeValueForm = valueCodesFormArray.get(index);
        codeValueForm.setValue(this.claimVo.claimHeader.valueCodeList[i]);
      }
    }

    // load claim tooth status
    if (this.claimVo.formType === 'D') {
      for (let i = 0; i < this.claimVo.claimHeader.dental.toothStatusList.length; i++) {
        const index = '' + i;
        const toothStatusFormArray = (this.form.get('claimHeader').get('dental').get('toothStatusList') as FormArray);
        if (i > 0 && (!toothStatusFormArray.get(index))) {
          toothStatusFormArray.push(this.addToothStatus());
        }
        const codeValueForm = toothStatusFormArray.get(index);
        codeValueForm.setValue(this.claimVo.claimHeader.dental.toothStatusList[i]);
      }
    }

    for (let i = 0; i < this.claimVo.services.length; i++) {
      const index = '' + i;

      if (i > 0) {
        this.addAnotherService(index, null);
      }

      const form = (this.form.get('services') as FormArray).get(index);
      const serviceLine = this.claimVo.services[i];
      const serviceLineExpectedResult = (form.get('expectedElements') as FormGroup);
      const lineExpectedElements = JSON.parse(this.claimVo.services[i].expectedElements);
      this.getSelectedValues();

      for (let j = 0; j < this.lineElementConfigList.length; j++) {
        const elements = this.lineElementConfigList[j];
        const key = elements.fieldName;
        if (elements.fieldType !== 'Multi Choice') {
          serviceLineExpectedResult.addControl(key, this.fb.control(lineExpectedElements[key], []));
        } else {
          if (lineExpectedElements[key]) {
            serviceLineExpectedResult.addControl(key, this.fb.control(' ', []));
          } else {
            serviceLineExpectedResult.addControl(key, this.fb.control('', []));
          }
        }
        if (elements.fieldType === 'Multi Choice') {
          const placeholder = this.getPlaceholderFromStringArray(lineExpectedElements[key]);
          this.lineExepectedElementChipList[i + '_' + key] = placeholder;
        }
      }


      if (this.claimVo.services[i].servicing) {
        delete this.claimVo.services[i].servicing.address;
      }

      if (!serviceLine.serviceFacility.address) {
        serviceLine.serviceFacility.address = new AddressVO();
      }

      form.get('fromDate').setValue(serviceLine.fromDate);
      form.get('toDate').setValue(serviceLine.toDate);
      form.get('facilityType').setValue(serviceLine.facilityType);
      form.get('procedureCode').setValue(serviceLine.procedureCode);
      form.get('revenueCode').setValue(serviceLine.revenueCode);
      form.get('modifiersList').setValue(serviceLine.modifiersList);
      form.get('diagnosisCode1').setValue(serviceLine.diagnosisCode1);
      form.get('diagnosisCode2').setValue(serviceLine.diagnosisCode2);
      form.get('diagnosisCode3').setValue(serviceLine.diagnosisCode3);
      form.get('diagnosisCode4').setValue(serviceLine.diagnosisCode4);
      form.get('billedAmount').setValue(serviceLine.billedAmount);
      form.get('billedUnits').setValue(serviceLine.billedUnits);
      form.get('serviceFacility').setValue(serviceLine.serviceFacility);
      form.get('dental').setValue(serviceLine.dental);
      form.get('priorAuth1').setValue(serviceLine.priorAuth1);
      form.get('priorAuth2').setValue(serviceLine.priorAuth2);
      form.get('modifiersList').setValue('');
      form.get('dental').get('toothCodeList').setValue('');
      form.get('dental').get('oralCavityDesignationCodeList').setValue('');
      if (serviceLine.procedureCodeType === null || !serviceLine.procedureCodeType) {
        form.get('procedureCodeType').setValue('HC');
      } else {
        form.get('procedureCodeType').setValue(serviceLine.procedureCodeType);
      }

      if (serviceLine.billedUnitsMeasure === null || !serviceLine.billedUnitsMeasure) {
        form.get('billedUnitsMeasure').setValue('UN');
      } else {
        form.get('billedUnitsMeasure').setValue(serviceLine.billedUnitsMeasure);
      }

      this.lineModifiersList[i] = this.getPlaceholderFromStringArray(serviceLine.modifiersList);
      this.lineToothCodeList[i] = this.getPlaceholderFromStringArray(serviceLine.dental.toothCodeList);
      this.lineOralCavityDesignationCodesList[i] = this.getPlaceholderFromStringArray(serviceLine.dental.oralCavityDesignationCodeList);
    }
  }

  removeEmptyFormGroupFormFormArray() {
    if (this.form.get('formType').value === 'I') {
      const surgicalCodeFormArray = (this.form.get('claimHeader').get('surgicalCodeList') as FormArray);
      if (surgicalCodeFormArray.length > 0) {

        for (let i = 0; i < surgicalCodeFormArray.length; i++) {
          const index = i + '';
          const suricalCodeGroup = surgicalCodeFormArray.get(index);
          if (surgicalCodeFormArray.get(index).get('surgicalCode').value === '' &&
            surgicalCodeFormArray.get(index).get('surgicalDate').value === '') {
            surgicalCodeFormArray.removeAt(i);
          }
        }
      }
    }
  }

  resetForm(): void {
    this.lineModifiersList = [];
    this.lineExpectedErrors = [];

    this.chipHeaderSecondaryDiagnosisList = [];
    this.chipClaimConditionCodeList = [];
    this.claimVo.services = [];
    this.headerExpectedElementsChipList = {};
    this.lineExepectedElementChipList = {};
    this.lineCheckBoxontrol = {};
    this.lineServiceFacilityReadOnlyValue = {};
    this.checkBoxControl = false;
    this.form.reset();
    for (let index = 0; index < (this.form.get('services') as FormArray).length; index++) {
      if (index > 0) {
        this.removeThisService(index);
      }
    }
    this.servicingFieldDisabled = false;

  }
  saveDuplicateTemplate(userForm: NgForm) {
    if (userForm.dirty) {
      this.duplicateTemplateVO.templateId = this.templateId;
      this.duplicateTemplateVO.templateName = this.form.get('templateName').value;
      this.service.saveDuplicateTemplate(this.duplicateTemplateVO).subscribe(result => {
        this.responseMsg = result.response;
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: result.response,
        });
        this.templateId = 0;
        userForm.resetForm();
        this.isTemplate = false;
        this.isDuplicateTemplate = true;
      });
    }
  }

  duplicateTemplate(id: number) {
    this.isTemplate = true;
    this.editing = false;
    this.isDuplicateTemplate = false;
    this.templateId = id;
  }
}

export interface Placeholder {
  name: string;
}

function newFunction() {
  return 'chipList';
}
