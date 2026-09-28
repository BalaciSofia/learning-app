import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Endpoints } from '../../../../shared/utils/endpoints';
import { ChangePasswordRequest } from '../models/change-password-models';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {
  private http = inject(HttpClient);

  changePassword(request: ChangePasswordRequest) {
    return this.http.post(`${environment.apiUrl}/api${Endpoints.ChangePasswordRoute}`, request, {
      responseType: 'text'
    });
  }
}
