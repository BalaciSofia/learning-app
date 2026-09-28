import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StudentProfile } from '../models/student-profile.model';
import { DailyPuzzle, AnswerDailyPuzzleResponse } from '../models/daily-puzzle.model';
import { Endpoints } from '../../../shared/utils/endpoints';
import { SKIP_ERROR_NOTIFICATION } from '../../../core/interceptors/error.interceptor';

@Injectable({ providedIn: 'root' })
export class StudyQuestService {
  private readonly http = inject(HttpClient);

  private readonly skipErrorContext = new HttpContext().set(SKIP_ERROR_NOTIFICATION, true);

  getProfile(courseId: number): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(
      `${environment.apiUrl}/api${Endpoints.StudyQuestProfileRoute}`,
      { params: { courseId }, context: this.skipErrorContext },
    );
  }

  getDailyPuzzle(courseId: number): Observable<DailyPuzzle> {
    return this.http.get<DailyPuzzle>(
      `${environment.apiUrl}/api${Endpoints.StudyQuestDailyPuzzleRoute}`,
      { params: { courseId }, context: this.skipErrorContext },
    );
  }

  answerDailyPuzzle(courseId: number, answerIndex: number): Observable<AnswerDailyPuzzleResponse> {
    return this.http.post<AnswerDailyPuzzleResponse>(
      `${environment.apiUrl}/api${Endpoints.StudyQuestAnswerDailyPuzzleRoute}`,
      { courseId, answerIndex },
      { context: this.skipErrorContext },
    );
  }
}
