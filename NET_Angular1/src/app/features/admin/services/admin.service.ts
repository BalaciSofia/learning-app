import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BasicUserResponse, ChangeRoleResponse } from '../models/basic-user.model';
import { environment } from '../../../../environments/environment';
import { Endpoints } from '../../../shared/utils/endpoints';
import { UserRole } from '../../authentication/login/models/user-role.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);

  getBasicUsers(): Observable<BasicUserResponse[]> {
    return this.http.get<BasicUserResponse[]>(
      `${environment.apiUrl}/api${Endpoints.AdminBasicUsersRoute}`
    );
  }

  getAllUsers(): Observable<BasicUserResponse[]> {
    return this.http.get<BasicUserResponse[]>(
      `${environment.apiUrl}/api${Endpoints.AdminAllUsersRoute}`
    ); 
  }

  changeUserRole(userId: number, role: UserRole): Observable<ChangeRoleResponse> {
    return this.http.patch<ChangeRoleResponse>(
      `${environment.apiUrl}/api${Endpoints.adminChangeRoleRoute(userId)}`,
      null,
      { params: { role } }
    );
  }
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/api/users/${userId}`
    );
  }
}
