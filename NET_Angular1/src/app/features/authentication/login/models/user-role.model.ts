export enum UserRole {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Student = 'Student',
  Basic = 'Basic',
}

export const USER_ROLES: readonly UserRole[] =
  Object.values(UserRole);
