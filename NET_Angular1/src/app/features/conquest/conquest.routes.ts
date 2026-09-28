import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../authentication/login/models/user-role.model';

export const CONQUEST_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard([UserRole.Student])],
    loadComponent: () =>
      import('./pages/conquest-page/conquest-page.component').then(
        (m) => m.ConquestPageComponent
      ),
  },
  {
    path: ':courseId',
    canActivate: [authGuard, roleGuard([UserRole.Student])],
    loadComponent: () =>
      import('./pages/conquest-page/conquest-page.component').then(
        (m) => m.ConquestPageComponent
      ),
  },
];