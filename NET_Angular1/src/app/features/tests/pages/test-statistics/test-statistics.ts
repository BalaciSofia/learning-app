import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { RoutePaths } from '../../../../app.routes';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { TestDetail } from '../../models/test-detail.model';
import { TestStatistics } from '../../models/test-statistics.model';
import { TestsService } from '../../services/tests.service';

@Component({
  selector: 'app-test-statistics',
  imports: [RouterLink, LoadingSpinnerComponent],
  templateUrl: './test-statistics.html',
  styleUrl: './test-statistics.scss',
})
export class TestStatisticsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly testsService = inject(TestsService);
  private readonly notificationService = inject(NotificationService);

  private readonly testId = Number(
    this.route.snapshot.paramMap.get('testId')
  );

  protected readonly testDetailRoute =
    `/${RoutePaths.testing}/${this.testId}`;

  protected readonly isLoading = signal(true);
  protected readonly test = signal<TestDetail | null>(null);
  protected readonly statistics = signal<TestStatistics | null>(null);
  protected readonly hasLoadError = signal(false);

  ngOnInit(): void {
    if (!Number.isInteger(this.testId) || this.testId <= 0) {
      this.hasLoadError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.loadStatistics();
  }

  protected formatScore(score: number | null): string {
    return score === null
      ? 'N/A'
      : `${score.toFixed(2)}%`;
  }

  protected retry(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.isLoading.set(true);
    this.hasLoadError.set(false);

    forkJoin({
      test: this.testsService.getTestById(this.testId),
      statistics: this.testsService.getTestStatistics(this.testId),
    })
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: ({ test, statistics }) => {
          this.test.set(test);
          this.statistics.set(statistics);
        },
        error: () => {
          this.hasLoadError.set(true);

          this.notificationService.show(
            'Could not load test statistics.',
            'error'
          );
        },
      });
  }
}