import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TestSummaryCardComponent } from '../../components/test-summary-card/test-summary-card';
import { TeacherTestSummaryCardComponent } from '../../components/teacher-test-summary-card/teacher-test-summary-card';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { TestsService } from '../../services/tests.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TestSummary } from '../../models/test-summary.model';
import { UserRole } from '../../../authentication/login/models/user-role.model';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { RoutePaths } from '../../../../app.routes';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tests-list',
  imports: [TestSummaryCardComponent, TeacherTestSummaryCardComponent, LoadingSpinnerComponent, RouterLink, HasRoleDirective],
  templateUrl: './tests-list.html',
  styleUrl: './tests-list.scss',
})
export class TestsListComponent {
  protected readonly createTestRoute = `/${RoutePaths.testing}/create`;
  protected readonly UserRole = UserRole;

  private readonly testsService = inject(TestsService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly tests = signal<TestSummary[]>([]);
  protected readonly isLoading = signal(true);

  constructor() {
    this.testsService.getTests()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (tests) => this.tests.set(tests),
        error: () => this.notificationService.show('Could not load tests.', 'error'),
      });
  }

  protected onTakeTest(testId: number): void {
    void this.router.navigate([RoutePaths.testing, testId, 'take']);
  }

  protected onViewAttempts(testId: number): void {
    void this.router.navigate([RoutePaths.testing, testId, 'attempts']);
  }
}
