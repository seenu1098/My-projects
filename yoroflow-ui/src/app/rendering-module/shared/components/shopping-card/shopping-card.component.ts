import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatVerticalStepper } from '@angular/material/stepper';
import { CreateFormService } from '../../service/form-service/create-form.service';
import { PageService } from '../../service/page-service';
import { Field, FieldConfig } from '../../vo/page-vo';
import { ShoppingCart } from './shopping-cart-vo';
import { MediaMatcher } from '@angular/cdk/layout';
@Component({
  selector: 'lib-shopping-card',
  templateUrl: './shopping-card.component.html',
  styleUrls: ['./shopping-card.component.css']
})
export class ShoppingCardComponent implements OnInit {

  constructor(public el: ElementRef, public formService: CreateFormService
    , private formBuilder: FormBuilder, private cd: ChangeDetectorRef, public pageService: PageService,
    private media: MediaMatcher) {
    this.updateResolutionBasedOnScreenSize();
    this.innerWidth = window.innerWidth;
  }

  field: Field;
  group: FormGroup;
  showControl = false;
  @ViewChild(MatVerticalStepper) stepper: MatVerticalStepper;
  stepperFormGroup: FormGroup;
  steps = [
    { label: 'One', fields: [{ name: 'one', label: 'One', value: '' }], nextStepIndex: 1 },
    { label: 'Two', fields: [{ name: 'two', label: 'Two', value: '' }], nextStepIndex: 2 },
    { label: 'Three', fields: [{ name: 'three', label: 'Three', value: '' }], nextStepIndex: 3 },
  ];
  formArray = this.formBuilder.array([]);
  cardItems = [];
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  stepperGroup = this.formBuilder.group({});
  showAddItemButton = true;
  updateItemIndex = -1;
  cardDetailsVO: any;
  currentIndex = 0;
  imageKeyList: any[] = [];
  loadStepValue: any[] = [];
  imageTypename: any[] = [];
  groupList: any[] = [];
  allowImageCard = false;
  totalPrice = 0;
  totalNumberOfItems = 0;
  totalPriceWithTax = 0;
  afterValueSet = false;
  cartVo = new ShoppingCart();
  addSteps = false;
  showAddItem = false;
  duplicateStep: any[] = [];
  showStepper = false;
  mobileQuery: MediaQueryList;
  systemQuery: MediaQueryList;
  ipadResolution: MediaQueryList;
  systemResolution: MediaQueryList;
  private _mobileQueryListener: () => void;
  @HostListener('window:resize', ['$event'])
  public innerWidth: any;
  showStepperForMobile = false;
  showCartForMobile = true;

  ngOnInit(): void {
    if (window.matchMedia('only screen and (max-width: 600px)').matches) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
    if (this.group.get(this.field.name).value !== '' && this.group.get(this.field.name).value !== null
      && this.group.get(this.field.name).value !== 'null' && this.afterValueSet === false) {
      this.setFormToVo(this.group.get(this.field.name).value);
    }
    this.getStepper();
  }

  updateResolutionBasedOnScreenSize() {
    this.mobileQuery = this.media.matchMedia("(max-width: 850px)");
    this.systemQuery = this.media.matchMedia("(min-width:1380px)");
    this.ipadResolution = this.media.matchMedia("(max-width:1024px)");
    this.systemResolution = this.media.matchMedia("(min-width:1200px)");
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.systemQuery.addListener(this._mobileQueryListener);
    this.ipadResolution.addListener(this._mobileQueryListener);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }

  getLayoutBasedOnScreen() {
    if (this.mobileQuery.matches) {
      return 'column';
    } else {
      return 'row';
    }
  }

  getQuantityHeader(){
    if (this.mobileQuery.matches) {
      return 'Qty';
    } else {
      return 'Quantity';
    }
  }

  

  getStepperWidth() {
    if (this.mobileQuery.matches) {
      return this.innerWidth-55;
    } else {
      return this.innerWidth*(40/100); //40
    }
  }

  getCartWidth() {
    if (this.mobileQuery.matches) {
      return this.innerWidth-55;
    } else {
      return  this.innerWidth*(60/100); //55
    }
  }

  addItemsToCart(){
    this.showStepperForMobile = true;
    this.showCartForMobile = false;
  }

  getStepper() {
    if (this.field.control && this.field.control.shoppingCartName) {
      this.pageService.getStepperInfo(this.field.control.shoppingCartName).subscribe((data: any) => {
        this.cardDetailsVO = data.shoppingCartJson.field.control;
        this.addFormValueChanges();
        // this.cardDetailsVO = this.field.control;
        this.loadStepValue.push(this.cardDetailsVO.stepDetails[0]);
        this.stepperFormGroup = this.getFormGroupForCart();
        this.addValidationForFirstStep();
        this.firstFormGroup = this.formBuilder.group({
          firstCtrl: ['', Validators.required]
        });
        this.secondFormGroup = this.formBuilder.group({
          secondCtrl: ['', Validators.required]
        });
        this.createFormArray();
        this.showControl = true;
      })
    }
  }

  addFormValueChanges() {
    this.group.get(this.field.name).valueChanges.subscribe(data => {
      if (data !== '' && data !== null && data !== 'null' && this.afterValueSet === false) {
        this.setFormToVo(this.group.get(this.field.name).value);
      }
    });
  }

  setFormToVo(value: any) {
    this.cardItems = value.cartVo;
    this.addArrayValues(value);
    this.setTotalPriceAndItem();
  }

  addArrayValues(value: any) {
    if (value.cartArray) {
      const cartArray: any[] = value.cartArray;
      for (let i = 0; i < cartArray.length; i++) {
        const index = '' + i;
        this.getFormArray().push(this.getFormGroupForCart());
        const cartName = (this.getFormArray().get(index) as FormGroup);
        cartName.patchValue(cartArray[i]);
      }
    }
  }

  setVoToForm(cartItems: any) {
    this.cartVo.cartVo = cartItems;
    this.cartVo.cartArray = this.stepperGroup.get(this.cardDetailsVO.shoppingCartName).value;
    this.group.get(this.field.name).setValue(this.cartVo);
  }

  getFormGroup() {
    return this.formBuilder.group({
      one: ['', Validators.required],
      two: ['', Validators.required],
      three: ['', Validators.required]
    });
  }

getReqMinLength(group: AbstractControl) {
 return group.errors.minlength.requiredLength;
}

getReqMaxLength(group: AbstractControl) {
  return group.errors.maxlength.requiredLength;
}

  addToCart() {
    this.groupList = [];
    this.cardDetailsVO.stepDetails.forEach(step => {
      Object.keys(this.stepperFormGroup.value).forEach(element => {
        if (step.controlType.controlTypeName === element) {
          this.groupList.push({ name: element, label: step.controlType.controlTypeLabel });
        }
      });
    });
    if (this.stepperFormGroup.valid) {
      this.getFormArray().push(this.getFormGroupForCart());
      const json = this.stepperFormGroup.value;
      this.getFormArray().get(this.getFormArray().length - 1 + '').setValue(json);
      this.addCartItems(json, this.stepperFormGroup, this.getFormArray().length - 1);
      this.stepper.selectedIndex = 0;
      this.stepperFormGroup.reset();
      this.resetStepper();
      this.resetForm();
      if (this.mobileQuery.matches) {
        this.showStepperForMobile = false;
        this.showCartForMobile = true;
      }
    }
  }

  cancelForMobile() {
    if (this.mobileQuery.matches) {
      this.showStepperForMobile = false;
      this.showCartForMobile = true;
    }
  }

  setAllowGridImage(index) {
    let allowImageGrid = false;
    this.cardDetailsVO.stepDetails.forEach(details => {
      if (details.stepIndex === index && details.controlType.controlType === 'image') {
        allowImageGrid = true;
      }
    });
    this.allowImageCard = allowImageGrid;
  }

  addValidation(index, step, stepValue, setIndex) {
    if (stepValue.hasNextStep) {
     let indexArray: any[] = [];
     const stepDetails = this.cardDetailsVO.stepDetails.find(s => s.stepIndex === stepValue.nextStepIndex);
     if ((stepDetails.controlType.controlType === 'image' || stepDetails.controlType.controlType === 'select')
     && stepDetails.controlType.controlTypeName !== null && (stepValue.nextStepMinimumSelection > 0
      || stepValue.nextStepMaximumSelection > 0)) {
      const minimumSelection = stepValue.nextStepMinimumSelection;
      const maximumSelection = stepValue.nextStepMaximumSelection;
      if (minimumSelection > 0 && maximumSelection === 0) {
      this.stepperFormGroup.get(stepDetails.controlType.controlTypeName)
      .setValidators([Validators.required, Validators.minLength(minimumSelection)]);
      // this.stepperFormGroup.get(stepDetails.controlType.controlTypeName).updateValueAndValidity();
       }
      if (maximumSelection > 0  && minimumSelection === 0) {
      this.stepperFormGroup.get(stepDetails.controlType.controlTypeName)
      .setValidators([Validators.required, Validators.maxLength(maximumSelection)]);
       }
      if (minimumSelection > 0 && maximumSelection > 0) {
        this.stepperFormGroup.get(stepDetails.controlType.controlTypeName)
        .setValidators([Validators.required, Validators.minLength(minimumSelection),
           Validators.maxLength(maximumSelection)]);
         }
     }
     if ((stepDetails.controlType.controlType === 'text' || stepDetails.controlType.controlType === 'card' ||
      stepDetails.controlType.controlType === 'textArea')
     && stepDetails.controlType.controlTypeName !== null && stepValue.isRequired && (stepValue.isRequired === true)) {
      this.stepperFormGroup.get(stepDetails.controlType.controlTypeName)
      .setValidators([Validators.required]);
     }
     this.stepperFormGroup.get(stepDetails.controlType.controlTypeName).updateValueAndValidity();
     step.stepValues.forEach(value => {
      if (value.hasNextStep && value.nextStepIndex !== index ) {
        indexArray.push({ index: value.nextStepIndex, sameIndex: setIndex });
      }
    });
     this.cardDetailsVO.stepDetails.forEach(details => {
      indexArray.forEach(indexs => {
      if (details.stepIndex === indexs.index) {
        this.stepperFormGroup.get(details.controlType.controlTypeName).setValidators(null);
        this.stepperFormGroup.get(details.controlType.controlTypeName).updateValueAndValidity();
      }
    });
  });
}
}

  addValidationForFirstStep() {
    const stepDetails = this.cardDetailsVO.stepDetails.find(s => s.stepIndex === 0);
    if ((stepDetails.controlType.controlType === 'image' || stepDetails.controlType.controlType === 'select')
      && stepDetails.controlType.controlTypeName !== null && (stepDetails.maximumSelection > 0
      || stepDetails.minimumSelection > 0)) {
        if (stepDetails.minimumSelection > 0) {
      this.stepperFormGroup.get(stepDetails.controlType.controlTypeName)
      .setValidators([Validators.required, Validators.minLength(stepDetails.minimumSelection)]);
       }
        if (stepDetails.maximumSelection > 0) {
      this.stepperFormGroup.get(stepDetails.controlType.controlTypeName)
      .setValidators([Validators.required, Validators.maxLength(stepDetails.maximumSelection)]);
       }
        if (stepDetails.minimumSelection > 0 && stepDetails.maximumSelection > 0) {
        this.stepperFormGroup.get(stepDetails.controlType.controlTypeName)
        .setValidators([Validators.required, Validators.minLength(stepDetails.minimumSelection),
           Validators.maxLength(stepDetails.minimumSelection)]);
         }
        this.stepperFormGroup.get(stepDetails.controlType.controlTypeName).updateValueAndValidity();
     }
    if ((stepDetails.controlType.controlType === 'text' || stepDetails.controlType.controlType === 'card' ||
      stepDetails.controlType.controlType === 'textArea') && stepDetails.controlType.controlTypeName !== null &&
       stepDetails.controlType.isRequired && (stepDetails.controlType.isRequired === true)) {
      this.stepperFormGroup.get(stepDetails.controlType.controlTypeName)
      .setValidators([Validators.required]);
      this.stepperFormGroup.get(stepDetails.controlType.controlTypeName).updateValueAndValidity();
     }
  }

  removeNextStepValue(index, step, values, setIndex, fromEdit) {
    let indexArray: any[] = [];
    let canDelete = false;
    let alreadyAdded = false;
    this.addValidation(index, step, values, setIndex);
    this.duplicateStep.forEach(indexs => {
      if (index === indexs) {
        alreadyAdded = true;
      }
    });
    step.stepValues.forEach(value => {
      if (value.hasNextStep && value.nextStepIndex !== index) {
        indexArray.push({ index: value.nextStepIndex, sameIndex: setIndex });
      }
    });
    // && this.stepperFormGroup.get(details.controlType.controlTypeName).value !== null
    // && this.stepperFormGroup.get(details.controlType.controlTypeName).value !== ''
    this.cardDetailsVO.stepDetails.forEach(details => {
      indexArray.forEach(indexs => {
        if (details.stepIndex === indexs.index && !fromEdit) {
          this.stepperFormGroup.get(details.controlType.controlTypeName).setValue('');
          canDelete = true;
        }
      });
    });
    this.duplicateStep.push(index);
    this.setNextStepData(values, setIndex, fromEdit, canDelete, alreadyAdded, index);
  }

  nextStep(step, fieldValue, index, fromEdit) {
    let showAddItems = false;
    step.stepValues.forEach(value => {
      if (step.controlType.controlType === 'card') {
        if ((value.key === fieldValue || value.value === fieldValue) && value.hasNextStep) {
          this.removeNextStepValue(value.nextStepIndex, step, value, index, fromEdit);
          // this.setNextStepData(value, index, fromEdit);
          this.setAllowGridImage(value.nextStepIndex);
          // this.stepper.selectedIndex = value.nextStepIndex;
        } else if (value.hasNextStep === false) {
          showAddItems = true;
        }
      }
      if (step.controlType.controlType === 'image') {
        if ((value.key === fieldValue[0] || value.value === fieldValue[0]) && value.hasNextStep) {
          this.removeNextStepValue(value.nextStepIndex, step, value, index, fromEdit);
          // this.setNextStepData(value, index, fromEdit);
          this.setAllowGridImage(value.nextStepIndex);
          // this.stepper.selectedIndex = value.nextStepIndex;
        } else if (value.hasNextStep === false) {
          showAddItems = true;
        }
      }
      if ((step.controlType.controlType === 'text' || step.controlType.controlType === 'textArea') && value.hasNextStep) {
        this.removeNextStepValue(value.nextStepIndex, step, value, index, fromEdit);
        // this.setNextStepData(value, index, fromEdit);
        this.setAllowGridImage(value.nextStepIndex);
        // this.stepper.selectedIndex = value.nextStepIndex;
      } else if (value.hasNextStep === false) {
        showAddItems = true;
      }
      if (step.controlType.controlType === 'select') {
        if ((value.key === fieldValue[0] || value.value === fieldValue[0]) && value.hasNextStep) {
          this.removeNextStepValue(value.nextStepIndex, step, value, index, fromEdit);
          // this.setNextStepData(value, index, fromEdit);
          this.setAllowGridImage(value.nextStepIndex);
          // this.stepper.selectedIndex = value.nextStepIndex;
        } else if (value.hasNextStep === false) {
          showAddItems = true;
        }
      }
    });
    this.showAddItem = showAddItems;
  }

  setNextStepData(value, index, fromEdit, canDelete, alreadyAdded, dupIndex) {
    const nextStepIndex = value.nextStepIndex;
    const length = this.loadStepValue.length;
    let addStep = false;
    if (index < length - 1 && !fromEdit) {
      for (let i = length - 1; i >= 0; i--) {
        if (index < i && (canDelete || this.updateItemIndex === -1)) {
          // if (this.stepperFormGroup.get(this.loadStepValue[i].controlType.controlTypeName)) {
          //   this.stepperFormGroup.get(this.loadStepValue[i].controlType.controlTypeName).setValue('');
          // }
          this.loadStepValue.splice(i, 1);
          addStep = true;
          this.addSteps = true;
        }
      }
    }
    if (!alreadyAdded && (this.updateItemIndex === -1 || canDelete || addStep || this.addSteps)
    && !this.loadStepValue.some(x => x.stepIndex === value.nextStepIndex)) {
      this.loadStepValue.push(this.cardDetailsVO.stepDetails.find(s => s.stepIndex === value.nextStepIndex));
    }
    this.loadStepValue.forEach(loadStep => {
      const removeIndex = this.duplicateStep.findIndex(x => x !== loadStep.stepIndex);
      if (removeIndex !== -1) {
                    this.duplicateStep.splice(removeIndex, 1);
                  }
    });
    // this.stepper.selectedIndex = this.loadStepValue.length - 1;
  }

  // nextStep(step, fieldValue) {
  //   step.stepValues.forEach(value => {
  //     if (step.controlType.controlType !== 'image') {
  //       if((value.key === fieldValue || value.value === fieldValue)){
  //         if (value.hasNextStep) {
  //           this.stepper.selectedIndex = value.nextStepIndex;
  //         } else {
  //           this.stepper.selectedIndex = this.cardDetailsVO.stepDetails.length;
  //         }
  //       }
  //     }
  //     if (step.controlType.controlType === 'image') {
  //       if((value.key === fieldValue[0] || value.value === fieldValue[0])){
  //         if (value.hasNextStep) {
  //           this.stepper.selectedIndex = value.nextStepIndex;
  //         } else {
  //           this.stepper.selectedIndex = this.cardDetailsVO.stepDetails.length;
  //         }
  //       }
  //     }
  //   });
  //   if(step.controlType==='select'){

  //   }
  // }

  addCartItems(json, formGroup: FormGroup, i: number) {
    let array: any[] = [];
    this.afterValueSet = true;
    this.cardDetailsVO.stepDetails.forEach(step => {
      let imageArray: any[] = [];
      Object.keys(json).forEach(element => {
        if (step.controlType.controlTypeName === element) {
          const value = formGroup.get(element).value;
          if (step.controlType.controlType === 'image' && value !== '' && value !== null) {
            value.forEach(val => {
              imageArray.push({ image: '', value: val, name: step.controlType.controlTypeName });
            });
          }
          array.push({
            controlType: step.controlType.controlType, image: imageArray, valueLabel: this.getStepLabel(step, value),
            name: step.controlType.controlTypeName, label: step.controlType.controlTypeLabel, value: value,
            quantity: this.setQuantity(step, value), price: this.setprice(step, value),
            hasPricing: this.getPricingDetails(step, value), pricePerQuantity: this.setPricePerQuantity(step, value)
          });
        }
      })
    })
    for (let k = 0; k < array.length; k++) {
      if (array[k].value === '') {
        array.splice(k, 1);
      }
    }
    if (this.cardItems.some(item => item.index === i)) {
      this.cardItems.splice(i, 1, { index: i, details: array })
    } else {
      this.cardItems.push({ index: i, details: array });
    }
    if (this.imageKeyList.some(item => item.index === i)) {
      this.imageKeyList.splice(i, 1);
    }
    this.setTotalPriceAndItem();
    this.setVoToForm(this.cardItems);
    array = [];
    // imageArray = [];
    this.imageTypename = [];
  }

  getTaxPercentage(step, value) {
    let taxPercentage = -1;
    if (this.cardDetailsVO.isTaxable === true) {
      step.stepValues.forEach(stepValue => {
        if (step.controlType.controlType === 'image') {
          if (value !== null && stepValue.key === value[0]) {
            taxPercentage = stepValue.taxPercentage;
          }
        }
        if (step.controlType.controlType === 'card') {
          if (stepValue.key === value) {
            taxPercentage = stepValue.taxPercentage;
          }
        }
        if (value !== null && step.controlType.controlType === 'select') {
          for (let i = 0; i < value.length; i++) {
            if (stepValue.key === value[i]) {
              taxPercentage = stepValue.taxPercentage;
            }
          }
        }
      });
    }
    return taxPercentage;
  }

  getPricingDetails(step, value) {
    let priceDetails = false;
    step.stepValues.forEach(stepValue => {
      if (step.controlType.controlType === 'image') {
        if (value !== null && stepValue.key === value[0]) {
          priceDetails = stepValue.hasPricingDetails;
        }
      }
      if (step.controlType.controlType === 'card') {
        if (stepValue.key === value) {
          priceDetails = stepValue.hasPricingDetails;
        }
      }
      if (value !== null && step.controlType.controlType === 'select') {
        for (let i = 0; i < value.length; i++) {
          if (stepValue.key === value[i]) {
            priceDetails = stepValue.hasPricingDetails;
          }
        }
      }
      if (value !== null && value !== '' &&
        (step.controlType.controlType === 'text' || step.controlType.controlType === 'textArea')) {
        priceDetails = stepValue.hasPricingDetails;
      }
    });
    return priceDetails;
  }

  getStepLabel(step, value) {
    let stepLabelValue = '';
    step.stepValues.forEach(stepValue => {
      // if (step.controlType.controlType === 'image')  {
      //   if (stepValue.key === value[0]) {
      //     stepLabelValue = stepValue.quantity;
      //   }
      // }
      if (step.controlType.controlType === 'card') {
        if (stepValue.key === value) {
          stepLabelValue = stepValue.value;
        }
      }
      if (step.controlType.controlType === 'select') {
        for (let i = 0; i < value.length; i++) {
          if (stepValue.key === value[i]) {
            if (i > 0) {
              stepLabelValue = stepLabelValue + ', ';
            }
            stepLabelValue = stepLabelValue + stepValue.value;
          }
        }
      }
      if (step.controlType.controlType === 'text' || step.controlType.controlType === 'textArea') {
        stepLabelValue = value;
      }
    });
    return stepLabelValue;
  }

  setQuantity(step, value) {
    let quantity: number;
    step.stepValues.forEach(stepValue => {
      if (step.controlType.controlType === 'image') {
        if (value !== null && stepValue.key === value[0]) {
          quantity = stepValue.quantity;
        }
      }
      if (step.controlType.controlType === 'card') {
        if (stepValue.key === value) {
          quantity = stepValue.quantity;
        }
      }
      if (value !== null && step.controlType.controlType === 'select') {
        for (let i = 0; i < value.length; i++) {
          if (stepValue.key === value[i]) {
            quantity = quantity + stepValue.quantity;
          }
        }
      }
      if (value !== null && value !== '' &&
        (step.controlType.controlType === 'text' || step.controlType.controlType === 'textArea')) {
        quantity = stepValue.quantity;
      }
    });
    return quantity;
  }

  setprice(step, value) {
    let price = '';
    let selectPrice: number;
    let tax: number;
    step.stepValues.forEach(stepValue => {
      if (step.controlType.controlType === 'image') {
        if (value !== null && stepValue.key === value[0]) {
          selectPrice = (stepValue.quantity * stepValue.pricing);
          // if (this.cardDetailsVO.isTaxable === true) {
          //   selectPrice = (stepValue.taxPercentage / 100) *
          // }
        }
      }
      if (step.controlType.controlType === 'card') {
        if (stepValue.key === value) {
          selectPrice = (stepValue.quantity * stepValue.pricing);
        }
      }
      if (value !== null && step.controlType.controlType === 'select') {
        for (let i = 0; i < value.length; i++) {
          if (stepValue.key === value[i]) {
            if (selectPrice !== undefined) {
              selectPrice = selectPrice + stepValue.pricing;
            } else {
              selectPrice = stepValue.pricing;
            }
          }
        }
      }
      if (value !== null && value !== '' &&
        (step.controlType.controlType === 'text' || step.controlType.controlType === 'textArea')) {
        selectPrice = (stepValue.quantity * stepValue.pricing);
      }
    });
    if (step.controlType.controlType === 'select') {
      price = (selectPrice) + step.stepValues[0].pricingType;
    }
    return selectPrice;
  }

  setPricePerQuantity(step, value) {
    let price: number;
    step.stepValues.forEach(stepValue => {
      if (step.controlType.controlType === 'image') {
        if (value !== null && stepValue.key === value[0]) {
          price = stepValue.pricing;
        }
      }
      if (step.controlType.controlType === 'card') {
        if (stepValue.key === value) {
          price = stepValue.pricing;
        }
      }
      if (value !== null && step.controlType.controlType === 'select') {
        for (let i = 0; i < value.length; i++) {
          if (stepValue.key === value[i]) {
            price = stepValue.pricing;
          }
        }
      }
      if (value !== null && value !== '' &&
        (step.controlType.controlType === 'text' || step.controlType.controlType === 'textArea')) {
        price = stepValue.pricing;
      }
    });
    return price;
  }

  setpricingType(step, value) {
    let priceType = '';
    step.stepValues.forEach(stepValue => {
      if (step.controlType.controlType === 'image' || step.controlType.controlType === 'select') {
        if (value !== null && stepValue.key === value[0]) {
          priceType = stepValue.pricingType;
        }
      }
      if (step.controlType.controlType === 'card') {
        if (stepValue.key === value) {
          priceType = stepValue.pricingType;
        }
      }
    });
    return priceType;
  }

  setTotalPriceAndItem() {
    let price = 0;
    let item = 0;
    let tax = 0;
    let taxPrice = 0;
    this.cardItems.forEach(cardItem => {
      let cardPrice = 0;
      for (let i = cardItem.details.length - 1; i >= 0; i--) {
        if (cardItem.details[i].hasPricing === true && cardPrice === 0) {
          price = price + (cardItem.details[i].quantity * cardItem.details[i].pricePerQuantity);
          cardPrice = cardPrice + (cardItem.details[i].quantity * cardItem.details[i].pricePerQuantity);
          if (this.cardDetailsVO.isTaxable === true) {
            tax = ((this.cardDetailsVO.taxPercentage / 100) * price);
            taxPrice = tax + price;
          }
          item = item + (cardItem.details[i].quantity);
        } else {
          cardItem.details[i].hasPricing = false;
        }
      }
    });
    this.totalNumberOfItems = item;
    this.totalPrice = price;
    this.totalPriceWithTax = taxPrice;
  }

  setPriceAndQuantity(i, m: number, $event) {
    let price = 0;
    if ($event.target.value !== null) {
      this.cardItems[i].details[m].quantity = $event.target.valueAsNumber;
      price = ($event.target.valueAsNumber * this.cardItems[i].details[m].pricePerQuantity);
      this.cardItems[i].details[m].price = price;
      this.setTotalPriceAndItem();
    }
  }

  getImage(gridImageList, i, j) {
    let imageUrl: any;
    gridImageList.forEach(image => {
      if (!this.imageKeyList.some(key => key.image === image.value && key.index === i)) {
        this.imageKeyList.push({ image: image.value, index: i });
        const originalImageKey = image.value.replace('thumbnail', '');
        this.pageService.getImageFromKey(originalImageKey).subscribe(images => {
          if (images) {
            // const url = images.imageString;
            // this.images[z][j].url = url;
            const blob = new Blob([images], { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = (event) => {
              image.image = (reader.result);
            };
          }
        });
      }
    });
    // if (imageUrl) {
    //   return imageUrl;
    // }
  }

  edit(index) {
    this.resetStepper();
    this.showAddItemButton = false;
    if(this.mobileQuery.matches){
      this.showStepperForMobile = true;
      this.showCartForMobile = false;
    }
    this.stepperFormGroup.setValue(this.getFormArray().get(index + '').value);
    this.cardDetailsVO.stepDetails.forEach(step => {
      if (this.stepperFormGroup.get(step.controlType.controlTypeName).value !== null &&
        this.stepperFormGroup.get(step.controlType.controlTypeName).value !== '') {
        this.nextStep(step, this.stepperFormGroup.get(step.controlType.controlTypeName).value, -1, true);
      }
    });
    this.stepper.selectedIndex = 0;
    this.updateItemIndex = index;
    this.imageTypename = [];
  }

  updateItem(index) {
    // this.resetStepper();
    this.showAddItemButton = false;
    if (this.stepperFormGroup.valid) {
      const json = this.stepperFormGroup.value;
      this.getFormArray().get(index + '').setValue(json);
      this.addCartItems(this.stepperFormGroup.value, this.stepperFormGroup, index);
   
      this.resetForm();
      if (this.mobileQuery.matches) {
        this.showStepperForMobile = false;
        this.showCartForMobile = true;
      }
    }

  }

  closeItem(index, itemIndex) {
    this.cardItems.splice(itemIndex, 1);
    this.getFormArray().removeAt(index);
    for (let i = 0; i < this.cardItems.length; i++) {
      this.cardItems[i].index = i;
    }
    this.setVoToForm(this.cardItems);
    this.setTotalPriceAndItem();
    this.resetForm();
    this.imageTypename = [];
  }

  resetForm() {
    this.stepper.selectedIndex = 0;
    this.stepperFormGroup.reset();
    this.stepperFormGroup.setValidators(null);
    this.stepperFormGroup.updateValueAndValidity();
    this.addValidationForFirstStep();
    this.groupList = [];
    this.updateItemIndex = -1;
    this.showAddItemButton = true;
    this.resetStepper();
  }

  getFormGroupForCart() {
    const group = this.formBuilder.group({});
    this.cardDetailsVO.stepDetails.forEach(stepDetail => {
      group.addControl(stepDetail.controlType.controlTypeName, this.formBuilder.control(''));
    })
    return group;
  }

  createFormArray() {
    this.stepperGroup.addControl(this.cardDetailsVO.shoppingCartName, this.formBuilder.array([]));
  }

  getFormArray() {
    return this.stepperGroup.get(this.cardDetailsVO.shoppingCartName) as FormArray;
  }

  resetStepper() {
    let valueLength = this.loadStepValue.length;
    for (let i = valueLength - 1; i > 0; i--) {
      if (i > 0) {
        this.loadStepValue.splice(i, 1);
      }
    }
    this.addSteps = false;
    this.duplicateStep = [];
  }

  backgroundColor(item) {
    if (item.index === this.updateItemIndex) {
      return 'rgb(236, 248, 255)';
    } else {
      return 'rgb(253, 253, 253)';
    }
  }

  allowToAddCart() {
    if (this.loadStepValue.length > 0) {
      const lastStep = this.loadStepValue[this.loadStepValue.length - 1];
      const lastStepValue = this.stepperFormGroup.get(lastStep.controlType.controlTypeName).value;
      const stepDetails: any[] = lastStep.stepValues;
      const stepValue = stepDetails.find(s => s.key === lastStepValue || s.value === lastStepValue);
      if (stepValue && !stepValue.hasNextStep) {
        return true;
      }
    }
    return false;
  }

  getCardData(step) {
    const options: any[] = [];
    let columnNumber = 3;
    step.stepValues.forEach(obj => {
      if (obj.description !== '' && obj.description !== null) {
        options.push({ code: obj.key, description: obj.value, valueDescription: obj.description });
        columnNumber = 1;
      } else {
        options.push({ code: obj.key, description: obj.value });
      }
    });
    return {
      controlType: 'card',
      childSection: false,
      field: {
        name: step.controlType.controlTypeName,
        fieldId: null,
        fieldName: null,
        defaultValue: null,
        defaultCode: null,
        control: {
          borderColor: '#0078ff',
          hoverColor: '#0078ff',
          noOfRows: 5,
          noOfColumns: columnNumber,
          optionType: 's',
          optionsValues: options
        },
        label: {
          labelName: step.controlType.controlTypeLabel,
          labelOption: 'floating',
          labelSize: null,
          labelStyle: null,
          labelPosition: null
        },
        dataType: null,
        fieldWidth: 100,
        unique: false,
        editable: true,
        sensitive: false,
        enableHyperlink: false,
        dateFormat: null,
        rows: 0,
        cols: 0,
        chipSize: 0,
        dateValidation: {
          dateValidation: false,
          allowFutureDate: false,
          operator: null,
          fromField: null,
          toField: null
        },
        numberFieldValidation: {
          numberFieldValidation: false,
          operator: null,
          fromField: null,
          toField: null
        },
        allowFutureDate: false,
        allowPastDate: false,
        onSelection: {
          onSelectionChange: false,
          fieldType: '',
          loadDataLabel: null,
          targetPageName: null,
          targetPageId: null,
          passParameter: null,
          pageType: null,
          version: null
        },
        validations: [
          {
            type: null,
            value: null
          }
        ],
        conditionalChecks: {
          enable: {
            option: false,
            fields: [

            ]
          },
          show: {
            option: false,
            fields: [

            ]
          },
          required: {
            option: false,
            fields: [

            ]
          }
        },
        style: null,
        rowBackground: '#ffffff'
      }
    };
  }

  getImageCardData(step) {
    const imageControl = this.stepperFormGroup.get(step.controlType.controlTypeName);
    // if (this.allowImageCard || (!this.imageTypename.some(item => item === step.controlType.controlTypeName)
    //   && this.imageTypename.length > 0)) {
    const options = [];
    this.allowImageCard = false;
    step.stepValues.forEach(obj => {
      options.push(obj.key)
    });
    // this.loadStepValue.splice(i, 1);
    this.imageTypename.push(step.controlType.controlTypeName);
    // this.stepperFormGroup.get(step.controlType.controlTypeName).setValue(options);
    let gridImage = new Field();
    gridImage.name = step.controlType.controlTypeName;
    gridImage.control = {
      imageGridLabel: step.controlType.controlTypeLabel,
      imageGridName: 'gridImage',
      noOfRows: 2,
      noOfColumns: 2,
      height: 150,
      width: 150,
      position: 'left',
      rowLevelSpace: 20,
      columnLevelSpace: 20,
      showImageGridLabel: false,
      optionType: 'i',
      imageKeys: options
    };
    gridImage.fieldWidth = 100;
    gridImage.unique = false;
    gridImage.editable = true;
    gridImage.sensitive = false;
    gridImage.enableHyperlink = false;
    gridImage.rowBackground = '#ffffff';
    gridImage.conditionalChecks = {
      enable: {
        option: false,
        fields: [

        ]
      },
      show: {
        option: false,
        fields: [

        ]
      },
      required: {
        option: false,
        fields: [

        ]
      }
    };
    return {
      controlType: 'imagegrid',
      childSection: false,
      field: gridImage
    };

  }

  getFileUploadJson(step) {
    return {
      controlType: 'fileupload',
      childSection: false,
      field: {
        name: step.controlType.controlTypeName,
        fieldId: null,
        fieldName: null,
        defaultValue: null,
        defaultCode: null,
        control: {
          fileType: 'image',
          fileSize: 1500,
          allowToUploadMultipleFiles: true
        },
        label: {
          labelName: step.controlType.controlTypeLabel,
          labelOption: 'floating',
          labelSize: null,
          labelStyle: null,
          labelPosition: null
        },
        dataType: null,
        fieldWidth: 100,
        unique: false,
        editable: true,
        sensitive: false,
        enableHyperlink: false,
        dateFormat: null,
        rows: 0,
        cols: 0,
        chipSize: 0,
        dateValidation: {
          dateValidation: false,
          allowFutureDate: false,
          operator: null,
          fromField: null,
          toField: null
        },
        numberFieldValidation: {
          numberFieldValidation: false,
          operator: null,
          fromField: null,
          toField: null
        },
        allowFutureDate: false,
        allowPastDate: false,
        onSelection: {
          onSelectionChange: false,
          fieldType: '',
          loadDataLabel: null,
          targetPageName: null,
          targetPageId: null,
          passParameter: null,
          pageType: null,
          version: null
        },
        validations: [
          {
            type: null,
            value: null
          }
        ],
        conditionalChecks: {
          enable: {
            option: false,
            fields: [

            ]
          },
          show: {
            option: false,
            fields: [

            ]
          },
          required: {
            option: false,
            fields: [

            ]
          }
        },
        style: null,
        rowBackground: '#ffffff'
      }
    }
  }

  // {
  //   name: step.controlType.controlTypeName,
  //   fieldId: null,
  //   fieldName: null,
  //   defaultValue: '',
  //   defaultCode: '',
  //   control: {
  //      imageGridLabel: step.controlType.controlTypeLabel,
  //      imageGridName: 'gridImage',
  //      noOfRows: 2,
  //      noOfColumns: 5,
  //      height: 200,
  //      width: 300,
  //      position: 'left',
  //      rowLevelSpace: 20,
  //      columnLevelSpace: 20,
  //      showImageGridLabel: false,
  //      optionType: 's',
  //      filter: {
  //         pageName: 'New Image Page',
  //         tableName: 'xppm_newimagepage',
  //         keyColumnName: 'ya_uploadimage',
  //         descriptionColumnName: 'ya_imagetype',
  //         sortOption: false,
  //         sortBy: [

  //         ],
  //         loadFirstOption: false,
  //         filterOptions: '',
  //         joinClause: '',
  //         version: 1
  //      }
  //   },
  //   label: {
  //      labelName: null,
  //      labelOption: 'floating',
  //      labelSize: null,
  //      labelStyle: null,
  //      labelPosition: null
  //   },
  //   dataType: null,
  //   fieldWidth: 100,
  //   unique: false,
  //   editable: true,
  //   sensitive: false,
  //   enableHyperlink: false,
  //   dateFormat: null,
  //   rows: 0,
  //   cols: 0,
  //   chipSize: 0,
  //   dateValidation: {
  //      dateValidation: false,
  //      allowFutureDate: false,
  //      operator: null,
  //      fromField: null,
  //      toField: null
  //   },
  //   numberFieldValidation: {
  //      numberFieldValidation: false,
  //      operator: null,
  //      fromField: null,
  //      toField: null
  //   },
  //   allowFutureDate: false,
  //   allowPastDate: false,
  //   onSelection: {
  //      onSelectionChange: false,
  //      fieldType: '',
  //      loadDataLabel: null,
  //      targetPageName: null,
  //      targetPageId: null,
  //      passParameter: null,
  //      pageType: null,
  //      version: null
  //   },
  //   validations: [
  //      {
  //         type: null,
  //         value: null
  //      }
  //   ],
  //   conditionalChecks: {
  //      enable: {
  //         option: false,
  //         fields: [

  //         ]
  //      },
  //      show: {
  //         option: false,
  //         fields: [

  //         ]
  //      },
  //      required: {
  //         option: false,
  //         fields: [

  //         ]
  //      }
  //   },
  //   style: null,
  //   rowBackground: '#ffffff'
  // }

}
