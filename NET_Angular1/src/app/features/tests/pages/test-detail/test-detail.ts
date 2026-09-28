import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { TestsService } from '../../services/tests.service';
import { QuestionsService } from '../../services/questions.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { RoutePaths } from '../../../../app.routes';
import { TestDetail } from '../../models/test-detail.model';
import { UpdateTestRequest } from '../../models/update-test-request.model';
import { QuestionResponse } from '../../models/question-response.model';
import { AnswerResponse } from '../../models/answer-response.model';
import { QuestionType } from '../../models/question-type.model';
import { UserRole } from '../../../authentication/login/models/user-role.model';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';

@Component({
    selector: 'app-test-detail',
    imports: [ReactiveFormsModule, RouterLink, ConfirmDialogComponent, HasRoleDirective],
    templateUrl: './test-detail.html',
    styleUrl: './test-detail.scss',
})
export class TestDetailComponent implements OnInit {
    protected readonly QuestionType = QuestionType;
    protected readonly UserRole = UserRole;
    protected readonly addQuestionRoute: string;
    protected readonly statisticsRoute: string;
    protected readonly testsListRoute = `/${RoutePaths.testing}`;

    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly testsService = inject(TestsService);
    private readonly questionsService = inject(QuestionsService);
    private readonly notificationService = inject(NotificationService);

    private readonly testId = Number(this.route.snapshot.paramMap.get('testId'));
    protected readonly isLoading = signal(true);
    protected readonly test = signal<TestDetail | null>(null);
    protected readonly editingQuestionId = signal<number | null>(null);
    protected readonly editingAnswerId = signal<number | null>(null);
    protected readonly isSavingQuestion = signal(false);
    protected readonly isSavingAnswer = signal(false);
    protected readonly showDeleteConfirm = signal(false);
    protected readonly isDeletingTest = signal(false);
    protected readonly editingTestDetails = signal(false);
    protected readonly isSavingTestDetails = signal(false);
    protected readonly questionToDelete = signal<QuestionResponse | null>(null);
    protected readonly isDeletingQuestion = signal(false);
    protected readonly answerToDelete = signal<{ questionId: number; answer: AnswerResponse } | null>(null);
    protected readonly isDeletingAnswer = signal(false);
    protected readonly isPublishing = signal(false);

    protected readonly deleteConfirmMessage = computed(() => {
        const loadedTest = this.test();
        return loadedTest
            ? `Are you sure you want to delete "${loadedTest.title}"? This cannot be undone.`
            : '';
    });

    protected readonly deleteQuestionConfirmMessage = computed(() => {
        const question = this.questionToDelete();
        return question
            ? `Delete "${question.text}" and all its answers? This cannot be undone.`
            : '';
    });

    protected readonly deleteAnswerConfirmMessage = computed(() => {
        const target = this.answerToDelete();
        return target ? `Delete answer "${target.answer.text}"? This cannot be undone.` : '';
    });

    protected readonly testDetailsForm = this.fb.nonNullable.group({
        title: ['', [Validators.required, Validators.maxLength(200)]],
        description: ['', [Validators.maxLength(2000)]],
        isRetakeAllowed: [false],
    });

    protected readonly questionEditForm = this.fb.nonNullable.group({
        text: ['', Validators.required],
        type: ['', Validators.required],
    });

    protected readonly answerEditForm = this.fb.nonNullable.group({
        text: ['', Validators.required],
        isCorrect: [false],
    });


    constructor() {
        this.addQuestionRoute =
            `/${RoutePaths.testing}/${this.testId}/questions`;

        this.statisticsRoute =
            `/${RoutePaths.testing}/${this.testId}/statistics`;
    }

    ngOnInit(): void {
        this.loadTest();
    }

    private loadTest(): void {
        this.isLoading.set(true);

        this.testsService.getTestById(this.testId)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (test) => this.test.set(test),
                error: () => this.notificationService.show('Could not load the test.', 'error'),
            });
    }

    protected answerLetter(index: number): string {
        return `${String.fromCharCode(97 + index)})`;
    }

    private deleteErrorMessage(err: HttpErrorResponse, fallback: string): string {
        return err.status === 409 && err.error?.detail ? err.error.detail : fallback;
    }

    protected startEditQuestion(question: QuestionResponse): void {
        this.editingAnswerId.set(null);
        this.editingQuestionId.set(question.id);
        this.questionEditForm.setValue({ text: question.text, type: question.type });
    }

    protected cancelEditQuestion(): void {
        this.editingQuestionId.set(null);
    }

    protected saveQuestion(questionId: number): void {
        if (this.questionEditForm.invalid) {
            this.questionEditForm.markAllAsTouched();
            return;
        }

        const { text, type } = this.questionEditForm.getRawValue();

        this.isSavingQuestion.set(true);

        this.questionsService.updateQuestion(this.testId, questionId, { text, type: type as QuestionType })
            .pipe(finalize(() => this.isSavingQuestion.set(false)))
            .subscribe({
                next: (updated) => {
                    this.test.update(test => test && {
                        ...test,
                        questions: test.questions.map(question =>
                            question.id === questionId ? { ...question, text: updated.text, type: updated.type } : question
                        ),
                    });
                    this.editingQuestionId.set(null);
                    this.notificationService.show('Question updated successfully.', 'success');
                },
                error: () => this.notificationService.show('Could not update the question.', 'error'),
            });
    }

    protected requestDeleteQuestion(question: QuestionResponse): void {
        this.questionToDelete.set(question);
    }

    protected cancelDeleteQuestion(): void {
        this.questionToDelete.set(null);
    }

    protected confirmDeleteQuestion(): void {
        const question = this.questionToDelete();
        if (!question) {
            return;
        }

        this.isDeletingQuestion.set(true);

        this.questionsService.deleteQuestion(this.testId, question.id)
            .pipe(finalize(() => this.isDeletingQuestion.set(false)))
            .subscribe({
                next: () => {
                    this.test.update(test => test && {
                        ...test,
                        questions: test.questions.filter(q => q.id !== question.id),
                    });
                    this.notificationService.show('Question deleted successfully.', 'success');
                    this.questionToDelete.set(null);
                },
                error: (err: HttpErrorResponse) => {
                    this.notificationService.show(this.deleteErrorMessage(err, 'Could not delete the question.'), 'error');
                    this.questionToDelete.set(null);
                },
            });
    }

    protected startEditAnswer(answer: AnswerResponse): void {
        this.editingAnswerId.set(answer.id);
        this.answerEditForm.setValue({ text: answer.text, isCorrect: answer.isCorrect });
    }

    protected cancelEditAnswer(): void {
        this.editingAnswerId.set(null);
    }

    protected saveAnswer(questionId: number, answerId: number): void {
        if (this.answerEditForm.invalid) {
            this.answerEditForm.markAllAsTouched();
            return;
        }

        const request = this.answerEditForm.getRawValue();

        this.isSavingAnswer.set(true);

        this.questionsService.updateAnswer(this.testId, questionId, answerId, request)
            .pipe(finalize(() => this.isSavingAnswer.set(false)))
            .subscribe({
                next: (updated) => {
                    this.test.update(test => test && {
                        ...test,
                        questions: test.questions.map(question =>
                            question.id === questionId
                                ? { ...question, answers: question.answers.map(answer => answer.id === answerId ? updated : answer) }
                                : question
                        ),
                    });
                    this.editingAnswerId.set(null);
                    this.notificationService.show('Answer updated successfully.', 'success');
                },
                error: () => this.notificationService.show('Could not update the answer.', 'error'),
            });
    }

    protected requestDeleteAnswer(questionId: number, answer: AnswerResponse): void {
        this.answerToDelete.set({ questionId, answer });
    }

    protected cancelDeleteAnswer(): void {
        this.answerToDelete.set(null);
    }

    protected confirmDeleteAnswer(): void {
        const target = this.answerToDelete();
        if (!target) {
            return;
        }

        const { questionId, answer } = target;

        this.isDeletingAnswer.set(true);

        this.questionsService.deleteAnswer(this.testId, questionId, answer.id)
            .pipe(finalize(() => this.isDeletingAnswer.set(false)))
            .subscribe({
                next: () => {
                    this.test.update(test => test && {
                        ...test,
                        questions: test.questions.map(question =>
                            question.id === questionId
                                ? { ...question, answers: question.answers.filter(a => a.id !== answer.id) }
                                : question
                        ),
                    });
                    this.notificationService.show('Answer deleted successfully.', 'success');
                    this.answerToDelete.set(null);
                },
                error: (err: HttpErrorResponse) => {
                    this.notificationService.show(this.deleteErrorMessage(err, 'Could not delete the answer.'), 'error');
                    this.answerToDelete.set(null);
                },
            });
    }

    protected requestDeleteTest(): void {
        this.showDeleteConfirm.set(true);
    }

    protected cancelDeleteTest(): void {
        this.showDeleteConfirm.set(false);
    }

    protected confirmDeleteTest(): void {
        this.isDeletingTest.set(true);

        this.testsService.deleteTest(this.testId)
            .pipe(finalize(() => this.isDeletingTest.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.show('Test deleted.', 'success');
                    void this.router.navigate([this.testsListRoute]);
                },
                error: () => {
                    this.notificationService.show('Could not delete the test.', 'error');
                    this.showDeleteConfirm.set(false);
                },
            });
    }

    protected startEditTestDetails(): void {
        const loadedTest = this.test();
        if (!loadedTest) {
            return;
        }

        this.testDetailsForm.setValue({
            title: loadedTest.title,
            description: loadedTest.description ?? '',
            isRetakeAllowed: loadedTest.isRetakeAllowed,
        });
        this.editingTestDetails.set(true);
    }

    protected cancelEditTestDetails(): void {
        this.editingTestDetails.set(false);
    }

    protected saveTestDetails(): void {
        if (this.testDetailsForm.invalid) {
            this.testDetailsForm.markAllAsTouched();
            return;
        }

        const loadedTest = this.test();
        if (!loadedTest) {
            return;
        }

        const { title, description, isRetakeAllowed } = this.testDetailsForm.getRawValue();
        const trimmedDescription = description.trim() || null;

        const request: UpdateTestRequest = {
            title,
            description: trimmedDescription,
            isRetakeAllowed,
            questions: loadedTest.questions,
        };

        this.isSavingTestDetails.set(true);

        this.testsService.updateTest(this.testId, request)
            .pipe(finalize(() => this.isSavingTestDetails.set(false)))
            .subscribe({
                next: () => {
                    this.test.update(current => current && {
                        ...current,
                        title,
                        description: trimmedDescription,
                        isRetakeAllowed,
                    });
                    this.editingTestDetails.set(false);
                    this.notificationService.show('Test updated successfully.', 'success');
                },
                error: () => this.notificationService.show('Could not update the test.', 'error'),
            });
    }

    protected viewAttempts(): void {
        void this.router.navigate([RoutePaths.testing, this.testId, 'attempts']);
    }

    protected publishTest(): void {
        const loadedTest = this.test();

        if (loadedTest === null || loadedTest.isPublished || this.isPublishing()) {
            return;
        }

        this.isPublishing.set(true);

        this.testsService.publishTest(loadedTest.id)
            .pipe(finalize(() => this.isPublishing.set(false)))
            .subscribe({
                next: (publishedTest) => {
                    this.test.set(publishedTest);
                    this.notificationService.show('Test published successfully.', 'success');
                },
                error: () => {
                    this.notificationService.show('Could not publish test.', 'error');
                },
            });
    }
}
