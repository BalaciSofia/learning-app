import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { StudyQuestService } from './services/study-quest.service';
import { StudentProfile } from './models/student-profile.model';
import { DailyPuzzle, AnswerDailyPuzzleResponse } from './models/daily-puzzle.model';
import { RoutePaths } from '../../app.routes';

@Component({
    selector: 'app-study-quest',
    imports: [RouterLink],
    templateUrl: './study-quest.html',
    styleUrl: './study-quest.scss'
})
export class StudyQuestComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly studyQuestService = inject(StudyQuestService);
    private readonly router = inject(Router);

    protected readonly courseId = Number(this.route.snapshot.queryParamMap.get('courseId'));
    protected readonly routePaths = RoutePaths;

    protected readonly isLoading = signal(true);
    protected readonly errorMessage = signal<string | null>(null);
    protected readonly profile = signal<StudentProfile | null>(null);

    protected readonly puzzle = signal<DailyPuzzle | null>(null);
    protected readonly puzzleResult = signal<AnswerDailyPuzzleResponse | null>(null);
    protected readonly isPuzzleAnswering = signal(false);

    ngOnInit(): void {
        if (!Number.isInteger(this.courseId) || this.courseId <= 0) {
            this.errorMessage.set('Invalid course.');
            this.isLoading.set(false);
            return;
        }

        this.studyQuestService
    
            .getProfile(this.courseId)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (p) => {
                    this.profile.set(p);
                    this.studyQuestService.getDailyPuzzle(this.courseId).subscribe({
                        next: (puz) => this.puzzle.set(puz),
                        error: () => { /* no puzzle today */ },
                    });
                },
                error: (err: HttpErrorResponse) => {
                    if (err.status === 404) {
                        this.errorMessage.set('This course does not have any quizzes available for Study Quest yet.');
                    } else {
                        this.errorMessage.set('Could not load your Study Quest profile.');
                    }
                },
            });
    }

    protected answerPuzzle(index: number): void {
        if (this.isPuzzleAnswering()) return;
        this.isPuzzleAnswering.set(true);
        this.studyQuestService.answerDailyPuzzle(this.courseId, index)
            .pipe(finalize(() => this.isPuzzleAnswering.set(false)))
            .subscribe({
                next: (result) => {
                    this.puzzleResult.set(result);
                    this.puzzle.update(p => p ? { ...p, alreadyClaimed: true } : p);
                    this.studyQuestService.getProfile(this.courseId).subscribe({
                        next: (p) => this.profile.set(p),
                        error: () => { },
                    });
                },
                error: () => { },
            });
    }

    protected navigateToConquest(): void {
        if (!this.courseId || isNaN(this.courseId) || this.courseId <= 0) {
            alert(`Eroare: courseId este invalid (${this.courseId}). Pagina a fost deschisă fără parametru în URL?`);
            return;
        }
        this.router.navigate([this.routePaths.conquest, this.courseId]);
    }
}

