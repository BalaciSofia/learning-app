import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { AttemptDetailsResponse } from '../../models/test-attempt.model';
import { TestsService } from '../../services/tests.service';

import { RoutePaths } from '../../../../app.routes';
import { calculateScorePercentage } from '../../../../shared/utils/score-percentage';

@Component({
    selector: 'app-test-result',
    imports: [LoadingSpinnerComponent],
    templateUrl: './test-result.html',
    styleUrl: './test-result.scss',
})
export class TestResultComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly testsService = inject(TestsService);
    private readonly notificationService = inject(NotificationService);

    private readonly testId = Number(this.route.snapshot.paramMap.get('testId'));
    private readonly attemptId = Number(this.route.snapshot.paramMap.get('attemptId'));

    protected readonly result = signal<AttemptDetailsResponse | null>(null);
    protected readonly isLoading = signal(true);

    protected readonly percentage = computed(() => {
        const result = this.result();

        if (result === null) {
            return 0;
        }

        return calculateScorePercentage(result.score, result.maxScore);
    });

    //TODO: Replace hardcoded threshold with passingScore
    protected readonly isPassed = computed(() =>
        this.percentage() >= 50
    );

    ngOnInit(): void {
        if (
            !Number.isInteger(this.testId) ||
            this.testId <= 0 ||
            !Number.isInteger(this.attemptId) ||
            this.attemptId <= 0
        ) {
            this.notificationService.show('Invalid result selected.', 'error');
            void this.router.navigate([RoutePaths.testing]);
            return;
        }

        this.testsService.getAttemptDetails(this.testId, this.attemptId)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (attempt) => {
                    this.result.set(attempt);
                },
                error: () => {
                    this.notificationService.show('Could not load test result.', 'error');
                    void this.router.navigate([RoutePaths.testing]);
                },
            });
    }

    protected goBackToTests(): void {
        void this.router.navigate([RoutePaths.testing]);
    }

    protected viewPreviousAttempts(): void {
        void this.router.navigate([
            RoutePaths.testing,
            this.testId,
            'attempts',
        ]);
    }

    protected viewQuestionReview(): void {
        void this.router.navigate([
            RoutePaths.testing,
            this.testId,
            'attempts',
            this.attemptId,
            'review',
        ]);
    }
}