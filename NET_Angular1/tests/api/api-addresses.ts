/// <reference types="node" />
export const ApiAddresses = {
  baseUrl: process.env['BASE_URL'] || 'http://localhost:4200',
  apiBaseUrl: process.env['API_URL'] || 'http://localhost:5030',
  // Page Routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  admin: '/admin',
  dashboard: '/dashboard',
  changePassword: '/change-password',
  courses: '/courses',
  units: '/units',
  createCourse: '/courses/create',
  testing: '/modules/testing',
  tests: '/modules/testing',
  createTest: '/modules/testing/create',
  battles: '/battles',
  studyQuest: '/study-quest',

  // API Endpoints
  apiLogin: '/api/auth/login',
  apiLogout: '/api/auth/logout',
  apiRegister: '/api/auth/register',
  apiForgotPassword: '/api/auth/forgot-password',
  apiChangePassword: '/api/auth/change-password',
  apiCourses: '/api/courses',
  apiCoursesEnrolled: '/api/courses/enrolled',
  apiTests: '/api/tests',
  apiStudyQuestProfile: '/api/studyquest/profile',
  apiStudyQuestDailyPuzzle: '/api/studyquest/daily-puzzle',
  apiStudyQuestAnswerDailyPuzzle: '/api/studyquest/answer-daily-puzzle',
  apiDuelsStudents: '/api/duels/students',
  apiDuelsInvitations: '/api/duels/invitations',
  apiDuelsActive: '/api/duels/active',
  apiDuelsHistory: '/api/duels/history',
};

