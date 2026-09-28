import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Endpoints } from '../../../../shared/utils/endpoints';

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService {
    private readonly http = inject(HttpClient);

    sendResetLink(email: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${environment.authApiUrl}/api${Endpoints.ForgotPasswordRoute}`,
            { email }
        );
    }
}
