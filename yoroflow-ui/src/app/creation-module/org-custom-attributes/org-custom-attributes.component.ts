import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared-module/snackbar/snackbar.component';
import { UserCustomAttributeService } from '../user-custom-attributes/user-custom-attribute.service';
import { CustomAttributeListVO, CustomAttributeVO } from './org-custom-attribute-vo';

export class FieldName {
  index: number;
  value: string;
}

@Component({
  selector: 'lib-org-custom-attributes',
  templateUrl: './org-custom-attributes.component.html',
  styleUrls: ['./org-custom-attributes.component.css']
})
export class OrgCustomAttributesComponent implements OnInit {

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar,
              private userCustomAttributeService: UserCustomAttributeService) { }

    customAttributeForm: FormGroup;
    loadVariables = true;
    deletedIdList: any[] = [];
    attributesVoList = new CustomAttributeVO();
    @Input() customerInfo: any;

    @Output() submit: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit(): void {
      this.initiateCustomAtrributeForm();
      this.getCustomAttributes();
    }
  initiateCustomAtrributeForm() {
    this.customAttributeForm = this.fb.group({
      customAttributeListVo: this.fb.array([this.getCustomAtrributeGroup()]),
    });
  }

  getCustomAttributes() {
    this.userCustomAttributeService.getCustomattributesDetails().subscribe(data => {
      this.attributesVoList.customAttributeListVo = data;
      this.loadVariableForm(this.attributesVoList.customAttributeListVo);
    });
  }

  getCustomAtrributeGroup() {
    return this.fb.group({
      id: [],
      name: ['', [Validators.required]],
      dataType: ['', [Validators.required]],
      value: [''],
      size: ['', [Validators.required]],
      required: [''],
      attributeType: ['', [Validators.required]],
    });
  }

  getCustomAtrributeFormArray() {
    return (this.customAttributeForm.get('customAttributeListVo') as FormArray);
  }

  addAttributes() {
    this.getCustomAtrributeFormArray().push(this.getCustomAtrributeGroup());
  }

  removeAttributes(i) {
    const deleteId = (this.getCustomAtrributeFormArray().get('' + i) as FormGroup).get('id').value;
    if (deleteId !== null && deleteId !== '') {
      this.deletedIdList.push(deleteId);
      this.customAttributeForm.markAsDirty();
    }
    this.getCustomAtrributeFormArray().removeAt(i);
    if (this.getCustomAtrributeFormArray().length === 0) {
      this.getCustomAtrributeFormArray().push(this.getCustomAtrributeGroup());
    }
  }

  getFieldNames(): FieldName[] {
    // tslint:disable-next-line: prefer-const
    let attributeNames: FieldName[] = [];
    for (let i = 0; i < this.getCustomAtrributeFormArray().length; i++) {
      const name = this.getCustomAtrributeFormArray().get('' + i).get('name').value;
      if (name !== null && name !== undefined && name !== '') {
        attributeNames.push({ index: i, value: name });
      }
    }
    return attributeNames;
  }

  checkDuplicateAttribute(i) {
    const attributeName = this.getCustomAtrributeFormArray().get('' + i).get('name');
    const attributeNames: FieldName[] = this.getFieldNames();
    for (let j = 0; j < this.getCustomAtrributeFormArray().length; j++) {
      const attribute = this.getCustomAtrributeFormArray().get('' + j).get('name');
      if (attributeNames.some(name => (name.index !== i && name.value === attributeName.value))) {
        this.getCustomAtrributeFormArray().get('' + i).get('name').setErrors({ unique: true });
      }
      if (attribute.errors && attribute.errors.unique === true) {
        if (!attributeNames.some(name => (name.value === attribute.value && name.index !== j))) {
          attribute.setErrors(null);
        }
      }
      attribute.markAsTouched({ onlySelf: true });
    }
  }

  loadVariableForm(list: CustomAttributeListVO[]) {
    if (list) {
      this.loadVariables = false;
      for (let i = 0; i < list.length; i++) {
        if (i > 0) {
          this.addAttributes();
        }
        list[i].name = list[i].name.split('_')[1];
        (this.getCustomAtrributeFormArray().get('' + i) as FormGroup).setValue(list[i]);
      }
    }
  }

  save(userForm) {
    this.attributesVoList = this.customAttributeForm.getRawValue();
    this.attributesVoList.deletedColumnIDList = this.deletedIdList;
    if (userForm.valid) {
      this.attributesVoList.customAttributeListVo.forEach(params => {
        if (!params.name.includes('userCustomAttribute_')) {
          params.name = 'userCustomAttribute_' + params.name;
        }
      });
      if (this.customerInfo) {
        this.submit.emit({ customAttributes: this.attributesVoList });
      } else {
      this.userCustomAttributeService.saveCustomattributesDetails(this.attributesVoList).subscribe(data => {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: data.response,
        });
      });
    }
    }
  }
  }
