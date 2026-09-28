import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../authentication/login/models/user-role.model';

export const COURSES_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/course-list/course-list.component').then(
        (c) => c.CourseListComponent
      ),
  },
  {
    path: 'details/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/course-detail/course-detail.component').then(
        (c) => c.CourseDetailComponent
      ),
  },
  {
  path: 'create',
  canActivate: [roleGuard([UserRole.Teacher])],
  loadComponent: () =>
    import('./pages/course-create/course-create.component').then(
      (c) => c.CourseCreateComponent
    ),
  },
  {
    path: 'units/:unitId/lessons/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/add-lesson/add-lesson.component').then(
        (c) => c.AddLessonComponent
      ),
  },
  {
    path: 'lessons/:lessonId/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/edit-lesson/edit-lesson.component').then(
        (c) => c.EditLessonComponent
      ),
  },
];