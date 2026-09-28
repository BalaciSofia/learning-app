import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';
import { authGuard } from '../../core/guards/auth.guard';
import { RoutePaths } from '../../app.routes';

export const authenticationRoutes: Routes = [
    {
        path: RoutePaths.login,
        canActivate: [guestGuard], //so you can't acces login if you are already logged in :)
        loadComponent: () =>
            import('./login/login')
                .then(m => m.LoginComponent),
    },
    {
        path: RoutePaths.register,
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./register/register')
                .then(m => m.RegisterComponent),
    },
    {
        path: RoutePaths.forgotPassword,
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./forgot-password/forgot-password')
                .then(m => m.ForgotPasswordComponent),
    },
    {
        path: RoutePaths.resetPassword,
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./reset-password/reset-password')
                .then(m => m.ResetPasswordComponent),
    },
    {
        path: RoutePaths.changePassword,
        canActivate: [authGuard], //change pswd only when logged in, if ur not logged in ==> forgot password
        loadComponent: () =>
            import('./change-password/change-password')
                .then(m => m.ChangePasswordComponent),
    }
];
