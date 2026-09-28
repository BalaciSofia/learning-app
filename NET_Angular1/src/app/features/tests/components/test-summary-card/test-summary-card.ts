import { Component, computed, input, output } from '@angular/core';
import { TestSummary } from '../../models/test-summary.model';

@Component({
  selector: 'app-test-summary-card',
  imports: [],
  templateUrl: './test-summary-card.html',
  styleUrl: './test-summary-card.scss',
})
export class TestSummaryCardComponent {
  readonly test = input.required<TestSummary>();
  readonly takeTest = output<number>();
  readonly viewAttempts = output<number>();

  protected readonly isTakeTestDisabled = computed(
    () => !this.test().isRetakeAllowed && this.test().hasAttempted
  );
}
