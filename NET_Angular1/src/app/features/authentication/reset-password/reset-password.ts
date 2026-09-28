import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { NotificationService } from '../../../core/services/notification.service';
import { RoutePaths } from '../../../app.routes';
import { passwordValidator } from '../utils/password-validator';
import { ResetPasswordService } from './service/reset-password.service';
import { ResetPasswordRequest } from './models/reset-password-request.model';

@Component({
    selector: 'app-reset-password',
    imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.scss'
})
export class ResetPasswordComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly resetPasswordService = inject(ResetPasswordService);
    private readonly notificationService = inject(NotificationService);

    protected readonly isLoading = signal(false);
    protected readonly invalidToken = signal(false);
    protected readonly hidePassword = signal(true);
    protected readonly hideConfirm = signal(true);

    private token = '';

    protected readonly form = this.fb.nonNullable.group(
        {
            newPassword: ['', [Validators.required, passwordValidator]],
            confirmNewPassword: ['', Validators.required]
        },
        { validators: this.passwordMatchValidator }
    );

    ngOnInit(): void {
        const token = this.route.snapshot.queryParamMap.get('token');
        if (!token) {
            this.invalidToken.set(true);
            return;
        }
        this.token = token;
    }

    private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
        const pw = group.get('newPassword')?.value;
        const confirm = group.get('confirmNewPassword')?.value;
        return pw === confirm ? null : { passwordsMismatch: true };
    }

    protected togglePassword(): void { this.hidePassword.update(v => !v); }
    protected toggleConfirm(): void { this.hideConfirm.update(v => !v); }

    protected onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);

        const { newPassword, confirmNewPassword } = this.form.getRawValue();

        this.resetPasswordService.resetPassword({ token: this.token, newPassword, confirmNewPassword })
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.show('Password reset! You can now sign in.', 'success');
                    void this.router.navigate([RoutePaths.login]);
                },
                error: () => {
                    this.notificationService.show('Invalid or expired reset link.', 'auth');
                    this.invalidToken.set(true);
                }
            });
    }
}
