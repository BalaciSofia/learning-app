import { UserRole } from './user-role.model';

export interface CurrentUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
}