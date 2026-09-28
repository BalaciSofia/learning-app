import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfilePanelService } from '../../services/profile-panel.service';
import { UserRole } from '../../../features/authentication/login/models/user-role.model';
import { UserInfoComponent } from '../user-info/user-info.component';
import { RoutePaths } from '../../../app.routes';

type NavigationItem = {
  label: string;
  route?: string;
  action?: () => void;
  roles: UserRole[];
};

@Component({
  selector: 'app-navbar',
  imports: [UserInfoComponent, RouterLink, RouterLinkActive],
  templateUrl: './app-navbar.html',
  styleUrl: './app-navbar.scss',
})
export class AppNavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly profilePanelService = inject(ProfilePanelService);

  protected readonly menuOpen = signal(false);

  private readonly allNavigationItems: NavigationItem[] = [
    {
      label: 'Home',
      route: `/${RoutePaths.dashboard}`,
      roles: [UserRole.Student, UserRole.Teacher, UserRole.Admin],
    },
    {
      label: 'Tests',
      route: `/${RoutePaths.testing}`,
      roles: [UserRole.Student, UserRole.Teacher, UserRole.Admin],
    },
    {
      label: 'Battles',
      route: `/${RoutePaths.battles}`,
      roles: [UserRole.Student],
    },
    {
      label: 'Courses',
      route: `/${RoutePaths.courses}`,
      roles: [UserRole.Student, UserRole.Teacher, UserRole.Admin],
    },
    {
      label: 'My Profile',
      action: () => this.profilePanelService.toggle(),
      roles: [UserRole.Student, UserRole.Teacher, UserRole.Admin],
    },
    {
      label: 'User Management',
      route: `/${RoutePaths.admin}`,
      roles: [UserRole.Admin],
    },
  ];

  protected readonly currentUser = computed(() =>
    this.authService.getCurrentUser()
  );

  protected readonly navigationItems = computed(() => {
    const user = this.currentUser();

    if (!user) {
      return [];
    }

    return this.allNavigationItems.filter(item =>
      item.roles.includes(user.role)
    );
  });

  protected toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected handleAction(action?: () => void): void {
    if (action) {
      action();
    }
    this.closeMenu();
  }
}