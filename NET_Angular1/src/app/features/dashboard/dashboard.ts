import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../authentication/login/models/user-role.model';
import { RoutePaths } from '../../app.routes';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [RouterLink, HasRoleDirective],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss'
})
export class DashboardComponent {
    protected readonly UserRole = UserRole;

    protected readonly testingRoute = `/${RoutePaths.testing}`;
    protected readonly coursesRoute = `/${RoutePaths.courses}`;
    protected readonly adminRoute = `/${RoutePaths.admin}`;
    protected readonly battlesRoute = `/${RoutePaths.battles}`;

    private readonly authService = inject(AuthService);

    protected readonly currentUser = computed(() => this.authService.getCurrentUser());
    protected readonly initials = computed(() => {
        const name = this.currentUser()?.name ?? '';
        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join('');
    });
}
