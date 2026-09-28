import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Endpoints } from '../../../shared/utils/endpoints';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    private readonly http = inject(HttpClient);

    getCurrentUserProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${environment.apiUrl}/api${Endpoints.CurrentUserRoute}`);
    }
    deleteAccount(userId: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/api/users/${userId}`);
    }
}
