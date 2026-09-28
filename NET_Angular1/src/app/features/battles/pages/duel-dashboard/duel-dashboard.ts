import { Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, forkJoin, Observable, of, switchMap, timer } from 'rxjs';
import { DuelService } from '../../services/duel.service';
import { DuelInvitationResponse, DuelHistoryResponse } from '../../models/duel.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { AuthService } from '../../../../core/services/auth.service';
import { RoutePaths } from '../../../../app.routes';

@Component({
  selector: 'app-duel-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './duel-dashboard.html',
  styleUrl: './duel-dashboard.scss',
})
export class DuelDashboardComponent implements OnInit {
  private readonly duelService = inject(DuelService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly invitations = signal<DuelInvitationResponse[]>([]);
  protected readonly activeDuels = signal<DuelInvitationResponse[]>([]);
  protected readonly history = signal<DuelHistoryResponse[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly actionInProgress = signal<number | null>(null);
  protected readonly currentUserId = computed(() => this.authService.getCurrentUser()?.id);

  ngOnInit(): void {
    // Initial fetch with spinner
    this.loadData(true);

    // Background polling every 5 seconds while on the dashboard
    timer(5000, 5000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.fetchDashboardDataSilently())
      )
      .subscribe({
        next: (data) => this.updateDashboardState(data)
      });
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    this.loadData(false);
  }

  protected loadData(showSpinner = false): void {
    if (showSpinner) {
      this.isLoading.set(true);
    }

    this.fetchDashboardDataSilently()
      .pipe(
        finalize(() => {
          if (showSpinner) {
            this.isLoading.set(false);
          }
        })
      )
      .subscribe({
        next: (data) => this.updateDashboardState(data),
        error: () => {
          if (showSpinner) {
            this.notificationService.show('Failed to load battle dashboard data.', 'error');
          }
        }
      });
  }

  private updateDashboardState(data: {
    invitations: DuelInvitationResponse[];
    activeDuels: DuelInvitationResponse[];
    history: DuelHistoryResponse[];
  }): void {
    this.invitations.set(data.invitations);
    this.activeDuels.set(data.activeDuels);
    this.history.set(data.history);
  }

  private fetchDashboardDataSilently(): Observable<{
    invitations: DuelInvitationResponse[];
    activeDuels: DuelInvitationResponse[];
    history: DuelHistoryResponse[];
  }> {
    return forkJoin({
      invitations: this.duelService.getIncomingInvitations().pipe(catchError(() => of(this.invitations()))),
      activeDuels: this.duelService.getActiveDuels().pipe(catchError(() => of(this.activeDuels()))),
      history: this.duelService.getDuelHistory().pipe(catchError(() => of(this.history())))
    });
  }

  protected acceptInvitation(invitation: DuelInvitationResponse): void {
    this.actionInProgress.set(invitation.id);
    this.duelService.acceptInvitation(invitation.id)
      .pipe(finalize(() => this.actionInProgress.set(null)))
      .subscribe({
        next: () => {
          this.notificationService.show('Invitation accepted! Starting battle...', 'success');
          void this.router.navigate(['/', RoutePaths.battles, 'take', invitation.id, invitation.testId]);
        },
        error: (err) => {
          const msg = typeof err.error === 'string' ? err.error : 'Failed to accept invitation.';
          this.notificationService.show(msg, 'error');
        }
      });
  }

  protected rejectInvitation(invitationId: number): void {
    this.actionInProgress.set(invitationId);
    this.duelService.rejectInvitation(invitationId)
      .pipe(finalize(() => this.actionInProgress.set(null)))
      .subscribe({
        next: () => {
          this.notificationService.show('Invitation rejected.', 'info');
          this.invitations.update(list => list.filter(i => i.id !== invitationId));
        },
        error: () => {
          this.notificationService.show('Failed to reject invitation.', 'error');
        }
      });
  }

  protected playDuel(duel: DuelInvitationResponse): void {
    void this.router.navigate(['/', RoutePaths.battles, 'take', duel.id, duel.testId]);
  }

  protected getOpponentName(duel: DuelInvitationResponse): string {
    const userId = this.currentUserId();
    if (duel.challengerId === userId) {
      return duel.challengedName || 'Opponent';
    }
    return duel.challengerName || 'Opponent';
  }

  protected hasUserPlayed(duel: DuelInvitationResponse): boolean {
    const userId = this.currentUserId();
    if (duel.challengerId === userId) {
      return duel.challengerScore !== null && duel.challengerScore !== undefined;
    }
    if (duel.challengedId === userId) {
      return duel.challengedScore !== null && duel.challengedScore !== undefined;
    }
    return false;
  }

  protected goToChallenge(): void {
    void this.router.navigate(['/', RoutePaths.battles, 'challenge']);
  }
}
