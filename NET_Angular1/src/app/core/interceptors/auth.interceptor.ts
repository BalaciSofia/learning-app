import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, EMPTY } from 'rxjs';
import { RoutePaths } from '../../app.routes';
import { AuthService } from '../services/auth.service';
import { AUTH_ENDPOINTS } from '../../shared/utils/endpoints';

function redirectToLogin(router: Router, authService: AuthService): void {
  authService.clearToken();
  router.navigate([RoutePaths.login]);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const authEndpoints = inject(AUTH_ENDPOINTS);

  if (authEndpoints.some(endpoint => req.url.includes(endpoint))) {
    return next(req);
  }

  if (!authService.isAuthenticated()) {
    redirectToLogin(router, authService);
    return EMPTY;
  }

  const token = authService.getToken()!;
  const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        redirectToLogin(router, authService);
      }
      return throwError(() => err);
    })
  );
};
