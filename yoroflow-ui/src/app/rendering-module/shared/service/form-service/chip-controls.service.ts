import { Injectable } from '@angular/core';
import { FormGroup, FormArray, Validators } from '@angular/forms';
import { Section, Field } from '../../vo/page-vo';
import { ChipComponent } from '../../components/chip/chip.component';
import { LoadFormService } from './load-form.service';

@Injectable({
  providedIn: 'root'
})
export class ChipControlsService {

  constructor() { }

  chipComponents = [];
  chipControlsNames: string[] = [];

  addChipComponents($event) {
    const event = $event.$event;
    if (event.$event) {
      if (event.$event && !event.$event.$event) {
        const field = (event.$event.field) as Field;
        if (event.name !== undefined && event.i !== undefined && event.j === undefined) {
          this.chipComponents[event.name + '_' + field.name + '_' + event.i] = event.$event;
        } else {
          this.chipComponents[event.name + '_' + field.name + '_' + event.j + '_' + event.i] = event.$event;
        }
      } else if (event.$event.$event) {
        const field = (event.$event.$event.field) as Field;
        this.chipComponents[event.$event.name + '_' + field.name + '_' + event.$event.i] = event.$event;
      }
    } else {
      const key = event.field as Field;
      this.chipComponents[key.name] = event;
    }
  }


  setChipValueForFormControls(section: Section[], form, formGroup) {
    section.forEach(sec => {
      this.setChipValuesForSectionControls(sec, form, formGroup);
    });
  }

  setChipValuesForSectionControls(section: Section, form, formGroup) {
    if (section.repeatable === false || section.repeatable === null) {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'chip' && this.chipComponents[column.field.name]) {
            const component = this.chipComponents[column.field.name] as ChipComponent;
            if (component.placeholder.length === 0 && column.field.validations) {
              column.field.validations.forEach(params => {
                if (params.type === 'required') {
                  formGroup.get(column.field.name).setValidators([Validators.required]);
                  formGroup.get(column.field.name).updateValueAndValidity();
                }
              });
            } else {
              form[column.field.name] = component.getListFromPlaceHolder(component.placeholder);
            }
          }
        });
      });
    } else {
      this.setChipValueForFormArray(section, form);
    }
  }

  removePlaceholder(sections: Section[]) {
    sections.forEach(section => {
    if (section.repeatable === false || section.repeatable === null) {
      section.rows.forEach(row => {
        row.columns.forEach(column => {
          if (column.controlType === 'chip' && this.chipComponents[column.field.name]) {
            const component = this.chipComponents[column.field.name] as ChipComponent;
            component.placeholder = [];
          }
      });
    });
  }
});
  }

  setChipValueForFormArray(section: Section, form: FormGroup) {
    if (section.repeatableName !== null && section.repeatable === true) {
      const array = (form.get(section.repeatableName) as FormArray);
      for (let i = 0; i < array.length; i++) {
        const index = i + '';
        const group = form.get(section.repeatableName).get(index) as FormGroup;
        this.setFormArrayChipValues(group, section, i, null);
        if (section.sections) {
          section.sections.forEach(arrayOfSection => {
            if (arrayOfSection.repeatable === true) {
              const nestedFormArray = (group.get(arrayOfSection.repeatableName) as FormArray);
              for (let j = 0; j < nestedFormArray.length; j++) {
                const nestedIndex = j + '';
                const nestedGroup = nestedFormArray.get(nestedIndex) as FormGroup;
                this.setFormArrayChipValues(nestedGroup, arrayOfSection, j, i);
              }
            } else {
              this.setFormArrayChipValues(group, arrayOfSection, i, null);
            }
          });
        }
      }
    }
  }

  setFormArrayChipValues(group: FormGroup, section: Section, i: number, j: number) {
    section.rows.forEach(row => row.columns.forEach(column => {
      let component;
      if (column.controlType === 'chip') {
        if (j !== null) {
          component = this.chipComponents[section.repeatableName + '_' + column.field.name + '_' + j + '_' + i] as ChipComponent;
        } else {
          component = this.chipComponents[section.repeatableName + '_' + column.field.name + '_' + i] as ChipComponent;
        }
        group.get(column.field.name).setValue(component.getListFromPlaceHolder(component.placeholder));
       // component.placeholder = [];
      }
    }));
  }
}
