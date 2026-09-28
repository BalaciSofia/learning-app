import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Endpoints } from '../../../shared/utils/endpoints';
import { GenerateDistractorsRequest } from '../models/generate-distractors-request.model';
import { GenerateDistractorsResponse } from '../models/generate-distractors-response.model';

@Injectable({
    providedIn: 'root',
})
export class DistractorService {
    private readonly http = inject(HttpClient);

    generateDistractors(request: GenerateDistractorsRequest): Observable<GenerateDistractorsResponse> {
        return this.http.post<GenerateDistractorsResponse>(`${environment.apiUrl}/api${Endpoints.GenerateDistractorsRoute}`, request);
    }
}
