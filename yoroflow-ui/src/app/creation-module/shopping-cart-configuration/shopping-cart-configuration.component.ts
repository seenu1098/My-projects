import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { debounceTime } from 'rxjs/operators';
import { PageService } from '../page/page-service';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { FieldConfig } from '../shared/vo/page-vo';
import { ShoppingCartImage } from '../shopping-card-step-name/shopping-cart-vo';
import { YorogridComponent } from '../../shared-module/yorogrid/yorogrid.component';
import { ShoppingCartConfigurationService } from './shopping-cart-configuration.service';

@Component({
  selector: 'lib-shopping-cart-configuration',
  templateUrl: './shopping-cart-configuration.component.html',
  styleUrls: ['./shopping-cart-configuration.component.css']
})
export class ShoppingCartConfigurationComponent implements OnInit {

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar,
              private pageService: PageService, private shoppingCartConfigurationService: ShoppingCartConfigurationService
  ) { }

  form: FormGroup;
  stepsList: any[] = [];
  stepNameList: any[] = [];
  stepListNumber: any[] = [];
  displayStepList: any[] = [];
  inputField = new FieldConfig();
  currentStep = '';
  showStepDetails = false;
  stepNumber = 0;
  stepExceed = false;
  stepDown = false;
  lastStepNumber: number;
  firstStepNumber: number;
  enableStepNameStepper = false;
  enableStepDetailsStepper = false;
  openShoopingNameConfig = true;
  enableStepNameStepperPanel = false;
  enableStepDetailsStepperPanel = false;
  fileData: File;
  urls: any[] = [];
  showImage = false;
  noEmitWhenCancel = false;
  selectionStepNameList: any[] = [];
  allowSubmit = false;
  imageSavedAsS3 = true;
  returnValue = 0;
  sentValue = 0;
  enabledSumbit = false;
  cartJson: any;
  forUpdate = false;
  shoppingCartName = '';
  checkUnique = false;
  isUnique = false;

  @ViewChild('stepValueStepper') private stepValueStepper: MatStepper;
  @ViewChild('stepValuesStepper') private stepValuesStepper: MatStepper;
  @ViewChild('cartNamesStepper') private cartNamesStepper: MatStepper;
  @ViewChild('cartStepper') private cartStepper: MatStepper;
  @ViewChild('stepDetailsArrayStepper') private stepDetailsArrayStepper: MatStepper;
  @ViewChild('stepDetailsStepper') private stepDetailsStepper: MatStepper;
  @ViewChild('gridConfig', { static: true }) gridConfig: YorogridComponent;
  ngOnInit(): void {
    this.form = this.fb.group({
      field: this.fb.group({
        name: [''],
        control: this.fb.group({
          shoppingCartName: ['', [Validators.required]],
          shoppingCartLabel: ['', [Validators.required]],
          stepsInvolved: ['', [Validators.required]],
          shoppingCartId: [''],
          taxPercentage: [0],
          selectedStep: [''],
          currencyType: ['', [Validators.required]],
          isTaxable: [false],
          stepDetails: this.fb.array([]),
          nameOfSteps: this.fb.array([])
        }),
      })
    });
    this.shoppingCartValueChange();
  }

  shoppingCartValueChange() {
    this.form.get('field').get('control').get('shoppingCartName').valueChanges.pipe(debounceTime(100)).subscribe(
      (value) => {
        if (value !== undefined && this.form.get('field').get('control').get('shoppingCartName').value !== '' && 
        value !== null
        && this.shoppingCartName !== this.form.get('field').get('control').get('shoppingCartName').value) {
         this.checkUnique = true;
         this.shoppingCartConfigurationService.checkShoppingCart(value).subscribe( data => {
           if (data.response === 'duplicate') {
            this.form.get('field').get('control').get('shoppingCartLabel').setErrors({duplicate: true});
            this.checkUnique = true;
            this.isUnique = true;
           } else {
            this.form.get('field').get('control').get('shoppingCartLabel').setErrors(null);
            this.checkUnique = false;
            this.isUnique = false;
           }
         });
        }
        });
  }

  receiveMessage(event) {
    if (event.col5 !== null) {
      this.reset();
      this.shoppingCartConfigurationService.getShoppingCart(event.col5).subscribe(data => {
        if (data) {
          this.cartJson = data.shoppingCartJson;
          this.cartJson.field.control.shoppingCartId = data.shoppingCartId;
          this.shoppingCartName = data.shoppingCartName;
          this.forUpdate = true;
          this.loadControlType();
          this.shoppingCartNamePanelOpen();
        }
      });
    }
  }

  getControlFormGroup() {
    return this.form.get('field').get('control') as FormGroup;
  }

  loadControlType() {
    if (this.cartJson.field.control) {
      this.noEmitWhenCancel = true;
      this.getSteparray(this.cartJson.field.control.stepsInvolved, false);
      this.loadStepDetails();
      // this.form.get('field.control.shoppingCartId').patchValue()
    }
  }

  loadStepDetails() {
    if (this.cartJson.field && this.cartJson.field.control) {
      const stepNamesArray: any[] = this.cartJson.field.control.nameOfSteps;
      this.enableStepNameStepper = true;
      this.enableStepNameStepperPanel = true;
      for (let i = 0; i < stepNamesArray.length; i++) {
        const index = '' + i;
        const stepNames = (this.getStepNamesArray().get(index) as FormGroup);
        stepNames.patchValue(stepNamesArray[i]);
        this.setNextStepSelectionList(i, stepNames.get('stepName'), stepNames.get('stepLabel'));
      }
    }
    if (this.cartJson.field.control.stepDetails) {
      this.showStepDetails = true;
      this.enableStepDetailsStepper = true;
      const stepDetailsArray: any[] = this.cartJson.field.control.stepDetails;
      if (stepDetailsArray && stepDetailsArray.values) {
        for (let i = 0; i < stepDetailsArray.length; i++) {
          const index = '' + i;
          // this.addStepDetails(i);
          const stepDetails = (this.getStepDetailsArray().get(index) as FormGroup);
          const stepValuesArray: any[] = this.cartJson.field.control.stepDetails[i].stepValues;
          if (stepValuesArray.values) {
            for (let j = 0; j < stepValuesArray.length; j++) {
              const filterIndex = '' + j;
              if (j > 0) {
                this.getStepValuesArray(i).push(this.getStepValuesFormGroup());
              }
              const stepValues = (this.getStepValuesArray(i).get(filterIndex) as FormGroup);
              stepValues.patchValue(stepValuesArray[j]);
              if (this.cartJson.field.control.stepDetails[i].controlType.controlType === 'image') {
                this.setShoppingCartImage(stepValuesArray[j], stepValues.get('key'), stepValues.get('imageKey'));
              }
              stepValues.updateValueAndValidity();
            }
          }
          stepDetails.patchValue(stepDetailsArray[i]);
        }
      }
    }
    this.form.patchValue(this.cartJson);
  }

  setShoppingCartImage(stepValuesList, key: AbstractControl, imageKey: AbstractControl) {
    if (stepValuesList.key) {
      const originalImageKey = stepValuesList.key.replace('thumbnail', '');
      this.pageService.getImageFromKey(originalImageKey).subscribe(images => {
        if (images) {
          const blob = new Blob([images], { type: 'image/jpeg' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = (event) => {
            this.urls.push({ key: stepValuesList.value, url: event.target.result });
            key.setValue(event.target.result);
            imageKey.setValue(stepValuesList.key);
          };
        }
      });
    }
  }


  getSteparray(stepsInvolved, fromLoad) {
    if (stepsInvolved !== '') {
      if (stepsInvolved < this.getStepNamesArray().length) {
        const stepNames = this.getStepNamesArray().length - 1;
        for (let i = stepNames; i >= stepsInvolved; i--) {
          this.removeStepDetails(i);
          this.removeStepNames(i);
          this.stepsList.splice(i, 1);
          this.stepListNumber.splice(i, 1);
        }
      } else {
        for (let i = 0; i < stepsInvolved; i++) {
          if (!this.stepsList.some(steps => steps.key === 'step' + i)) {
            this.stepsList.push({ key: 'step' + (i), value: 'Step ' + (i), number: i });
            this.stepListNumber.push(i);
            this.addStepNames(i);
            this.addStepDetails(i);
            this.showStepDetails = true;
          }
        }
      }
      if (this.stepListNumber.length > 5) {
        this.stepExceed = true;
        for (let i = 1; i <= 5; i++) {
          this.displayStepList.push(i);
        }
        this.lastStepNumber = 6;
        this.firstStepNumber = 1;
      }
    }
  }

  goToStepNames() {
    this.enableStepNameStepper = true;
    this.shoppingCartStepsPanelOpen();
  }

  goToStepDetails(j) {
    let hasStepNames = false;
    for (let i = 0; i < this.getStepNamesArray().length; i++) {
      const index = '' + i;
      const stepNames = (this.getStepNamesArray().get(index) as FormGroup);
      if (stepNames.get('stepLabel').value !== '' && stepNames.get('stepLabel').value !== null) {
        hasStepNames = true;
      } else {
        hasStepNames = false;
      }
    }
    this.enableStepDetailsStepper = hasStepNames;
    this.enableStepDetailsStepperPanel = hasStepNames;
    if (hasStepNames && j === this.getStepNamesArray().length - 1) {
      this.shoppingCartStepDetailsPanelOpen();
    }
  }

  addStepName(stepName: AbstractControl, stepLabel: AbstractControl, stepIndex: AbstractControl, i) {
    stepName
      .setValue(this.camelize(stepLabel.value));
    stepIndex.setValue(i);
    this.loadStepNamesAndValues(i, stepName, stepLabel, stepIndex);
    this.setNextStepSelectionList(i, stepName, stepLabel);
  }

  loadStepNamesAndValues(i, stepName: AbstractControl, stepLabel: AbstractControl, stepIndex: AbstractControl) {
    const index = '' + i;
    const stepDetails = (this.getStepDetailsArray().get(index) as FormGroup);
    stepDetails.get('stepName').setValue(stepName.value);
    stepDetails.get('stepLabel').setValue(stepLabel.value);
    stepDetails.get('stepIndex').setValue(stepIndex.value);
  }

  setNextStepSelectionList(i, stepName: AbstractControl, stepLabel: AbstractControl) {
    const removeIndex = this.selectionStepNameList.findIndex(x => x.number === i);
    if (removeIndex !== -1) {
      this.selectionStepNameList.splice(removeIndex, 1);
    }
    this.selectionStepNameList.push({ key: stepName.value, value: stepLabel.value, number: i });
  }

  goNextsteps(lastStepNumber) {
    let totalLength = this.stepListNumber.length;
    if (this.stepListNumber.length > lastStepNumber + 4) {
      this.stepExceed = true;
      totalLength = lastStepNumber + 5;
      this.lastStepNumber = totalLength;
    } else {
      this.stepExceed = false;
    }
    for (let i = lastStepNumber; i <= totalLength; i++) {
      this.displayStepList.push(i);
    }
    this.firstStepNumber = lastStepNumber;
  }

  goPrevioussteps(firstStepNumber) {
    let totalLength = this.stepListNumber.length;
    if (this.stepListNumber.length > firstStepNumber - 4) {
      this.stepDown = true;
      totalLength = firstStepNumber - 5;
    } else {
      this.stepDown = false;
    }
    for (let i = firstStepNumber; i >= totalLength; i++) {
      this.displayStepList.push(i);
    }
  }

  configureStep(step, event) {
    if (event.isUserInput === true) {
      this.getStepFormControls(step.key, false);
    }
  }

  getStepControls(step) {
    this.currentStep = 'step' + step;
    this.stepNumber = step - 1;
  }

  getStepFormControls(stepName, fromLoad) {
    if (this.form.get('field').get('control').get('stepDetails') &&
      this.form.get('field').get('control').get('stepDetails').get(stepName)) {
      const stepGroup = this.getStepsFormGroup(stepName);
      if (this.form.get('field').get('control').get('stepDetails').get(stepName).get('stepName') === null) {
        stepGroup.addControl('stepName', this.fb.control('', [Validators.required]));
        stepGroup.addControl('stepLabel', this.fb.control('', [Validators.required]));
        stepGroup.addControl('controlType', this.fb.group({
          selectControlType: ['', [Validators.required]],
          controlTypeLabel: ['', [Validators.required]],
          controlTypeName: ['', [Validators.required]]
        }));
        stepGroup.addControl('minimumSelection', this.fb.control('', [Validators.required]));
        stepGroup.addControl('maximumSelection', this.fb.control('', [Validators.required]));
        stepGroup.addControl('isItRequired', this.fb.control(false));
        stepGroup.addControl('hasNextStep', this.fb.control(false));
        stepGroup.addControl('stepValues', this.fb.array([this.getStepValuesFormGroup()]));
        if (stepName === 'step1') {
          stepGroup.addControl('selectNextStep', this.fb.control('', [Validators.required]));
          stepGroup.addControl('nextStepMinimumSelection', this.fb.control('', [Validators.required]));
          stepGroup.addControl('nextStepMaximumSelection', this.fb.control('', [Validators.required]));
        }
      }
    }
  }

  getNextStep(event, stepName) {
    if (this.form.get('field').get('control').get('stepDetails').get(stepName) &&
      this.form.get('field').get('control').get('stepDetails').get(stepName)) {
      const stepGroup = this.getStepsFormGroup(stepName);
      if (this.form.get('field').get('control').get('stepDetails').get(stepName).get('hasNextStep').value === true) {
        stepGroup.addControl('selectNextStep', this.fb.control('', [Validators.required]));
        stepGroup.addControl('nextStepMinimumSelection', this.fb.control('', [Validators.required]));
        stepGroup.addControl('nextStepMaximumSelection', this.fb.control('', [Validators.required]));
      } else if (this.form.get('field').get('control').get('stepDetails').get(stepName).get('hasNextStep').value === false) {
        if (stepGroup.get('selectNextStep')) {
          stepGroup.removeControl('selectNextStep');
        }
        if (stepGroup.get('nextStepMinimumSelection')) {
          stepGroup.removeControl('nextStepMinimumSelection');
        }
        if (stepGroup.get('nextStepMaximumSelection')) {
          stepGroup.removeControl('nextStepMaximumSelection');
        }
      }
    }
  }

  getStepsFormGroup(stepName) {
    return (this.form.get('field').get('control').get('stepDetails').get(stepName) as FormGroup);
  }

  getStepDetailsFormGroup() {
    return (this.form.get('field').get('control').get('stepDetails') as FormGroup);
  }

  getStepDetailFormGroup(i: number) {
    return this.fb.group({
      stepName: ['', [Validators.required]],
      stepIndex: [i, [Validators.required]],
      stepLabel: ['', [Validators.required]],
      minimumSelection: [0],
      maximumSelection: [0],
      controlType: this.fb.group({
        controlType: ['', [Validators.required]],
        controlTypeLabel: ['', [Validators.required]],
        controlTypeName: ['', [Validators.required]],
        allowToAddMultipleCard: [false],
        isRequired: [false],
      }),
      stepValues: this.fb.array([this.getStepValuesFormGroup()]),
    });
  }

  getStepNameFormGroup(i: number) {
    return this.fb.group({
      stepName: ['', [Validators.required]],
      stepLabel: ['', [Validators.required]],
      stepIndex: [i, [Validators.required]],
    });
  }

  getStepValuesFormGroup() {
    return this.fb.group({
      key: [''],
      value: [''],
      description: [''],
      imageKey: [''],
      hasPricingDetails: [false],
      pricing: [0, [Validators.required]],
      pricingType: [''],
      quantity: [1],
      hasNextStep: [false, [Validators.required]],
      nextStepName: [''],
      isRequired: [false],
      nextStepIndex: [],
      nextStepMinimumSelection: [0],
      nextStepMaximumSelection: [0],
    });
  }

  setHasNextStep(hasNext: AbstractControl) {
    hasNext.setValue(true);
    this.stepValueStepper.next();
  }

  getStepNamesArray() {
    return (this.form.get('field').get('control').get('nameOfSteps') as FormArray);
  }

  removeStepNames(i) {
    this.getStepNamesArray().removeAt(i);
  }

  addStepNames(i) {
    this.getStepNamesArray().push(this.getStepNameFormGroup(i));
    this.form.markAsDirty();
  }

  getStepDetailsArray() {
    return (this.form.get('field').get('control').get('stepDetails') as FormArray);
  }

  removeStepDetails(i) {
    this.getStepDetailsArray().removeAt(i);
  }

  addStepDetails(i) {
    this.getStepDetailsArray().push(this.getStepDetailFormGroup(i));
    this.form.markAsDirty();
  }

  getStepValuesArray(iw) {
    // return (this.form.get('field').get('control').get('stepDetails').get(step).get('stepValues') as FormArray);
    return (this.form.get('field').get('control').get('stepDetails') as FormArray).at(iw).get('stepValues') as FormArray;
  }

  addStepValues(iw, hasNext) {
    this.getStepValuesArray(iw).push(this.getStepValuesFormGroup());
    this.form.markAsDirty();
    if (hasNext === 'next') {
      this.stepValuesStepper.next();
    }
  }

  // removeStepValues(iw, i) {

  // }

  removeStepValues(i, k) {
    this.getStepValuesArray(k).removeAt(i);
    if (this.getStepValuesArray(k).length === 0) {
      this.addStepValues(k, 'notNext');
    }
    this.form.markAsDirty();
  }

  allowNextStep(step) {
    return this.form.get('field').get('control').get('stepDetails').get(step).get('hasNextStep').value;
  }

  generateShoppingCartName() {
    this.form.get('field').get('control').get('shoppingCartName')
      .setValue(this.camelize(this.form.get('field.control.shoppingCartLabel').value));
    this.form.get('field').get('name')
      .setValue(this.camelize(this.form.get('field.control.shoppingCartLabel').value));
    // this.form.get('field').get('label').get('labelName')
    //   .setValue(this.form.get('field.control.shoppingCartLabel').value);
  }

  generateStepName(step) {
    this.form.get('field').get('control').get('stepDetails').get(step).get('stepName')
      .setValue(this.camelize(this.form.get('field.control.stepDetails').get(step).get('stepLabel').value));
  }

  generateControlTypeName(controlTypeLabel: AbstractControl, controlTypeName: AbstractControl) {
    controlTypeName
      .setValue(this.camelize(controlTypeLabel.value));
  }

  generateKey(value: AbstractControl, key: AbstractControl) {
    key
      .setValue(this.camelize(value.value));
  }

  camelize(str) {
    if (str) {
      // tslint:disable-next-line: only-arrow-functions
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '').replace(/[^\w]/g, '').replace(/_/g, '');
    }
  }

  shoppingCartNamePanelOpen() {
    this.openShoopingNameConfig = true;
    this.enableStepNameStepperPanel = false;
    this.enableStepDetailsStepperPanel = false;
  }

  shoppingCartStepsPanelOpen() {
    this.openShoopingNameConfig = false;
    this.enableStepNameStepperPanel = true;
    this.enableStepDetailsStepperPanel = false;
  }

  shoppingCartStepDetailsPanelOpen() {
    this.openShoopingNameConfig = false;
    this.enableStepNameStepperPanel = false;
    this.enableStepDetailsStepperPanel = true;
  }

  onFileInput($event, key: AbstractControl, value: AbstractControl, keyImage: AbstractControl) {
    if ($event) {
      // if ($event.target.files[0].type.includes('image/')) {
      //     this.fileProgress($event);
      // } else {
      //     this.snackBar.openFromComponent(SnackbarComponent, {
      //         data: 'Please choose Image File',
      //     });
      // }
      let files = $event.target.files;
      if (files) {
        for (let file of files) {
          this.fileData = file;
        }
        this.setFileTypeAndName(this.fileData, key, value, keyImage);
      }
    }
  }

  setFileTypeAndName(fileData, key: AbstractControl, value: AbstractControl, keyImage: AbstractControl) {
    let reader = new FileReader();
    reader.readAsDataURL(fileData);
    if ((this.fileData)) {
      reader.onload = (event: any) => {
        // if (this.urls.indexOf(event.target.result) === -1
        //     && this.deletedURls.indexOf(event.target.result) === -1) {
        //     this.urls.push(event.target.result);
        // }
        let imageVo = new ShoppingCartImage();
        imageVo.imageUrl = event.target.result;
        const removeIndex = this.urls.findIndex(x => x.url === key.value);
        if (removeIndex !== -1) {
          this.urls.splice(removeIndex, 1);
        }
        this.urls.push({ key: value.value, url: event.target.result });
        key.setValue(event.target.result);
        keyImage.setValue('');
        // this.pageService.saveShoppingCartImage(imageVo).subscribe(data => {
        //   if (data) {

        //     // this.stepValueStepper.ngAfterViewInit();
        //   }
        // });
      };
    }
    // else {
    //     this.snackBar.openFromComponent(SnackbarComponent, {
    //         data: this.fileData[i].name + ' exceeds the maximum size(' + this.field.control.fileSize + ')',
    //     });
    //     this.fileData = [];
    //     this.isLoad = false;
    // }
  }

  checkMaximumValidation(minValue: AbstractControl, maxValue: AbstractControl) {
    if (maxValue.value > 0 && minValue.value > maxValue.value) {
      maxValue.setErrors({ maxError: true });
    } else {
      maxValue.setErrors(null);
    }
  }

  submit(userForm) {
    if (userForm.valid && userForm.dirty) {
      this.enabledSumbit = true;
      this.submitForm();
    }
  }

  submitForm() {
    // if (this.allowSubmit === true) {
      this.inputField = this.form.getRawValue();
      //call api for saving cart
      const controlGroup = this.getControlFormGroup();
      
      const json = {
        shoppingCartId: controlGroup.get('shoppingCartId').value, shoppingCartName: controlGroup.get('shoppingCartName').value,
         shoppingCartlabel: controlGroup.get('shoppingCartLabel').value, shoppingCartJson: this.inputField
      };
      this.shoppingCartConfigurationService.saveShoppingCart(json).subscribe(data => {
        if (data) {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: data.response,
          });
          this.gridConfig.refreshGrid();
          this.reset();
        }
      });
    // } else if (this.allowSubmit === false) {
    //   this.findImageUrl();
    // }
  }

  reset() {
    this.form.reset();
    this.stepsList = [];
    this.stepNameList = [];
    this.stepListNumber = [];
    this.displayStepList = [];
    this.inputField = new FieldConfig();
    this.currentStep = '';
    this.showStepDetails = false;
    this.stepNumber = 0;
    this.enableStepNameStepper = false;
    this.enableStepDetailsStepper = false;
    this.openShoopingNameConfig = true;
    this.enableStepNameStepperPanel = false;
    this.enableStepDetailsStepperPanel = false;
    this.urls = [];
    this.showImage = false;
    this.noEmitWhenCancel = false;
    this.selectionStepNameList = [];
    this.enabledSumbit = false;
    this.cartJson = '';
    this.forUpdate = false;
    this.shoppingCartName = '';
    this.ngOnInit();
    this.cartStepper.reset();
    if (this.cartNamesStepper) {
      this.cartNamesStepper.reset();
    }
    if (this.stepDetailsArrayStepper) {
      this.stepDetailsArrayStepper.reset();
    }
    if (this.stepDetailsStepper) {
      this.stepDetailsStepper.reset();
    }
    if (this.stepValueStepper) {
      this.stepValueStepper.reset();
    }
    if (this.stepValuesStepper) {
      this.stepValuesStepper.reset();
    }
  }

  findImageUrl() {
    const stepDetailsArray = this.form.get('field.control').get('stepDetails');
    let m = 0;
    let mArray: any[] = [];
    if (stepDetailsArray && stepDetailsArray.value) {
      for (let i = 0; i < stepDetailsArray.value.length; i++) {
        const index = '' + i;
        // this.addStepDetails(i);
        const stepDetails = (this.getStepDetailsArray().get(index) as FormGroup);
        const stepValuesArray: any[] = stepDetailsArray.get(index).get('stepValues').value;
        if (stepValuesArray.values) {
          for (let j = 0; j < stepValuesArray.length; j++) {
            const filterIndex = '' + j;
            // if (j > 0) {
            //   this.getStepValuesArray(i).push(this.getStepValuesFormGroup());
            // }
            const stepValues = (this.getStepValuesArray(i).get(filterIndex) as FormGroup);
            // if (stepDetailsArray.get(index).get('controlType.controlType').value === 'image') {
            //   ++m;
            // }
            if (stepDetailsArray.get(index).get('controlType.controlType').value === 'image') {
              this.imageSavedAsS3 = false;
              m++;
              mArray.push(m);
              this.saveS3ForKey(stepValues.get('key').value, stepValues.get('key'), stepValues.get('imageKey'), this.urls.length, m);
            }
            // stepValues.patchValue(stepValuesArray[j]);
            // stepValues.updateValueAndValidity();
          }
        }
        // stepDetails.patchValue(stepDetailsArray[i]);
      }
      if (this.imageSavedAsS3 && this.urls.length === 0) {
        this.allowSubmit = true;
        this.submitForm();
      }
    }
  }

  saveS3ForKey(url, key: AbstractControl, imageKey: AbstractControl, i, m) {
    let imageVo = new ShoppingCartImage();
    imageVo.imageUrl = url;
    // let m = 0;
    // let returnValue = 0;
    // let sendValue = 0;
    if (imageKey.value === '') {
      this.sentValue++;
      this.pageService.saveShoppingCartImage(imageVo).subscribe(data => {
        if (data) {
          key.setValue(data.imagekey);
          // this.stepValueStepper.ngAfterViewInit();
        }
        this.imageSavedAsS3 = true;
        this.returnValue++;
        if (this.sentValue === this.returnValue) {
          this.allowSubmit = true;
          this.submitForm();
        }
        // if (i === m && this.sentValue === this.returnValue) {
        //   this.allowSubmit = true;
        //   this.submitForm();
        // }
      });
    } else {
      key.setValue(imageKey.value);
      if (i === m && this.sentValue === this.returnValue) {
        this.allowSubmit = true;
        this.submitForm();
      }
    }
  }

  getSelectedStepName(nextStepName: AbstractControl) {
    let stepName = '';
    if (nextStepName.value !== '' && nextStepName.value !== null) {
      this.selectionStepNameList.forEach(step => {
        if (nextStepName.value === step.key) {
          stepName = step.value;
        }
      });
    }
    return stepName;
  }

  addStepIndex($event, step, control: AbstractControl) {
    if ($event.isUserInput) {
      control.setValue(step.number);
    }
  }

  checkTextAndTextArea(stepIndex: AbstractControl) {
    let hasTextArea = true;
    if (stepIndex.value !== null) {
      const stepDetails = (this.getStepDetailsArray().get('' + stepIndex.value) as FormGroup);
      if (stepDetails.get('controlType.controlType').value === 'text' ||
        stepDetails.get('controlType.controlType').value === 'textArea' ||
        stepDetails.get('controlType.controlType').value === 'card') {
        hasTextArea = false;
      }
    }
    return hasTextArea;
  }

}
