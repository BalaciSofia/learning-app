import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Endpoints } from '../../../../shared/utils/endpoints';
import { RegisterRequest } from '../models/register-request.model';
import { RegisterResponse } from '../models/register-response.model';

@Injectable({
    providedIn: 'root'
})
export class RegisterService {
    private readonly http = inject(HttpClient);

    register(request: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(
            `${environment.authApiUrl}/api${Endpoints.RegisterRoute}`,
            request
        );
    }
}
