export interface BasicUserFixture {
  firstName: string;
  lastName: string;
  email: string;
  institutionId: number;
  password: string;
}

export function createBasicUserFixture(): BasicUserFixture {
  const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 10_000)}`;

  return {
    firstName: 'Role',
    lastName: 'TestUser',
    email: `role_test_${uniqueId}@example.com`,
    institutionId: 1,
    password: 'TestPassword123!',
  };
}
