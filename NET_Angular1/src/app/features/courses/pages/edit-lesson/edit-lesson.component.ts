import { Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { finalize } from 'rxjs';

import { LessonFormComponent } from '../lesson-form/lesson-form.component';
import { LessonService } from '../../services/lesson-service';
import {
  LessonCreate,
  LessonResponse,
  LessonType
} from '../../models/course.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { TestsService } from '../../../tests/services/tests.service';
import { TestSummary } from '../../../tests/models/test-summary.model';

@Component({
  selector: 'app-edit-lesson',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LessonFormComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './edit-lesson.component.html',
  styleUrl: './edit-lesson.component.scss'
})
export class EditLessonComponent {

  private readonly fb = inject(FormBuilder);
  private readonly lessonService = inject(LessonService);
  private readonly testsService = inject(TestsService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly lessonTypes = Object.values(LessonType);

  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly tests = signal<TestSummary[]>([]);

  private lessonId = 0;

  protected readonly lessonForm = this.fb.group({

    title: ['', Validators.required],

    description: ['', Validators.required],

    duration: [0, [Validators.required, Validators.min(1)]],

    type: [LessonType.Video as LessonType, Validators.required],

    content: this.fb.group({

      videoUrl: [''],

      bodyText: [''],

      quizId: [null as number | null]

    })

  });

  constructor() {

    this.lessonId = Number(
      this.route.snapshot.paramMap.get('lessonId')
    );

    if (!this.lessonId) {
      this.errorMessage.set('Invalid lesson id.');
      this.isLoading.set(false);
      return;
    }

    this.loadLesson();
    this.loadTests();
  }

  private loadTests(): void {
    this.testsService.getTests().subscribe({
      next: tests => this.tests.set(tests),
      error: err => console.error('Failed to load tests for quiz selection:', err),
    });
  }

  private loadLesson(): void {

    this.lessonService
      .getLessonById(this.lessonId)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({

        next: lesson => this.populateForm(lesson),

        error: err => {

          console.error(err);

          this.errorMessage.set(
            'Failed to load lesson.'
          );

        }

      });

  }

  private populateForm(
    lesson: LessonResponse
  ): void {

    this.lessonForm.patchValue({

      title: lesson.title,

      description: lesson.description,

      duration: lesson.duration,

      type: lesson.type,

      content: {

        videoUrl: lesson.content.videoUrl,

        bodyText: lesson.content.bodyText,

        quizId: lesson.content.quizId

      }

    });

  }

  protected onSubmit(): void {

    if (this.lessonForm.invalid) {

      this.lessonForm.markAllAsTouched();

      return;
    }

    this.isSaving.set(true);

    const payload =
      this.lessonForm.getRawValue() as LessonCreate;

    this.lessonService
      .updateLesson(this.lessonId, payload)
      .pipe(
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({

        next: () => {

            this.location.back();

        },

        error: err => {

          console.error(err);

          this.errorMessage.set(
            'Failed to update lesson.'
          );

        }

      });

  }

  protected goBack(): void {

    this.location.back();

  }

}