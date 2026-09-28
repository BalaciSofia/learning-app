import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; 
import { SKIP_ERROR_NOTIFICATION } from '../../../core/interceptors/error.interceptor'; 
import { 
  ConquestResponse, 
  AnswerQuestRequest, 
  AnswerQuestResponse, 
  ClaimTreasureRequest, 
  ClaimTreasureResponse,
  AnswerRequest 
} from '../models/conquest.model';

@Injectable({
  providedIn: 'root'
})
export class ConquestApiService {
  private http = inject(HttpClient);
  
  private baseUrl = `${environment.apiUrl}/api/conquest`;

  getProgress(courseId: number): Observable<ConquestResponse> {
    return this.http.get<ConquestResponse>(`${this.baseUrl}/progress`, {
      params: { courseId }
    });
  }

  conquerZone(courseId: number, zoneId: number, payload: AnswerRequest): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/conquer-zone`, payload, {
      params: { courseId, zoneId },
      context: new HttpContext().set(SKIP_ERROR_NOTIFICATION, true)
    });
  }

  answerQuest(payload: AnswerQuestRequest): Observable<AnswerQuestResponse> {
    return this.http.post<AnswerQuestResponse>(`${this.baseUrl}/answer-quest`, payload);
  }

  claimTreasure(payload: ClaimTreasureRequest): Observable<ClaimTreasureResponse> {
    return this.http.post<ClaimTreasureResponse>(`${this.baseUrl}/claim-treasure`, payload);
  }
}