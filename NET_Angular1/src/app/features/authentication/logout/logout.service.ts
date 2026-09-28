import {
  inject,
  Injectable,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { AutoLogoutService } from '../../../core/services/auto-logout.service';
import { Endpoints } from '../../../shared/utils/endpoints';
import { ProfilePanelService } from '../../../core/services/profile-panel.service';


@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  private readonly http = inject(HttpClient);
  private readonly authService =
    inject(AuthService);
  private readonly profilePanelService = inject(ProfilePanelService);
  private readonly autoLogoutService =
    inject(AutoLogoutService);

  private readonly logoutUrl =
    `${environment.apiUrl}/api${Endpoints.LogoutRoute}`;

  logout(): void {
    // Fire-and-forget: invalidate token on server; always clear locally
    this.http.post<void>(this.logoutUrl, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    this.autoLogoutService.cancel();
    this.profilePanelService.reset();
    this.authService.clearToken();
  }
}