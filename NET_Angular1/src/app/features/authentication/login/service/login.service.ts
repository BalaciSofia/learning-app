import { HttpClient } from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Observable,
  tap,
} from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { AutoLogoutService } from '../../../../core/services/auto-logout.service';
import type { LoginRequest } from '../models/login-request.model';
import type { LoginResponse } from '../models/login-response.model';
import { Endpoints } from '../../../../shared/utils/endpoints';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);

  private readonly authService =
    inject(AuthService);

  private readonly autoLogoutService =
    inject(AutoLogoutService);

  private readonly loginUrl =
  `${environment.authApiUrl}/api${Endpoints.LoginRoute}`;

  login(
    request: LoginRequest,
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        this.loginUrl,
        request,
      )
      .pipe(
        tap(({ accessToken }) => {
          this.authService.setToken(accessToken);
          this.autoLogoutService.schedule(accessToken);
        }),
      );
  }
}