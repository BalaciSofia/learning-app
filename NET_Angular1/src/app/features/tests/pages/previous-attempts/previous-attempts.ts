import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { RoutePaths } from '../../../../app.routes';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { AttemptSummaryResponse } from '../../models/test-attempt.model';
import { TestsService } from '../../services/tests.service';
import { calculateScorePercentage } from '../../../../shared/utils/score-percentage';

@Component({
    selector: 'app-previous-attempts',
    imports: [DatePipe, LoadingSpinnerComponent],
    templateUrl: './previous-attempts.html',
    styleUrl: './previous-attempts.scss',
})
export class PreviousAttemptsComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly testsService = inject(TestsService);
    private readonly notificationService = inject(NotificationService);

    private readonly testId = Number(this.route.snapshot.paramMap.get('testId'));

    protected readonly attempts = signal<AttemptSummaryResponse[]>([]);

    protected readonly submittedAttempts = computed(() =>
        this.attempts().filter(attempt => attempt.submittedAt !== null)
    );

    protected readonly isLoading = signal(true);

    ngOnInit(): void {
        if (!Number.isInteger(this.testId) || this.testId <= 0) {
            this.notificationService.show('Invalid test selected.', 'error');
            void this.router.navigate([RoutePaths.testing]);
            return;
        }

        this.testsService.getAttempts(this.testId)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (attempts) => {
                    this.attempts.set(attempts);
                },
                error: () => {
                    this.notificationService.show('Could not load previous attempts.', 'error');
                    void this.router.navigate([RoutePaths.testing]);
                },
            });
    }

    protected getPercentage(attempt: AttemptSummaryResponse): number {
        return calculateScorePercentage(attempt.score, attempt.maxScore);
    }

    protected goBackToTests(): void {
        void this.router.navigate([RoutePaths.testing]);
    }

    protected viewResult(attemptId: number): void {
        void this.router.navigate([
            RoutePaths.testing,
            this.testId,
            'attempts',
            attemptId,
            'result',
        ]);
    }
}