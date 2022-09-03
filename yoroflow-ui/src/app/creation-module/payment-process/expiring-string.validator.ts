import { AbstractControl, ValidatorFn } from '@angular/forms';

export function expiryStringValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    if (!control.value) {
      return null;
    }

    let [month, year] = String(control.value || '0 / 0').split(/\s\/\s/).map(v => +v);
    const today = new Date();
    const date = new Date();

    if (year.toString().length < 3) {
      year += 2000;
    }

    date.setUTCFullYear(year);
    date.setMonth(month - 1);
    date.setDate(date.getDate() + 1);

    return date > today ? null : { expired: true };
  };
}