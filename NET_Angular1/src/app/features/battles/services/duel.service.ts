import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Endpoints } from '../../../shared/utils/endpoints';
import { SKIP_ERROR_NOTIFICATION } from '../../../core/interceptors/error.interceptor';
import {
  StudentSummaryResponse,
  SendDuelInvitationRequest,
  DuelInvitationResponse,
  SaveDuelResultRequest,
  SubmitScoreResponse,
  DuelHistoryResponse
} from '../models/duel.model';

@Injectable({
  providedIn: 'root'
})
export class DuelService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api${Endpoints.BattlesRoute}`;

  getChallengableStudents(): Observable<StudentSummaryResponse[]> {
    return this.http.get<StudentSummaryResponse[]>(`${this.baseUrl}/students`);
  }

  sendInvitation(request: SendDuelInvitationRequest): Observable<DuelInvitationResponse> {
    return this.http.post<DuelInvitationResponse>(
      `${this.baseUrl}/invitations`,
      request,
      {
        context: new HttpContext().set(SKIP_ERROR_NOTIFICATION, true)
      }
    );
  }

  getIncomingInvitations(): Observable<DuelInvitationResponse[]> {
    return this.http.get<DuelInvitationResponse[]>(`${this.baseUrl}/invitations`);
  }

  acceptInvitation(duelId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/invitations/${duelId}/accept`, {});
  }

  rejectInvitation(duelId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/invitations/${duelId}/reject`, {});
  }

  submitScore(duelId: number, request: SaveDuelResultRequest): Observable<SubmitScoreResponse> {
    return this.http.post<SubmitScoreResponse>(`${this.baseUrl}/${duelId}/result`, request);
  }

  getActiveDuels(): Observable<DuelInvitationResponse[]> {
    return this.http.get<DuelInvitationResponse[]>(`${this.baseUrl}/active`);
  }

  getDuelHistory(): Observable<DuelHistoryResponse[]> {
    return this.http.get<DuelHistoryResponse[]>(`${this.baseUrl}/history`);
  }
}
