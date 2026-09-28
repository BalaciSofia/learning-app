import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';
import { passwordValidator } from '../utils/password-validator';
import { ChangePasswordRequest } from './models/change-password-models';
import { NotificationService } from '../../../core/services/notification.service';
import { ChangePasswordService } from './service/change-password.service';

@Component({
  selector: 'app-change-password-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private changePasswordService = inject(ChangePasswordService);
  private notifService = inject(NotificationService);
  isSubmitting = false;

  changePasswordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', Validators.required]
    },
    {
      validators: this.passwordMatchValidator
    }
  )

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const request: ChangePasswordRequest = {
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword,
      confirmNewPassword: this.changePasswordForm.value.confirmPassword
    };

    this.changePasswordService.changePassword(request).subscribe({
      next: (message) => {
        this.isSubmitting = false;
        this.changePasswordForm.reset();
        this.notifService.show(message, 'success')
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

}



