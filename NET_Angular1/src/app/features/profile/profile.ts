import { Component, inject , signal} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from './services/profile.service';
import { LogoutService } from '../authentication/logout/logout.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { ProfilePanelService } from '../../core/services/profile-panel.service';
import { RoutePaths } from '../../app.routes';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
    selector: 'app-profile-panel',
    imports: [RouterLink, ConfirmDialogComponent],
    templateUrl: './profile.html',
    styleUrl: './profile.scss',
})
export class ProfileComponent {
    protected readonly changePasswordRoute = `/${RoutePaths.changePassword}`;

    protected readonly profilePanelService = inject(ProfilePanelService);
    private readonly notificationService = inject(NotificationService)
    private readonly profileService = inject(ProfileService);
    private readonly logoutService = inject(LogoutService);
    private readonly router = inject(Router);

   protected readonly userIdToDelete = signal<number | null>(null);

    onDeleteAccount(userId: number): void {
        this.userIdToDelete.set(userId);
    }

    confirmDeleteAccount(): void {
        const userId = this.userIdToDelete();
        if (!userId) return;

        this.userIdToDelete.set(null);

        this.profileService.deleteAccount(userId).subscribe({
            next: () => {
                this.profilePanelService.close();
                this.logoutService.logout();
                this.router.navigate(['/login']);
                this.notificationService.show('Account deleted successfully.', 'info');
            },
            error: (err) => {
                console.error('Failed to delete account:', err);
                this.notificationService.show('An error occurred while deleting your account. Please try again.', 'error');
            }
        });
    }
    cancelDeleteAccount(): void {
        this.userIdToDelete.set(null);
    }

}
