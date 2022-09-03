import { FormGroup, FormArray } from '@angular/forms';

abstract class MissingConfiguration {
    list: string[] = [];

    getInvalidFormControls(form: FormGroup): string[] {
        Object.keys(form.controls).forEach(field => {
            const control = form.get(field);
            // if ((control instanceof FormArray)) {
            //   this.validateFormArrayFields(control);
            // }
            if (control.invalid === true) {
                this.list.push(field);
            }
        });
        return this.list;
    }

    validateFormArrayFields(formArray: FormArray) {
        for (let i = 0; i < formArray.length; i++) {
            const group = formArray.get(i + '') as FormGroup;
            Object.keys(group.controls).forEach(arrayField => {
                const formArrayControl = group.get(arrayField);
                formArrayControl.markAsTouched({ onlySelf: true });
                if ((formArrayControl instanceof FormArray)) {
                    this.validateFormArrayFields(formArrayControl);
                }
            });
        }
    }
}
