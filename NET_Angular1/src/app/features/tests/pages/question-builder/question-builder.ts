import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { QuestionsService } from '../../services/questions.service';
import { DistractorService } from '../../services/distractor.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RoutePaths } from '../../../../app.routes';
import { QuestionType } from '../../models/question-type.model';

type AnswerMode = 'manual' | 'ai';

@Component({
    selector: 'app-question-builder',
    imports: [ReactiveFormsModule],
    templateUrl: './question-builder.html',
    styleUrl: './question-builder.scss',
})
export class QuestionBuilderComponent {
    protected readonly QuestionType = QuestionType;
    protected readonly maxAnswers = 6;

    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly location = inject(Location);
    private readonly router = inject(Router);
    private readonly questionsService = inject(QuestionsService);
    private readonly distractorService = inject(DistractorService);
    private readonly notificationService = inject(NotificationService);

    private readonly testId = Number(this.route.snapshot.paramMap.get('testId'));
    protected readonly isSubmitting = signal(false);
    protected readonly answerMode = signal<AnswerMode>('manual');
    protected readonly isGenerating = signal(false);

    protected readonly correctAnswerControl = this.fb.nonNullable.control('', Validators.required);

    protected readonly questionForm = this.fb.nonNullable.group({
        text: ['', Validators.required],
        type: ['', Validators.required],
        answers: this.fb.array([this.createAnswerGroup(), this.createAnswerGroup()]),
    }, {
        validators: this.answerCountMatchesTypeValidator,
    });

    protected get answers() {
        return this.questionForm.controls.answers;
    }

    private createAnswerGroup() {
        return this.fb.nonNullable.group({
            text: ['', Validators.required],
            isCorrect: [false],
        });
    }

    protected addAnswer(): void {
        if (this.answers.length >= this.maxAnswers) {
            return;
        }

        this.answers.push(this.createAnswerGroup());
    }

    protected removeAnswer(index: number): void {
        if (this.answers.length > 2) {
            this.answers.removeAt(index);
        }
    }

    protected setAnswerMode(mode: AnswerMode): void {
        this.answerMode.set(mode);

        if (mode === 'ai') {
            this.answers.clear();
            this.questionForm.controls.type.setValue(QuestionType.Single);
        } else if (this.answers.length === 0) {
            this.addAnswer();
            this.addAnswer();
        }
    }

    protected generateDistractors(): void {
        if (this.questionForm.controls.text.invalid || this.correctAnswerControl.invalid) {
            this.questionForm.controls.text.markAsTouched();
            this.correctAnswerControl.markAsTouched();
            return;
        }

        this.isGenerating.set(true);

        this.distractorService.generateDistractors({
            questionText: this.questionForm.controls.text.value,
            correctAnswer: this.correctAnswerControl.value,
        })
            .pipe(finalize(() => this.isGenerating.set(false)))
            .subscribe({
                next: (response) => {
                    this.answers.clear();
                    this.answers.push(this.createAnswerGroup());
                    this.answers.at(0).setValue({ text: this.correctAnswerControl.value, isCorrect: true });

                    for (const distractor of response.distractors) {
                        const group = this.createAnswerGroup();
                        group.setValue({ text: distractor, isCorrect: false });
                        this.answers.push(group);
                    }

                    this.notificationService.show('Answers generated successfully.', 'success');
                },
                error: (err: HttpErrorResponse) => {
                    if (err.status === 429) {
                        this.notificationService.show('Too many requests. Please try again shortly.', 'error');
                    } else if (err.status === 504) {
                        this.notificationService.show('Generation timed out. Please try again.', 'error');
                    } else {
                        this.notificationService.show('Could not generate answers.', 'error');
                    }
                },
            });
    }

    private answerCountMatchesTypeValidator(group: AbstractControl): ValidationErrors | null {
        const type = group.get('type')?.value;
        const answers = group.get('answers')?.value as { isCorrect: boolean }[] | undefined;

        if (!type || !answers) {
            return null;
        }

        const correctCount = answers.filter(answer => answer.isCorrect).length;

        if (type === QuestionType.Single && correctCount !== 1) {
            return { singleChoiceRequiresOneCorrectAnswer: true };
        }

        if (type === QuestionType.Multiple && correctCount < 1) {
            return { multipleChoiceRequiresAtLeastOneCorrectAnswer: true };
        }

        return null;
    }

    protected onSubmit(): void {
        if (this.questionForm.invalid) {
            this.questionForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);

        const formValue = this.questionForm.getRawValue();

        this.questionsService.addQuestion(this.testId, { ...formValue, type: formValue.type as QuestionType })
            .pipe(finalize(() => this.isSubmitting.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.show('Question added successfully.', 'success');
                    this.answers.clear();
                    this.questionForm.reset({ text: '', type: '' });
                    this.correctAnswerControl.reset('');
                    this.answerMode.set('manual');
                },
                error: () => this.notificationService.show('Could not add the question.', 'error'),
            });
    }

    protected onCancel(): void {
        this.location.back();
    }

    protected onFinish(): void {
        void this.router.navigate([`/${RoutePaths.testing}/${this.testId}`]);
    }
}
