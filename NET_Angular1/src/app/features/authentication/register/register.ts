import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { NotificationService } from '../../../core/services/notification.service';
import { RoutePaths } from '../../../app.routes';
import { passwordValidator } from '../utils/password-validator';
import { RegisterService } from './service/register.service';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
    templateUrl: './register.html',
    styleUrl: './register.scss'
})
export class RegisterComponent {
    private readonly fb = inject(FormBuilder);
    private readonly registerService = inject(RegisterService);
    private readonly notificationService = inject(NotificationService);
    private readonly router = inject(Router);

    protected readonly isLoading = signal(false);
    protected readonly hidePassword = signal(true);
    protected readonly hideConfirm = signal(true);

    protected readonly registerForm = this.fb.nonNullable.group(
        {
            firstName: ['', [Validators.required, Validators.maxLength(50)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            institutionId: [0, [Validators.required, Validators.min(1)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, passwordValidator]],
            confirmPassword: ['', Validators.required]
        },
        { validators: this.passwordMatchValidator }
    );

    private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
        const password = group.get('password')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return password === confirm ? null : { passwordsMismatch: true };
    }

    protected togglePassword(): void {
        this.hidePassword.update(v => !v);
    }

    protected toggleConfirm(): void {
        this.hideConfirm.update(v => !v);
    }

    protected onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);

        this.registerService.register(this.registerForm.getRawValue())
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.show('Account created! You can now sign in.', 'success');
                    void this.router.navigate([RoutePaths.login]);
                },
                error: () => {
                    this.notificationService.show('Registration failed. Please check your details and try again.', 'auth');
                }
            });
    }
}
