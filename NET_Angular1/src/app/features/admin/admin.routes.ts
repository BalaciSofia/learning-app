import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../authentication/login/models/user-role.model';

export const adminRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [roleGuard([UserRole.Admin])],
    loadComponent: () =>
      import('./pages/user-list/user-list.component').then(
        (c) => c.UserListComponent
      ),
  },
];
