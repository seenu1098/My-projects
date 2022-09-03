import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Section } from '../../vo/page-vo';
import { CreateFormService } from '../../service/form-service/create-form.service';

@Component({
  selector: 'app-dynamic-array',
  templateUrl: './dynamic-array.component.html',
  styles: [`.mat-mini-fab  {
    height: 30px;
    width: 30px;
  }
  .mat-icon{
    font-size: 16px;;
}`]
})
export class DynamicArrayComponent implements OnInit {
  @Input() section: Section;
  @Input() formArray: FormArray;
  @Input() isAllowEdit: boolean;
  @Output() getChipComponentFromArray: EventEmitter<any> = new EventEmitter<any>();
  showBorder: string;

  constructor(public fb: FormBuilder, public formService: CreateFormService) { }
  ngOnInit() {
    if (this.section.border === false) {
      this.showBorder = 'none';
    }
  }

  addAnotherSection(i, section: Section) {
    this.formArray.push(this.fb.group({}));
    const formGroup = (this.formArray.get((this.formArray.length - 1) + '') as FormGroup);
    formGroup.addControl('id', this.fb.control('-1'));
    this.formService.createRowFormControl(section.rows, formGroup);
    if (section.sections) {
      section.sections.forEach(arrayOfSection => {
        if (arrayOfSection.repeatable === false && !arrayOfSection.repeatableName) {
          this.formService.createRowFormControl(arrayOfSection.rows, formGroup);
        } else if (arrayOfSection.repeatable === true && arrayOfSection.repeatableName !== null) {
          this.formService.createFormArray(arrayOfSection, formGroup);
        }
      });
    }
  }

  removeThisSection(i, section: Section) {
    this.formArray.removeAt(i);
  }

  getChipArraytInstance($event, name, i, j) {
    const event = $event.$event;
    this.getChipArrayComponentInstance(event, name, i, j);
  }

  getChipArrayComponentInstance($event, name, i, j) {
    this.getChipComponentFromArray.emit({ $event, name, i, j });
  }

}
