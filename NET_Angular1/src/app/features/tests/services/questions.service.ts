import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Endpoints } from '../../../shared/utils/endpoints';
import { AddQuestionRequest } from '../models/add-question-request.model';
import { UpdateQuestionRequest } from '../models/update-question-request.model';
import { QuestionResponse } from '../models/question-response.model';
import { AddAnswerRequest } from '../models/add-answer-request.model';
import { UpdateAnswerRequest } from '../models/update-answer-request.model';
import { AnswerResponse } from '../models/answer-response.model';

@Injectable({
    providedIn: 'root',
})
export class QuestionsService {
    private readonly http = inject(HttpClient);

    addQuestion(testId: number, request: AddQuestionRequest): Observable<QuestionResponse> {
        return this.http.post<QuestionResponse>(`${environment.apiUrl}/api${Endpoints.questionsRoute(testId)}`, request);
    }

    updateQuestion(testId: number, questionId: number, request: UpdateQuestionRequest): Observable<QuestionResponse> {
        return this.http.put<QuestionResponse>(`${environment.apiUrl}/api${Endpoints.questionRoute(testId, questionId)}`, request);
    }

    deleteQuestion(testId: number, questionId: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/api${Endpoints.questionRoute(testId, questionId)}`);
    }

    addAnswer(testId: number, questionId: number, request: AddAnswerRequest): Observable<AnswerResponse> {
        return this.http.post<AnswerResponse>(`${environment.apiUrl}/api${Endpoints.answersRoute(testId, questionId)}`, request);
    }

    updateAnswer(testId: number, questionId: number, answerId: number, request: UpdateAnswerRequest): Observable<AnswerResponse> {
        return this.http.put<AnswerResponse>(`${environment.apiUrl}/api${Endpoints.answerRoute(testId, questionId, answerId)}`, request);
    }

    deleteAnswer(testId: number, questionId: number, answerId: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/api${Endpoints.answerRoute(testId, questionId, answerId)}`);
    }
}
