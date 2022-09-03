import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ICardType } from './payment-process.component';



export function cardValidator(getDetectedFn: () => ICardType): ValidatorFn {

  return (control: AbstractControl): { [key: string]: any } => {
    if (!control.value) {
      return null;
    }

    const cardNumber = control.value.replace(/\s/g, '');
    const providedType = getDetectedFn();

    return lengthValidator(cardNumber, providedType)
      || luhnValidator(cardNumber);
  };
}

/** Ensure that a particular card type is used (visa-electron expects a visa card to be detected) */
function cardTypeValidator(acceptedType: ICardType, providedType: ICardType): { [key: string]: any } {
  const isValid = !acceptedType || acceptedType && providedType && acceptedType.name === providedType.name;
  return isValid ? null : { invalidType: true };
}

function lengthValidator(cardNumber: string, cardType: ICardType): { [key: string]: any } {
  if (!cardNumber || !cardType) {
    return null;
  }

  const isValid = cardNumber.length >= cardType.lengths[0] && cardNumber.length <= cardType.lengths[cardType.lengths.length - 1];
  return isValid ? null : { invalidLength: true };
}

function luhnValidator(cardNumber: string): { [key: string]: any } {
  let odd = true;
  const sum = cardNumber
    .replace(/\s/g, '')
    .split('')
    .reverse()
    .map(i => parseInt(i, 10))
    .reduce((prev, current) => {
      odd = !odd;
      if (odd) {
        current *= 2;
      }

      if (current > 9) {
        current -= 9;
      }

      return prev += current;
    }, 0);

  return sum % 10 === 0 ? null : { luhn: true };
}
