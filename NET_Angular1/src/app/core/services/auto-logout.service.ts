import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AutoLogoutService {
  private readonly document = inject(DOCUMENT);

  private readonly _tokenExpired$ = new Subject<void>();
  readonly tokenExpired$ = this._tokenExpired$.asObservable();

  private logoutTimer: ReturnType<typeof setTimeout> | null = null;
  private visibilityChangeHandler: (() => void) | null = null;

  handleStoredToken(token: string): void {
    const expiry = this.getTokenExpiry(token);
    if (expiry === null) return;

    if (Date.now() >= expiry) {
      this.notifyExpired();
    } else {
      this.schedule(token);
    }
  }

  private getTokenExpiry(token: string): number | null {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  schedule(token: string): void {
    this.cancel();
    const expiresAtMs = this.getTokenExpiry(token);
    if (expiresAtMs === null) return;
    const msUntilExpiry = expiresAtMs - Date.now();
    if (msUntilExpiry <= 0) return;

    this.logoutTimer = setTimeout(() => {
      this.cancel();
      this._tokenExpired$.next();
    }, msUntilExpiry);

    this.visibilityChangeHandler = () => {
      if (this.document.visibilityState === 'visible' && Date.now() >= expiresAtMs) {
        this.cancel();
        this._tokenExpired$.next();
      }
    };
    this.document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  cancel(): void {
    if (this.logoutTimer !== null) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
    if (this.visibilityChangeHandler !== null) {
      this.document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  private notifyExpired(): void {
    setTimeout(() => this._tokenExpired$.next(), 0);
  }
}
