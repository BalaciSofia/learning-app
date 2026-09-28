import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AUTH_ENDPOINTS } from '../../shared/utils/endpoints';

export const SKIP_ERROR_NOTIFICATION = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authEndpoints = inject(AUTH_ENDPOINTS);

  if (authEndpoints.some(endpoint => req.url.includes(endpoint))) {
    return next(req);
  }

  if (req.context.get(SKIP_ERROR_NOTIFICATION)) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      notificationService.show('Something went wrong.', err.status === 401 ? 'auth' : 'error');
      return throwError(() => err);
    })
  );
};