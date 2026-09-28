import { InjectionToken } from '@angular/core';

export class Endpoints {
  static readonly LoginRoute = '/auth/login';
  static readonly RegisterRoute = '/auth/register';
  static readonly ForgotPasswordRoute = '/auth/forgot-password';
  static readonly ResetPasswordRoute = '/auth/reset-password';
  static readonly ChangePasswordRoute = '/auth/change-password';
  static readonly LogoutRoute = '/auth/logout';
  static readonly TestsRoute = '/tests';
  static readonly AdminBasicUsersRoute = '/admin/users/basic';
  static readonly AdminAllUsersRoute = '/admin/users';
  static readonly BattlesRoute = '/duels';

  static adminChangeRoleRoute(userId: number): string {
    return `/admin/users/${userId}/role`;
  }

  static readonly AUTH_ENDPOINTS = [
  Endpoints.LoginRoute,
  Endpoints.RegisterRoute,
  Endpoints.ForgotPasswordRoute,
  Endpoints.ResetPasswordRoute,
  ];

  static readonly CourseRoute = '/courses';
  static readonly EnrolledCoursesRoute = '/courses/enrolled';
  static readonly LessonRoute = '/lessons';

  static readonly UnitLessonsRoute = '/units';

  static readonly COURSE_ENDPOINTS = [
    Endpoints.CourseRoute,
    Endpoints.LessonRoute,
    Endpoints.UnitLessonsRoute
  ];

  static questionsRoute(testId: number): string {
    return `${Endpoints.TestsRoute}/${testId}/questions`;
  }

  static questionRoute(testId: number, questionId: number): string {
    return `${Endpoints.questionsRoute(testId)}/${questionId}`;
  }

  static answersRoute(testId: number, questionId: number): string {
    return `${Endpoints.questionRoute(testId, questionId)}/answers`;
  }

  static answerRoute(testId: number, questionId: number, answerId: number): string {
    return `${Endpoints.answersRoute(testId, questionId)}/${answerId}`;
  }

  static readonly GenerateDistractorsRoute = `${Endpoints.TestsRoute}/generate-distractors`;

  static readonly CurrentUserRoute = '/users/me';
  static readonly StudyQuestProfileRoute = '/studyquest/profile';
  static readonly StudyQuestDailyPuzzleRoute = '/studyquest/daily-puzzle';
  static readonly StudyQuestAnswerDailyPuzzleRoute = '/studyquest/answer-daily-puzzle';

  static enrollRoute(courseId: number): string {
    return `${Endpoints.CourseRoute}/${courseId}/enroll`;
  }

  static courseProgressRoute(courseId: number): string {
    return `${Endpoints.CourseRoute}/${courseId}/progress`;
  }

  static lessonCompleteRoute(courseId: number, unitId: number, lessonId: number): string {
    return `${Endpoints.CourseRoute}/${courseId}/units/${unitId}/lessons/${lessonId}/complete`;
  }

  static testStatisticsRoute(testId: number): string {
    return `${Endpoints.TestsRoute}/${testId}/stats`;
}
}

export const AUTH_ENDPOINTS = new InjectionToken<string[]>('AUTH_ENDPOINTS', {
  providedIn: 'root',
  factory: () => Endpoints.AUTH_ENDPOINTS
});

export const COURSE_ENDPOINTS = new InjectionToken<string[]>('COURSE_ENDPOINTS', {
  providedIn: 'root',
  factory: () => Endpoints.COURSE_ENDPOINTS
});
