import {
  inject,
  Injectable,
  signal,
  ErrorHandler
} from '@angular/core';
import {
  jwtDecode,
  type JwtPayload,
} from 'jwt-decode';

import type { CurrentUser } from '../../features/authentication/login/models/current-user.model';
import {
  USER_ROLES,
  type UserRole,
} from '../../features/authentication/login/models/user-role.model';
import { TOKEN_KEY } from '../../shared/utils/project-constants';
import { AutoLogoutService } from './auto-logout.service';


interface AuthenticationTokenPayload
  extends JwtPayload {
  readonly nameid?: string;
  readonly unique_name?: string;
  readonly email?: string;
  readonly role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = inject(TOKEN_KEY);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly autoLogoutService = inject(AutoLogoutService);
  private token: string | null = null;
  private readonly currentUserSignal = signal<CurrentUser | null>(null);

  loadToken(): void {
    const storedToken = localStorage.getItem(this.tokenKey);

    if (storedToken === null) {
      this.token = null;
      this.currentUserSignal.set(null);
      return;
    }

    const currentUser = this.decodeCurrentUser(storedToken);

    if (currentUser === null) {
      this.clearToken();
      this.autoLogoutService.handleStoredToken(storedToken);
      return;
    }

    this.token = storedToken;
    this.currentUserSignal.set(currentUser);
    this.autoLogoutService.handleStoredToken(storedToken);
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    const currentUser = this.decodeCurrentUser(token);
    if (currentUser === null) {
      this.clearToken();
    return;
    }

    this.token = token;

    localStorage.setItem(
      this.tokenKey,
      token,
    );

    this.currentUserSignal.set(currentUser);
  }
  
  clearToken(): void {
    this.token = null;

    localStorage.removeItem(
      this.tokenKey,
    );

    this.currentUserSignal.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSignal();
  }

  private decodeCurrentUser(
  token: string,
): CurrentUser | null {
  try {
    const decodedToken =
      jwtDecode<AuthenticationTokenPayload>(
        token,
      );

    if (this.isTokenExpired(decodedToken)) {
      return null;
    }

    const id = Number(decodedToken.nameid);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !decodedToken.email ||
      !this.isUserRole(decodedToken.role)
    ) {
      return null;
    }

    return {
      id,
      name: decodedToken.unique_name ?? decodedToken.email,
      email: decodedToken.email,
      role: decodedToken.role,
    };
  } catch (error: unknown) {
    this.errorHandler.handleError(error);
    return null;
  }
}

  private isTokenExpired(
    decodedToken: JwtPayload,
  ): boolean {
    if (typeof decodedToken.exp !== 'number') {
      return true;
    }

    const currentTime =
      Math.floor(Date.now() / 1000);

    return currentTime >= decodedToken.exp;
  }

  private isUserRole(
    role: string | undefined,
  ): role is UserRole {
    return (
      role !== undefined &&
      USER_ROLES.includes(role as UserRole)
    );
  }
}