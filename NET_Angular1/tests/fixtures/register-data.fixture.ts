export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  institutionId: number;
  password: string;
}
export const EXISTING_USER_EMAIL = 'admin@learnhub.io';
export const createValidUserData = (customEmail?: string): RegisterUserData => ({
  firstName: 'TestFirstName',
  lastName: 'TestLastName',
  email: customEmail ?? `user.${Date.now()}@test.com`,
  institutionId: 1,
  password: 'StrongPass123!',
});
export const INVALID_REGISTER_DATA = {
  mismatchedPasswords: {
    password: 'StrongPass123!',
    confirmPassword: 'SomeOtherPswd123!',
  },
  invalidEmail: 'not-a-valid-email',
  weakPassword: '123'
};