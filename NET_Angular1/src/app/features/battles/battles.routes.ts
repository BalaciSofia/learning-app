import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../authentication/login/models/user-role.model';

export const battlesRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard([UserRole.Student])],
    loadComponent: () => import('./pages/duel-dashboard/duel-dashboard').then(m => m.DuelDashboardComponent),
  },
  {
    path: 'challenge',
    canActivate: [roleGuard([UserRole.Student])],
    loadComponent: () => import('./pages/challenge-student/challenge-student').then(m => m.ChallengeStudentComponent),
  },
  {
    path: 'take/:duelId/:testId',
    canActivate: [roleGuard([UserRole.Student])],
    loadComponent: () => import('./pages/take-duel/take-duel').then(m => m.TakeDuelComponent),
  },
];
