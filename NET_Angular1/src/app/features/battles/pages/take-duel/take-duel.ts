import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, finalize, forkJoin, map, of, switchMap, take, timer } from 'rxjs';
import confetti from 'canvas-confetti';
import { TestsService } from '../../../tests/services/tests.service';
import { DuelService } from '../../services/duel.service';
import { StudentTest } from '../../../tests/models/student-test.model';
import { StartAttemptResponse } from '../../../tests/models/test-attempt.model';
import { DuelHistoryResponse, SubmitScoreResponse } from '../../models/duel.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { RoutePaths } from '../../../../app.routes';
import { QuestionType } from '../../../tests/models/question-type.model';

@Component({
  selector: 'app-take-duel',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  templateUrl: './take-duel.html',
  styleUrl: './take-duel.scss',
})
export class TakeDuelComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testsService = inject(TestsService);
  private readonly duelService = inject(DuelService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly duelId = Number(this.route.snapshot.paramMap.get('duelId'));
  private readonly testId = Number(this.route.snapshot.paramMap.get('testId'));

  protected readonly test = signal<StudentTest | null>(null);
  protected readonly attempt = signal<StartAttemptResponse | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly currentQuestionIndex = signal(0);
  protected readonly selectedAnswerIds = signal<number[]>([]);
  protected readonly isSaving = signal(false);

  protected readonly submitOutcome = signal<SubmitScoreResponse | null>(null);

  protected readonly currentQuestion = computed(() => {
    const test = this.test();
    if (test === null) return null;
    return test.questions[this.currentQuestionIndex()] ?? null;
  });

  protected readonly currentQuestionNumber = computed(() => this.currentQuestionIndex() + 1);
  protected readonly totalQuestions = computed(() => this.test()?.questions.length ?? 0);
  protected readonly isLastQuestion = computed(() => this.currentQuestionIndex() === this.totalQuestions() - 1);

  ngOnInit(): void {
    if (!Number.isInteger(this.duelId) || this.duelId <= 0 || !Number.isInteger(this.testId) || this.testId <= 0) {
      this.notificationService.show('Invalid duel specified.', 'error');
      void this.router.navigate(['/', RoutePaths.battles]);
      return;
    }

    this.initTest(this.testId);
  }

  private initTest(testId: number): void {
    this.testsService.getStudentTestById(testId)
      .pipe(
        switchMap((test) => {
          this.test.set(test);
          return this.testsService.startAttempt(test.id);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (attempt) => {
          this.attempt.set(attempt);
        },
        error: () => {
          this.notificationService.show('Could not start duel test attempt.', 'error');
          void this.router.navigate(['/', RoutePaths.battles]);
        },
      });
  }

  protected isAnswerSelected(answerId: number): boolean {
    return this.selectedAnswerIds().includes(answerId);
  }

  protected selectAnswer(questionType: QuestionType, answerId: number): void {
    if (this.isSaving()) return;

    if (questionType !== QuestionType.Multiple) {
      this.selectedAnswerIds.set([answerId]);
      return;
    }

    this.selectedAnswerIds.update((ids) =>
      ids.includes(answerId) ? ids.filter((id) => id !== answerId) : [...ids, answerId]
    );
  }

  protected onNext(): void {
    const test = this.test();
    const attempt = this.attempt();
    const selectedAnswerIds = this.selectedAnswerIds();

    if (!test || !attempt) return;

    if (selectedAnswerIds.length === 0) {
      this.notificationService.show('Please select an answer.', 'error');
      return;
    }

    this.isSaving.set(true);

    const saveRequests = selectedAnswerIds.map((answerId) =>
      this.testsService.submitAnswer(test.id, attempt.attemptId, answerId)
    );

    forkJoin(saveRequests)
      .subscribe({
        next: () => {
          if (this.isLastQuestion()) {
            this.finishDuelTest(test.id, attempt.attemptId);
            return;
          }
          this.currentQuestionIndex.update((i) => i + 1);
          this.selectedAnswerIds.set([]);
          this.isSaving.set(false);
        },
        error: () => {
          this.notificationService.show('Could not save answer.', 'error');
          this.isSaving.set(false);
        },
      });
  }

  private finishDuelTest(testId: number, attemptId: number): void {
    this.isSaving.set(true);

    this.testsService.submitAttempt(testId, attemptId)
      .pipe(
        switchMap((summary) => {
          return this.duelService.submitScore(this.duelId, {
            correctAnswers: summary.correctAnswers
          });
        }),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: (outcome) => {
          this.submitOutcome.set(outcome);
          if (outcome.isCompleted && outcome.result && !outcome.result.isDraw && outcome.result.winnerId !== null) {
            this.triggerFireworks();
          } else if (!outcome.isCompleted) {
            this.startResultPolling();
          }
        },
        error: (err) => {
          const msg = typeof err.error === 'string' ? err.error : 'Could not submit duel score.';
          this.notificationService.show(msg, 'error');
        }
      });
  }

  private startResultPolling(): void {
    timer(5000, 5000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.duelService.getDuelHistory().pipe(catchError(() => of([])))),
        map((history) => history.find((h) => h.duelId === this.duelId)),
        filter((matched): matched is DuelHistoryResponse => matched !== undefined),
        take(1)
      )
      .subscribe({
        next: (matched) => {
          this.submitOutcome.set({
            isCompleted: true,
            message: matched.isDraw
              ? "It's a draw!"
              : `Battle Finished! ${matched.winnerName} won!`,
            result: {
              duelId: matched.duelId,
              winnerId: matched.winnerId,
              winnerName: matched.winnerName,
              challengerCorrectAnswers: matched.challengerCorrectAnswers,
              challengedCorrectAnswers: matched.challengedCorrectAnswers,
              isDraw: matched.isDraw,
              completedAt: matched.completedAt
            }
          });

          if (!matched.isDraw && matched.winnerId !== null) {
            this.triggerFireworks();
          }
        }
      });
  }

  private triggerFireworks(): void {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
  }

  protected returnToDashboard(): void {
    void this.router.navigate(['/', RoutePaths.battles]);
  }
}
