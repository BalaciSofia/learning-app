import { UserRole } from '../../authentication/login/models/user-role.model';

export interface BasicUserResponse {
  readonly id: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly role: UserRole;
}

export interface ChangeRoleResponse {
  readonly id: number;
  readonly role: UserRole;
}
