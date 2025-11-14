import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchPassword(passwordCtrl: string, confirmCtrl: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get(passwordCtrl)?.value;
    const confirm = group.get(confirmCtrl)?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  };
}
