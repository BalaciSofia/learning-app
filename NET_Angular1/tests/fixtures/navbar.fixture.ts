export const NAV_LABELS = {
  home: 'Home',
  tests: 'Tests',
  battles: 'Battles',
  courses: 'Courses',
  myProfile: 'My Profile',
  userManagement: 'User Management',
} as const;

export const ROLE_BADGE_TEXT = {
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
  basic: 'Basic',
} as const;

export const ADMIN_EXPECTED_NAV_ITEMS = [
  NAV_LABELS.home,
  NAV_LABELS.tests,
  NAV_LABELS.courses,
  NAV_LABELS.myProfile,
  NAV_LABELS.userManagement,
];

export const ADMIN_UNEXPECTED_NAV_ITEMS = [NAV_LABELS.battles];

export const TEACHER_EXPECTED_NAV_ITEMS = [
  NAV_LABELS.home,
  NAV_LABELS.tests,
  NAV_LABELS.courses,
  NAV_LABELS.myProfile,
];

export const TEACHER_UNEXPECTED_NAV_ITEMS = [NAV_LABELS.battles, NAV_LABELS.userManagement];

export const STUDENT_EXPECTED_NAV_ITEMS = [
  NAV_LABELS.home,
  NAV_LABELS.tests,
  NAV_LABELS.battles,
  NAV_LABELS.courses,
  NAV_LABELS.myProfile,
];

export const STUDENT_UNEXPECTED_NAV_ITEMS = [NAV_LABELS.userManagement];
