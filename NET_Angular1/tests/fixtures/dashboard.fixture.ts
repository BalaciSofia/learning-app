export const DASHBOARD_BOX_TITLES = {
  tests: 'Tests',
  courses: 'Courses',
  battle: 'Battle',
  userManagement: 'User Management',
} as const;

export const ADMIN_DASHBOARD_BOXES = [
  DASHBOARD_BOX_TITLES.tests,
  DASHBOARD_BOX_TITLES.courses,
  DASHBOARD_BOX_TITLES.userManagement,
];

export const TEACHER_DASHBOARD_BOXES = [DASHBOARD_BOX_TITLES.tests, DASHBOARD_BOX_TITLES.courses];

export const STUDENT_DASHBOARD_BOXES = [
  DASHBOARD_BOX_TITLES.tests,
  DASHBOARD_BOX_TITLES.courses,
  DASHBOARD_BOX_TITLES.battle,
];

export const BASIC_UNASSIGNED_ROLE_MESSAGE = 'someone will assign you a role shortly';

export const WELCOME_TEXT = 'Welcome';
