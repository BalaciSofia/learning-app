import {Component, inject, signal } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators,} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { RoutePaths } from '../../../../app.routes';
import { CourseCreateRequest } from '../../models/course.model';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-course-create',
  imports: [ReactiveFormsModule],
  templateUrl: './course-create.component.html',
  styleUrl: './course-create.component.scss',
})
export class CourseCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly courseService = inject(CourseService);
  private readonly router = inject(Router);

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly courseForm =
    this.fb.nonNullable.group({
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(200),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(2000),
        ],
      ],
      subject: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
        ],
      ],
      metadata: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
    });

  protected onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    const formValue = this.courseForm.getRawValue();

    const request: CourseCreateRequest = {
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      subject: formValue.subject.trim(),
      metadata: formValue.metadata.trim(),
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.courseService
      .createCourse(request)
      .pipe(
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          void this.router.navigate([
            `/${RoutePaths.courses}`,
          ]);
        },
        error: () => {
          this.errorMessage.set(
            'Could not create the course. Please try again.'
          );
        },
      });
  }

  protected onCancel(): void {
    void this.router.navigate([
      `/${RoutePaths.courses}`,
    ]);
  }
}