import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { Endpoints } from '../../../shared/utils/endpoints';
import { TestSummary } from '../models/test-summary.model';
import { Observable } from 'rxjs';
import { CreateTestRequest } from '../models/create-test-request.model';
import { CreateTestResponse } from '../models/create-test-response.model';
import { TestDetail } from '../models/test-detail.model';
import { UpdateTestRequest } from '../models/update-test-request.model';
import { StudentTest } from '../models/student-test.model';
import { AttemptDetailsResponse, AttemptSummaryResponse, StartAttemptResponse, SubmitAnswerResponse } from '../models/test-attempt.model';
import { TestStatistics } from '../models/test-statistics.model'; 

@Injectable({
    providedIn: 'root',
})
export class TestsService {
    private readonly http = inject(HttpClient);

    private readonly testsUrl =
        `${environment.apiUrl}/api${Endpoints.TestsRoute}`;

    getTests(): Observable<TestSummary[]> {
        return this.http.get<TestSummary[]>(this.testsUrl);
    }

    getTestById(testId: number): Observable<TestDetail> {
        return this.http.get<TestDetail>(`${this.testsUrl}/${testId}`);
    }

    getTestStatistics(testId: number): Observable<TestStatistics> {
        return this.http.get<TestStatistics>( `${environment.apiUrl}/api${Endpoints.testStatisticsRoute(testId)}`);
    }

    createTest(request: CreateTestRequest): Observable<CreateTestResponse> {
        return this.http.post<CreateTestResponse>(this.testsUrl, request);
    }

    updateTest(id: number, request: UpdateTestRequest): Observable<CreateTestResponse> {
        return this.http.put<CreateTestResponse>(`${this.testsUrl}/${id}`, request);
    }

    deleteTest(id: number): Observable<void> {
        return this.http.delete<void>(`${this.testsUrl}/${id}`);
    }

    getStudentTestById(testId: number): Observable<StudentTest> {
        return this.http.get<StudentTest>(`${this.testsUrl}/${testId}`);
    }

    startAttempt(testId: number): Observable<StartAttemptResponse> {
        return this.http.post<StartAttemptResponse>(`${this.testsUrl}/${testId}/attempts`, {});
    }

    submitAnswer(testId: number, attemptId: number, answerId: number): Observable<SubmitAnswerResponse> {
        return this.http.post<SubmitAnswerResponse>(`${this.testsUrl}/${testId}/attempts/${attemptId}/${answerId}`, {});
    }

    submitAttempt(testId: number, attemptId: number): Observable<AttemptSummaryResponse> {
        return this.http.post<AttemptSummaryResponse>(`${this.testsUrl}/${testId}/attempts/${attemptId}/submit`, {});
    }

    getAttemptDetails(testId: number, attemptId: number): Observable<AttemptDetailsResponse> {
        return this.http.get<AttemptDetailsResponse>(`${this.testsUrl}/${testId}/attempts/${attemptId}`);
    }

    getAttempts(testId: number): Observable<AttemptSummaryResponse[]> {
        return this.http.get<AttemptSummaryResponse[]>(`${this.testsUrl}/${testId}/attempts`);
    }

    publishTest(id: number): Observable<TestDetail> {
        return this.http.patch<TestDetail>(`${this.testsUrl}/${id}/publish`, {});
    }
}
