import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ProfileService } from '../../features/profile/services/profile.service';
import { UserProfile } from '../../features/profile/models/user-profile.model';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root',
})
export class ProfilePanelService {
    private readonly profileService = inject(ProfileService);
    private readonly notificationService = inject(NotificationService);

    readonly isOpen = signal(false);
    readonly isLoading = signal(false);
    readonly profile = signal<UserProfile | null>(null);

    private hasLoaded = false;

    open(): void {
        this.isOpen.set(true);

        if (!this.hasLoaded) {
            this.hasLoaded = true;
            this.loadProfile();
        }
    }

    close(): void {
        this.isOpen.set(false);
    }

    toggle(): void {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }

    reset(): void {
        this.hasLoaded = false;
        this.profile.set(null);
        this.isOpen.set(false);
    }

    private loadProfile(): void {
        this.isLoading.set(true);

        this.profileService.getCurrentUserProfile()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (profile: UserProfile) => this.profile.set(profile),
                error: () => this.notificationService.show('Could not load your profile.', 'error'),
            });
    }
}
