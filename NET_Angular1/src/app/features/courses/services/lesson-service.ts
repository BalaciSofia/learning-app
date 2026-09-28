import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LessonResponse, LessonCreate } from '../models/course.model';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LessonService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.authApiUrl}/api`;

    createLesson(unitId: number, payload: LessonCreate): Observable<LessonResponse> {
        return this.http.post<LessonResponse>(`${this.baseUrl}/units/${unitId}/lessons`, payload);
    }
    deleteLesson(id: number): Observable<void> {
        return this.http.delete<void>(
            `${this.baseUrl}/lessons/${id}`
        );
    }
    getLessonById(id: number): Observable<LessonResponse> {
        return this.http.get<LessonResponse>(
            `${this.baseUrl}/lessons/${id}`
        );
    }

    updateLesson(
        id: number,
        payload: LessonCreate
    ): Observable<void> {

        return this.http.put<void>(
            `${this.baseUrl}/lessons/${id}`,
            payload
        );
    }
}