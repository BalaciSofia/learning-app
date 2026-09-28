import { Component, inject, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LogoutService } from '../../../features/authentication/logout/logout.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info',
  standalone: true,
  templateUrl: './user-info.component.html',
  styleUrl: 'user-info.component.scss'
})
export class UserInfoComponent {
  private readonly authService =
    inject(AuthService);

  private readonly logoutService =
    inject(LogoutService);

  private readonly router =
    inject(Router);

  readonly currentUser = computed(
    () => this.authService.getCurrentUser(),
  );

  logout(): void {
    this.logoutService.logout();
    void this.router.navigate(['/login']);
  }
}