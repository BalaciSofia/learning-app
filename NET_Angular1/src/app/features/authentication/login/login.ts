import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from './service/login.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RoutePaths } from '../../../app.routes';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner";
import { finalize } from "rxjs";

@Component({
    selector: 'app-login',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        LoadingSpinnerComponent
    ],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    protected readonly hidePassword = signal(true);
    private readonly loginService = inject(LoginService);
    private readonly notificationService = inject(NotificationService);
    private readonly router = inject(Router);
    protected readonly isLoading = signal(false);

    protected readonly loginForm = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    protected togglePasswordVisibility(): void {
        this.hidePassword.update(value => !value);
    }

    protected onSubmit(): void {
    if (this.loginForm.invalid) {
        this.loginForm.markAllAsTouched();
        return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.isLoading.set(true);

    this.loginService.login({ email, password })
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
            next: () => {
                void this.router.navigate([RoutePaths.dashboard]);
            },
            error: () => {
                this.notificationService.show('Invalid email or password.', 'auth');
            }
        });
}
}