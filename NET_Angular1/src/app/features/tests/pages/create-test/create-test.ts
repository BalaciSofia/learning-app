import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TestsService } from '../../services/tests.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RoutePaths } from '../../../../app.routes';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-test',
  imports: [ReactiveFormsModule],
  templateUrl: './create-test.html',
  styleUrl: './create-test.scss',
})
export class CreateTestComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly isSubmitting = signal(false);
  private readonly testsService = inject(TestsService);
  private readonly notificationService = inject(NotificationService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  protected readonly createTestForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    isRetakeAllowed: [false],
  });

  protected onSubmit(): void {
    if (this.createTestForm.invalid) {
      this.createTestForm.markAllAsTouched();
      return;
    }

    const { title, description, isRetakeAllowed } = this.createTestForm.getRawValue();

    this.isSubmitting.set(true);

    this.testsService.createTest({ title, description: description.trim() || null, isRetakeAllowed })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.notificationService.show('Test created successfully.', 'success');
          void this.router.navigate([`/${RoutePaths.testing}/${response.id}/questions`]);
        },
        error: () => this.notificationService.show('Could not create the test.', 'error'),
      });
  }

  protected onCancel(): void {
    // TODO: point back to the teacher's test list page once it exists
    this.location.back();
  }
}
