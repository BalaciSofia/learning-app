import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '../../features/authentication/login/models/user-role.model';
import { RoutePaths } from '../../app.routes';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => () => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  if (user === null) {
    return router.createUrlTree([RoutePaths.login]);
  }

  if (allowedRoles.includes(user.role)) {
    return true;
  }

  notificationService.show('You do not have permission to access this page.', 'error');
  return router.createUrlTree([RoutePaths.dashboard]);
};
