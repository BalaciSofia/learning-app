import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const RoutePaths = {
  login: 'login',
  register: 'register',
  forgotPassword: 'forgot-password',
  resetPassword: 'reset-password',
  changePassword: 'change-password',
  dashboard: 'dashboard',
  courses: 'courses',
  units: 'units',
  lessons: 'lessons',
  editLesson: 'edit',
  newLesson: 'new',
  // full multi-segment path by design: the task spec mandates /modules/testing,
  // and future feature modules are intended to live under the /modules/ prefix
  testing: 'modules/testing',
  admin: 'admin',
  studyQuest: 'study-quest',
  pvp: 'pvp',
  conquest: 'modules/conquest',
  battles: 'battles',
} as const;

export const routes: Routes = [
  {
    path: '',
    redirectTo: RoutePaths.login,
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () =>
      import(
        './features/authentication/authentication.routes'
      ).then(
        (module) => module.authenticationRoutes,
      ),
  },
  {
    path: RoutePaths.dashboard,
    canActivate: [authGuard],
    loadChildren: () =>
      import(
        './features/dashboard/dashboard.routes'
      ).then(
        (module) => module.dashboardRoutes,
      ),
  },
  {
    path: RoutePaths.courses,
    canActivate: [authGuard],
    loadChildren: () => import('./features/courses/courses.routes').then(m => m.COURSES_ROUTES)
  },
  {
    path: RoutePaths.testing,
    canActivate: [authGuard],
    loadChildren: () =>
      import(
        './features/tests/tests.routes'
      ).then(
        (module) => module.testsRoutes,
      ),
  },
  {
    path: RoutePaths.admin,
    canActivate: [authGuard],
    loadChildren: () =>
      import(
        './features/admin/admin.routes'
      ).then(
        (module) => module.adminRoutes,
      ),
  },
  {
    path: RoutePaths.studyQuest,
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/study-quest/study-quest').then(m => m.StudyQuestComponent),
  },
  {
    path: RoutePaths.conquest,
    canActivate: [authGuard],
    loadChildren: () =>
      import(
        './features/conquest/conquest.routes'
      ).then(
        (m) => m.CONQUEST_ROUTES
      ),
  },
  {
    path: RoutePaths.battles,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/battles/battles.routes').then(m => m.battlesRoutes),
  },
  {
    path: '**',
    redirectTo: RoutePaths.login,
  },
];
