import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Endpoints } from '../../../../shared/utils/endpoints';
import { ResetPasswordRequest } from '../models/reset-password-request.model';

@Injectable({ providedIn: 'root' })
export class ResetPasswordService {
    private readonly http = inject(HttpClient);

    resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${environment.authApiUrl}/api${Endpoints.ResetPasswordRoute}`,
            request
        );
    }
}
