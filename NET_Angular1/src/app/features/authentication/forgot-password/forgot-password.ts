import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { ForgotPasswordService } from './service/forgot-password.service';

@Component({
    selector: 'app-forgot-password',
    imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.scss'
})
export class ForgotPasswordComponent {
    private readonly fb = inject(FormBuilder);
    private readonly forgotPasswordService = inject(ForgotPasswordService);

    protected readonly isLoading = signal(false);
    protected readonly submitted = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]]
    });

    protected onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);

        this.forgotPasswordService.sendResetLink(this.form.getRawValue().email)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: () => this.submitted.set(true),
                error: () => this.submitted.set(true) 
            });
    }
}
