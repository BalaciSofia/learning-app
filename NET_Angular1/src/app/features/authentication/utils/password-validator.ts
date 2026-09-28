import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordValidator(control: AbstractControl):ValidationErrors | null{
    const value: string = control.value || '';

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const errors: ValidationErrors = {};

    if (!hasMinLength) errors['minLength'] = true;
    if (!hasUpperCase) errors['upperCase'] = true;
    if (!hasLowerCase) errors['lowerCase'] = true;
    if (!hasDigit) errors['digit'] = true;
    if (!hasSpecialChar) errors['specialChar'] = true;

    return Object.keys(errors).length > 0 ? errors : null;
}