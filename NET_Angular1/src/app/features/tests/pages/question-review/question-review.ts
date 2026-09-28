import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { RoutePaths } from '../../../../app.routes';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { AttemptAnswerResponse, AttemptDetailsResponse } from '../../models/test-attempt.model';
import { TestsService } from '../../services/tests.service';

// TODO: Replace hardcoded question score once backend exposes max points per question
const FULL_QUESTION_SCORE = 1;

interface QuestionReviewItem {
    readonly questionId: number;
    readonly questionText: string;
    readonly selectedAnswers: AttemptAnswerResponse[];
    readonly correctAnswerText: string | null;
    readonly pointsAwarded: number;
    readonly isCorrect: boolean;
}

@Component({
    selector: 'app-question-review',
    imports: [LoadingSpinnerComponent],
    templateUrl: './question-review.html',
    styleUrl: './question-review.scss',
})
export class QuestionReviewComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly testsService = inject(TestsService);
    private readonly notificationService = inject(NotificationService);

    private readonly testId = Number(this.route.snapshot.paramMap.get('testId'));
    private readonly attemptId = Number(this.route.snapshot.paramMap.get('attemptId'));

    protected readonly attempt = signal<AttemptDetailsResponse | null>(null);
    protected readonly isLoading = signal(true);

    protected readonly questionReviews = computed<QuestionReviewItem[]>(() => {
        const attempt = this.attempt();

        if (attempt === null) {
            return [];
        }

        const reviewMap = new Map<number, QuestionReviewItem>();

        for (const answer of attempt.answers) {
            const existingReview = reviewMap.get(answer.questionId);

            if (existingReview) {
                const pointsAwarded = existingReview.pointsAwarded + answer.pointsAwarded;

                reviewMap.set(answer.questionId, {
                    ...existingReview,
                    selectedAnswers: [...existingReview.selectedAnswers, answer],
                    pointsAwarded,
                    isCorrect: pointsAwarded >= FULL_QUESTION_SCORE,
                });

                continue;
            }

            reviewMap.set(answer.questionId, {
                questionId: answer.questionId,
                questionText: answer.questionText,
                selectedAnswers: [answer],
                correctAnswerText: answer.correctAnswerText,
                pointsAwarded: answer.pointsAwarded,
                isCorrect: answer.pointsAwarded >= FULL_QUESTION_SCORE,
            });
        }

        return Array.from(reviewMap.values());
    });

    ngOnInit(): void {
        if (
            !Number.isInteger(this.testId) ||
            this.testId <= 0 ||
            !Number.isInteger(this.attemptId) ||
            this.attemptId <= 0
        ) {
            this.notificationService.show('Invalid attempt selected.', 'error');
            void this.router.navigate([RoutePaths.testing]);
            return;
        }

        this.testsService.getAttemptDetails(this.testId, this.attemptId)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (attempt) => {
                    this.attempt.set(attempt);
                },
                error: () => {
                    this.notificationService.show('Could not load question review.', 'error');
                    void this.router.navigate([RoutePaths.testing]);
                },
            });
    }

    protected goBackToResult(): void {
        void this.router.navigate([
            RoutePaths.testing,
            this.testId,
            'attempts',
            this.attemptId,
            'result',
        ]);
    }

    protected goBackToAttempts(): void {
        void this.router.navigate([
            RoutePaths.testing,
            this.testId,
            'attempts',
        ]);
    }
}