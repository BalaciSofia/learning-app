import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

import { LessonService } from '../../services/lesson-service';
import { LessonCreate, LessonType } from '../../models/course.model';
import { LessonFormComponent } from '../lesson-form/lesson-form.component';
import { TestsService } from '../../../tests/services/tests.service';
import { TestSummary } from '../../../tests/models/test-summary.model';


@Component({
    selector: 'app-add-lesson',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LessonFormComponent],
    templateUrl: './add-lesson.component.html',
    styleUrl: './add-lesson.component.scss'
})
export class AddLessonComponent implements OnInit, OnDestroy {
    private readonly fb = inject(FormBuilder);
    private readonly lessonService = inject(LessonService);
    private readonly testsService = inject(TestsService);
    private readonly route = inject(ActivatedRoute);
    private readonly location = inject(Location);
    private readonly destroy$ = new Subject<void>();

    protected readonly unitId = signal<number | null>(null);
    protected readonly isSaving = signal(false);
    protected readonly errorMessage = signal<string | null>(null);
    protected readonly tests = signal<TestSummary[]>([]);

    protected readonly lessonTypes = Object.values(LessonType);

    protected readonly lessonForm = this.fb.nonNullable.group({
        title: ['', Validators.required],
        description: ['', Validators.required],
        duration: [0, Validators.required],
        type: [LessonType.Video, Validators.required],

        content: this.fb.group({
            videoUrl: [''],
            bodyText: [''],
            quizId: [null]
        })
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('unitId');
        const id = Number(idParam);

        if (!isNaN(id) && id > 0) {
            this.unitId.set(id);
        } else {
            this.errorMessage.set('Invalid Unit ID. A lesson must be associated with a valid unit.');
        }

        this.setupDynamicContentState();

        this.testsService.getTests()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (tests) => this.tests.set(tests),
                error: (err) => console.error('Failed to load tests for quiz selection:', err),
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupDynamicContentState(): void {
        const typeControl = this.lessonForm.controls.type;

        this.updateContentFieldsState(typeControl.value);

        typeControl.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe((type) => {
                this.updateContentFieldsState(type);
            });
    }

    private updateContentFieldsState(type: LessonType): void {
        const contentGroup = this.lessonForm.controls.content;
        const { videoUrl, bodyText, quizId } = contentGroup.controls;

        videoUrl.disable();
        videoUrl.setValue(null);

        bodyText.disable();
        bodyText.setValue(null);

        quizId.disable();
        quizId.setValue(null);
        switch (type) {
            case LessonType.Video:
                videoUrl.enable();
                break;
            case LessonType.Reading:
            case LessonType.Activity:
                bodyText.enable();
                break;
            case LessonType.Quiz:
                quizId.enable();
                break;
        }
    }

    protected onSubmit(): void {
        if (this.lessonForm.invalid || !this.unitId()) {
            this.lessonForm.markAllAsTouched();
            return;
        }

        this.isSaving.set(true);
        this.errorMessage.set(null);
        const payload: LessonCreate = this.lessonForm.getRawValue();

        this.lessonService.createLesson(this.unitId()!, payload)
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
                next: () => {
                    this.goBack();
                },
                error: (err) => {
                    console.error('Error creating lesson:', err);
                    this.errorMessage.set('Failed to save the lesson. Please try again.');
                }
            });
    }

    protected goBack(): void {
        this.location.back();
    }
}