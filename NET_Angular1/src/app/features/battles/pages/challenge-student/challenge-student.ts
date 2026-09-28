import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { DuelService } from '../../services/duel.service';
import { TestsService } from '../../../tests/services/tests.service';
import { StudentSummaryResponse } from '../../models/duel.model';
import { TestSummary } from '../../../tests/models/test-summary.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { RoutePaths } from '../../../../app.routes';

@Component({
  selector: 'app-challenge-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './challenge-student.html',
  styleUrl: './challenge-student.scss',
})
export class ChallengeStudentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly duelService = inject(DuelService);
  private readonly testsService = inject(TestsService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected readonly students = signal<StudentSummaryResponse[]>([]);
  protected readonly tests = signal<TestSummary[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSending = signal(false);

  protected readonly form = this.fb.group({
    studentId: [null as number | null, [Validators.required]],
    testId: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    forkJoin({
      students: this.duelService.getChallengableStudents(),
      tests: this.testsService.getTests()
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.students.set(data.students);
          this.tests.set(data.tests);
        },
        error: (err) => {
          const msg = typeof err.error === 'string' ? err.error : 'Failed to load options for challenge.';
          this.notificationService.show(msg, 'error');
        }
      });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { studentId, testId } = this.form.getRawValue();
    if (!studentId || !testId) {
      this.notificationService.show('Please select both a student and a test.', 'error');
      return;
    }

    this.isSending.set(true);

    this.duelService.sendInvitation({
      challengedStudentId: studentId,
      testId: testId
    })
      .pipe(finalize(() => this.isSending.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.show('Duel invitation sent successfully!', 'success');
          void this.router.navigate(['/', RoutePaths.battles]);
        },
        error: (err) => {
          const msg = typeof err.error === 'string' ? err.error : 'Failed to send invitation.';
          this.notificationService.show(msg, 'error');
        }
      });
  }

  protected goBack(): void {
    void this.router.navigate(['/', RoutePaths.battles]);
  }
}
