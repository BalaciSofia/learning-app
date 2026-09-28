import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Endpoints } from '../../../shared/utils/endpoints';
import { SKIP_ERROR_NOTIFICATION } from '../../../core/interceptors/error.interceptor';
import {
  EnrollmentResponse,
  LessonProgressResponse,
  ProgressSummaryResponse
} from '../models/enrollment.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly http = inject(HttpClient);

  enrollInCourse(courseId: number): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(
      `${environment.apiUrl}/api${Endpoints.enrollRoute(courseId)}`,
      {},
      {
        context: new HttpContext().set(SKIP_ERROR_NOTIFICATION, true)
      }
    );
  }

  getCourseProgress(courseId: number): Observable<LessonProgressResponse[]> {
    return this.http.get<LessonProgressResponse[]>(
      `${environment.apiUrl}/api${Endpoints.courseProgressRoute(courseId)}`,
      {
        context: new HttpContext().set(SKIP_ERROR_NOTIFICATION, true)
      }
    );
  }

  completeLesson(
    courseId: number,
    unitId: number,
    lessonId: number
  ): Observable<ProgressSummaryResponse> {
    return this.http.patch<ProgressSummaryResponse>(
      `${environment.apiUrl}/api${Endpoints.lessonCompleteRoute(courseId, unitId, lessonId)}`,
      {},
      {
        context: new HttpContext().set(SKIP_ERROR_NOTIFICATION, true)
      }
    );
  }
}
