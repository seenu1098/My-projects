import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Field,FieldConfig } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';
import {CurrencyPipe} from '@angular/common'

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent implements OnInit {
  field: Field;
  fieldConfig: FieldConfig;
  group: FormGroup;
  showControl = true;
  required = '';
  isRequired = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 850) {
      this.el.nativeElement.style.width = '100%';
    } else {
      this.el.nativeElement.style.width = this.field.fieldWidth + '%';
    }
  }
  constructor(public el: ElementRef, public formService: CreateFormService,
    private cp: CurrencyPipe) { }

  ngOnInit(): void {
    if (this.group.get(this.fieldConfig.field.name) &&
    this.group.get(this.fieldConfig.field.name).hasError('required')) {
    this.required = ' *';
  }

  if (window.innerWidth <= 850) {
    this.el.nativeElement.style.width = '100%';
  } else {
    this.el.nativeElement.style.width = this.fieldConfig.field.fieldWidth + '%';
  }

    if (this.fieldConfig.field.validations) {
      this.isRequired = this.formService.getIsRequiredValue(this.fieldConfig.field.validations);
    }
    this.formService.addConditonallyRequiredValidation(this.fieldConfig.field, this, this.isRequired);
    this.formService.checkConditionallyEnableValidation(this.fieldConfig.field, this);
    this.formService.addCondtionallyEnabledFormValueChanges(this.fieldConfig.field, this);
    this.formService.checkConditionallyShowValidation(this.fieldConfig.field, this);
    this.formService.addContionallyShowValidationValueChanges(this.fieldConfig.field, this, this.group);
  }

transformAmount(element,name){
  if(name === 'amt'){
    let formattedAmount = this.cp.transform(this.group.get(this.fieldConfig.field.name).value,this.fieldConfig.field.control.currencyCode)
    element.target.value = formattedAmount;
    const firstDigit = formattedAmount.search(/\d/);
    const value =  formattedAmount.substring(0, firstDigit) + ' ' + formattedAmount.substr(firstDigit);
    this.group.get(this.fieldConfig.field.name).setValue(value);
  }

}

}

