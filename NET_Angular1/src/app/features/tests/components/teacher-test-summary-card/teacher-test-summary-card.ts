import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TestSummary } from '../../models/test-summary.model';
import { RoutePaths } from '../../../../app.routes';

@Component({
  selector: 'app-teacher-test-summary-card',
  imports: [RouterLink],
  templateUrl: './teacher-test-summary-card.html',
  styleUrl: './teacher-test-summary-card.scss',
})
export class TeacherTestSummaryCardComponent {
  readonly test = input.required<TestSummary>();

  protected readonly detailRoute = computed(() => `/${RoutePaths.testing}/${this.test().id}`);
}
