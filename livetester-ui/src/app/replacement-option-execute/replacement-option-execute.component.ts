import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { ReplacementService } from 'src/shared/service/replacement-service';
import { ReplacementVO } from './replacment-vo';
import { FormGroup, FormBuilder, NgForm, FormArray, Validators, FormControl } from '@angular/forms';
import { ReplaceDetailsVO, UniqueBeneficiaryVO, UniquePayorVO, UniqueProviderVO, UniquePAVO } from './replace-detail.vo';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { LivetestService } from 'src/shared/service/livetest.service';
import { EnvironmentListVO } from 'src/shared/vo/environment-vo';

@Component({
  selector: 'app-replacement-option-execute',
  templateUrl: './replacement-option-execute.component.html',
  styleUrls: ['./replacement-option-execute.component.css']
})
export class ReplacementOptionExecuteComponent implements OnInit {

  form: FormGroup;
  replacementOptionVO = new ReplacementVO();
  replacementBeneificaryList: any;
  replacementProviderList: any;
  replacementPayorList: any;
  replacemnentPAList: any;
  beneficaryList = [new UniqueBeneficiaryVO()];
  providerList = [new UniqueProviderVO()];
  payorList = [new UniquePayorVO()];
  paList = [new UniquePAVO()];
  responseMsg = '';
  editing = true;
  submitterList: any;
  receiverList: any;
  spinner = true;
  dataFetched = false;
  replaceDetail = new ReplaceDetailsVO();
  response: EnvironmentListVO[];

  constructor(public dialogRef: MatDialogRef<ReplacementOptionExecuteComponent>, private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar, private livetesterService: LivetestService,
    private service: ReplacementService, private liveservice: LivetestService) { }

  ngOnInit() {
    this.form = this.fb.group({
      environmentName: [+this.data.environmentName, Validators.required],
      batchName: [this.data.batchName, Validators.required],
      voidClaimsBefore: [false],
      increaseDays: [false],
      increaseBydays: ['', [Validators.max(100), Validators.min(0)]],
      claimSubmitters: [''],
      claimReceiver: [''],
      replacementBeneficiary: this.fb.array([
        this.addReplacementBeneficiary(),
      ]),
      replacementProvider: this.fb.array([
        this.addReplacemetProvider(),
      ]),
      replacementPayor: this.fb.array([
        this.addReplacementPayor(),
      ]),
      replacementPA: this.fb.array([
        this.addReplacementPA(),
      ])
    });

    this.form.get('increaseDays').valueChanges.subscribe((bool: boolean) => {
      this.editing = false;
      // tslint:disable-next-line: max-line-length
      bool ? this.form.get('increaseBydays').setValidators([Validators.required, Validators.max(100), Validators.min(0)]) : this.form.get('increaseBydays').clearValidators();
      bool ? this.form.get('increaseBydays').setValue(this.form.get('increaseBydays').value) : this.form.get('increaseBydays').setValue(0);
      this.form.get('increaseBydays').updateValueAndValidity();
    });

    this.replacementOptionVO.enviornmentId = this.data.environmentName;
    if (this.dialogRef.componentInstance instanceof ReplacementOptionExecuteComponent) {
      this.loadReplacementOptionData();
    }

    this.service.getBeneficary(this.data).subscribe(result => {
      for (let i = 0; i < result.length; i++) {
        const index = '' + i;
        if (i > 0) {
          (<FormArray>this.form.get('replacementBeneficiary')).push(this.addReplacementBeneficiary());
        }
        const form = (<FormArray>this.form.get('replacementBeneficiary')).get(index);
        form.get('beneficaryIdentifier').setValue(result[i].beneficiaryVO.identifier);
        form.get('alwaysReplace').setValue(result[i].alwaysReplace);
        form.get('beneficaryControl').setValue(result[i].alwaysReplace);
      }
      this.beneficaryList = result;
    });
    this.service.getProvider(this.data).subscribe(result => {
      for (let i = 0; i < result.length; i++) {
        const index = '' + i;
        if (i > 0) {
          (<FormArray>this.form.get('replacementProvider')).push(this.addReplacemetProvider());
        }
        const form = (<FormArray>this.form.get('replacementProvider')).get(index);
        form.get('provider').setValue(result[i].providerVO.npi);
        form.get('alwaysReplace').setValue(result[i].alwaysReplace);
        form.get('providerControl').setValue(result[i].alwaysReplace);
      }
      this.providerList = result;
    });
    this.service.getPayor(this.data).subscribe(result => {
      for (let i = 0; i < result.length; i++) {
        const index = '' + i;
        if (i > 0) {
          (<FormArray>this.form.get('replacementPayor')).push(this.addReplacementPayor());
        }
        const form = (<FormArray>this.form.get('replacementPayor')).get(index);
        form.get('payor').setValue(result[i].payorVO.identifier);
        form.get('alwaysReplace').setValue(result[i].alwaysReplace);
        form.get('payorControl').setValue(result[i].alwaysReplace);
      }
      this.payorList = result;
    });

    this.service.getPA(this.data).subscribe(result => {
      for (let i = 0; i < result.length; i++) {
        const index = '' + i;
        if (i > 0) {
          (<FormArray>this.form.get('replacementPA')).push(this.addReplacementPA());
        }
        const form = (<FormArray>this.form.get('replacementPA')).get(index);
        form.get('pa').setValue(result[i].pa);
        form.get('alwaysReplace').setValue(result[i].alwaysReplace);
        form.get('paControl').setValue(result[i].alwaysReplace);
      }
      this.paList = result;
    });
    this.liveservice.getLookupDataList('Submitters').subscribe(data => {
      this.submitterList = data;
    });
    this.liveservice.getLookupDataList('Receiver').subscribe(data => {
      this.receiverList = data;
    });
    this.getEnvironmentNames();
  }

  loadOptionByEnvironment(event, environmentId) {
    if (event.isUserInput === true) {
      this.replacementOptionVO.enviornmentId = environmentId;
      this.loadReplacementOptionData();
    }
  }

  loadReplacementOptionData() {
    this.replacementOptionVO.type = 'beneficiary';
    this.service.getReplacementDetail(this.replacementOptionVO).subscribe(data => {
      this.replacementBeneificaryList = data;
    });
    this.replacementOptionVO.type = 'provider';
    this.service.getReplacementDetail(this.replacementOptionVO).subscribe(data => {
      this.replacementProviderList = data;
    });
    this.replacementOptionVO.type = 'payor';
    this.service.getReplacementDetail(this.replacementOptionVO).subscribe(data => {
      this.replacementPayorList = data;
    });
    this.replacementOptionVO.type = 'pa';
    this.service.getReplacementDetail(this.replacementOptionVO).subscribe(data => {
      this.replacemnentPAList = data;
      this.dataFetched = true;
      this.spinner = false;
    });
  }

  validateEnvironmentName() {
    const name = this.form.get('batchName').value;
    if (name !== null && name !== '') {
      this.livetesterService.checkBacthName(name).subscribe(data => {
        if (data !== 0) {
          this.form.get('batchName').setErrors({ alreadyExist: true });
        }
      });
    }

  }

  getEnvironmentNames() {
    this.livetesterService.getEnvironmentNamesList().subscribe(data => {
      this.response = data;
    });
  }

  changeTest(i) {
    const index = '' + i;
    const form = (<FormArray>this.form.get('replacementBeneficiary')).get(index);
    form.get('beneficaryControl').setValidators([Validators.required]);
    form.get('beneficaryControl').updateValueAndValidity();
  }
  addReplacementBeneficiary(): FormGroup {
    return this.fb.group({
      beneficaryIdentifier: [],
      beneficaryControl: [],
      alwaysReplace: [false],
    });
  }
  addReplacemetProvider(): FormGroup {
    return this.fb.group({
      provider: [],
      providerControl: [],
      alwaysReplace: [false],
    });
  }
  addReplacementPayor(): FormGroup {
    return this.fb.group({
      payor: [],
      payorControl: [],
      alwaysReplace: [false],
    });
  }
  addReplacementPA(): FormGroup {
    return this.fb.group({
      pa: [],
      paControl: [],
      alwaysReplace: [false],
    });
  }

  replaceExecute(userForm: NgForm) {
    this.validateEnvironmentName();
    if (userForm.valid) {
      this.dataFetched = false;
      this.spinner = true;
      if (this.form.get('voidClaimsBefore').value) {
        this.replaceDetail.voidClaimsFirst = 'Y';
      } else { this.replaceDetail.voidClaimsFirst = 'N'; }
      if (this.form.get('increaseDays').value) {
        this.replaceDetail.increaseBydays = this.form.get('increaseBydays').value;
      } else {
        this.replaceDetail.increaseBydays = 0;
      }
      this.replaceDetail.environmentName = this.form.get('environmentName').value;
      this.replaceDetail.batchName = this.form.get('batchName').value;
      const claimsArr = [];
      for (let i = 0; i < this.data.testGroupItemVOList.length; i++) {
        claimsArr.push(this.data.testGroupItemVOList[i].value);
      }
      const uniqueClaims = [...new Set(claimsArr)];
      this.replaceDetail.claimsId = uniqueClaims;
      this.replaceDetail.replacementBeneficiary = this.form.get('replacementBeneficiary').value;
      this.replaceDetail.replacementProvider = this.form.get('replacementProvider').value;
      this.replaceDetail.replacementPayor = this.form.get('replacementPayor').value;
      this.replaceDetail.replacementPa = this.form.get('replacementPA').value;
      this.replaceDetail.claimSubmitters = this.form.get('claimSubmitters').value;
      this.replaceDetail.claimReceiver = this.form.get('claimReceiver').value;
      this.service.replaceAndExecute(this.replaceDetail).subscribe(result => {
        if (result) {
          this.snackBar.openFromComponent(SnackBarComponent, {
            data: result.response,
          });
        }

        this.dialogRef.close();
      });
      userForm.resetForm();
    }
  }
}
