import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, switchMap } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { StudentTest } from '../../models/student-test.model';
import { StartAttemptResponse } from '../../models/test-attempt.model';
import { TestsService } from '../../services/tests.service';

import { RoutePaths } from '../../../../app.routes';
import { QuestionType } from '../../models/question-type.model';

@Component({
    selector: 'app-take-test',
    imports: [LoadingSpinnerComponent],
    templateUrl: './take-test.html',
    styleUrl: './take-test.scss',
})
export class TakeTestComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly testsService = inject(TestsService);
    private readonly notificationService = inject(NotificationService);

    protected readonly test = signal<StudentTest | null>(null);
    protected readonly attempt = signal<StartAttemptResponse | null>(null);
    protected readonly isLoading = signal(true);
    protected readonly currentQuestionIndex = signal(0);

    protected readonly selectedAnswerIds = signal<number[]>([]);
    protected readonly isSaving = signal(false);

    protected readonly currentQuestion = computed(() => {
        const test = this.test();

        if (test === null) {
            return null;
        }

        return test.questions[this.currentQuestionIndex()] ?? null;
    });

    protected readonly currentQuestionNumber = computed(() =>
        this.currentQuestionIndex() + 1
    );

    protected readonly totalQuestions = computed(() =>
        this.test()?.questions.length ?? 0
    );

    protected readonly isLastQuestion = computed(() =>
        this.currentQuestionIndex() === this.totalQuestions() - 1
    );

    ngOnInit(): void {
        const testId = Number(this.route.snapshot.paramMap.get('testId'));

        if (!Number.isInteger(testId) || testId <= 0) {
            this.notificationService.show('Invalid test selected.', 'error');
            void this.router.navigate([RoutePaths.testing]);
            return;
        }

        this.testsService.getStudentTestById(testId)
            .pipe(
                switchMap((test) => {
                    this.test.set(test);
                    return this.testsService.startAttempt(test.id);
                }),
                finalize(() => this.isLoading.set(false))
            )
            .subscribe({
                next: (attempt) => {
                    this.attempt.set(attempt);
                },
                error: () => {
                    this.notificationService.show('Could not open test.', 'error');
                    void this.router.navigate([RoutePaths.testing]);
                },
            });
    }

    protected goBackToTests(): void {
        void this.router.navigate([RoutePaths.testing]);
    }

    protected isAnswerSelected(answerId: number): boolean {
        return this.selectedAnswerIds().includes(answerId);
    }

    protected isMultipleChoice(questionType: QuestionType): boolean {
        return questionType === QuestionType.Multiple;
    }

    protected selectAnswer(questionType: QuestionType, answerId: number): void {
        if (this.isSaving()) {
            return;
        }

        if (!this.isMultipleChoice(questionType)) {
            this.selectedAnswerIds.set([answerId]);
            return;
        }

        this.selectedAnswerIds.update((selectedIds) => {
            if (selectedIds.includes(answerId)) {
                return selectedIds.filter(id => id !== answerId);
            }

            return [...selectedIds, answerId];
        });
    }

    protected onNext(): void {
        const test = this.test();
        const attempt = this.attempt();
        const selectedAnswerIds = this.selectedAnswerIds();

        if(test === null || attempt === null) {
            return;
        }

        if(selectedAnswerIds.length === 0) {
            this.notificationService.show('Please select an answer.', 'error');
            return;
        }

        this.isSaving.set(true);

        const saveRequests = selectedAnswerIds.map(answerId =>
            this.testsService.submitAnswer(test.id, attempt.attemptId, answerId)
        );

        forkJoin(saveRequests)
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
                next: () => {
                    if(this.isLastQuestion()) {
                        this.submitTest(test.id, attempt.attemptId);
                        return;
                    }

                    this.currentQuestionIndex.update(index => index + 1);
                    this.selectedAnswerIds.set([]);
                },
                error: () => {
                    this.notificationService.show('Could not save answer.', 'error');
                },
            });
    }

    private submitTest(testId: number, attemptId: number): void {
        this.isSaving.set(true);

        this.testsService.submitAttempt(testId, attemptId)
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.show('Test submitted successfully.', 'success');

                    void this.router.navigate([
                        RoutePaths.testing,
                        testId,
                        'attempts',
                        attemptId,
                        'result',
                    ]);
                },
                error: () => {
                    this.notificationService.show('Could not submit test.', 'error');
                },
            });
    }
}