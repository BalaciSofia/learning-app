import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppNavbarComponent } from './core/layouts/app-navbar/app-navbar';
import { AuthService } from './core/services/auth.service';
import { AutoLogoutService } from './core/services/auto-logout.service';
import { NotificationService } from './core/services/notification.service';
import { NotificationComponent } from './shared/components/notification/notification';
import { ProfileComponent } from './features/profile/profile';
import { RoutePaths } from './app.routes';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NotificationComponent, AppNavbarComponent, ProfileComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly autoLogoutService = inject(AutoLogoutService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    this.autoLogoutService.tokenExpired$.subscribe(() => {
      this.authService.clearToken();
      this.notificationService.show('Your session has expired. Please log in again.', 'auth');
      void this.router.navigate([RoutePaths.login]);
    });
  }
}
