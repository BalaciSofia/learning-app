import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../authentication/login/models/user-role.model';

export const testsRoutes: Routes = [
    {
        path: '',
        canActivate: [roleGuard([UserRole.Student, UserRole.Teacher, UserRole.Admin])],
        loadComponent: () =>
            import('./pages/tests-list/tests-list')
                .then(m => m.TestsListComponent),
    },
    {
        path: 'create',
        canActivate: [roleGuard([UserRole.Teacher, UserRole.Admin])],
        loadComponent: () =>
            import('./pages/create-test/create-test')
                .then(m => m.CreateTestComponent),
    },
    {
        path: ':testId/take',
        canActivate: [roleGuard([UserRole.Student, UserRole.Admin])],
        loadComponent: () =>
            import('./pages/take-test/take-test')
                .then(m => m.TakeTestComponent),
    },
    {
        path: ':testId/attempts/:attemptId/result',
        canActivate: [roleGuard([UserRole.Student, UserRole.Teacher])],
        loadComponent: () =>
            import('./pages/test-result/test-result')
                .then(m => m.TestResultComponent),
    },
    {
        path: ':testId/attempts/:attemptId/review',
        canActivate: [roleGuard([UserRole.Student, UserRole.Teacher])],
        loadComponent: () =>
            import('./pages/question-review/question-review')
                .then(m => m.QuestionReviewComponent),
    },
    {
        path: ':testId/attempts',
        canActivate: [roleGuard([UserRole.Student, UserRole.Teacher])],
        loadComponent: () =>
            import('./pages/previous-attempts/previous-attempts')
                .then(m => m.PreviousAttemptsComponent),
    },
    {
        path: ':testId/questions',
        canActivate: [roleGuard([UserRole.Teacher, UserRole.Admin])],
        loadComponent: () =>
            import('./pages/question-builder/question-builder')
                .then(m => m.QuestionBuilderComponent),
    },
    {
    path: ':testId/statistics',
    canActivate: [roleGuard([UserRole.Teacher])],
    loadComponent: () =>
        import('./pages/test-statistics/test-statistics')
            .then(m => m.TestStatisticsComponent),
    },
    {
        path: ':testId',
        canActivate: [roleGuard([UserRole.Teacher, UserRole.Admin])],
        loadComponent: () =>
            import('./pages/test-detail/test-detail')
                .then(m => m.TestDetailComponent),
    },
];
