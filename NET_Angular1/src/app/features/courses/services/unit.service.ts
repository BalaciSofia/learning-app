import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Endpoints } from '../../../shared/utils/endpoints';
import { UnitResponse } from '../models/course.model';

interface UnitDto {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class UnitService {
  private readonly http = inject(HttpClient);

  private unitUrl(courseId: number, unitId?: number): string {
    const base = `${environment.apiUrl}/api${Endpoints.CourseRoute}/${courseId}/units`;
    return unitId !== undefined ? `${base}/${unitId}` : base;
  }

  create(courseId: number, dto: UnitDto): Observable<UnitResponse> {
    return this.http.post<UnitResponse>(this.unitUrl(courseId), dto);
  }

  update(courseId: number, unitId: number, dto: UnitDto): Observable<void> {
    return this.http.put<void>(this.unitUrl(courseId, unitId), dto);
  }

  delete(courseId: number, unitId: number): Observable<void> {
    return this.http.delete<void>(this.unitUrl(courseId, unitId));
  }
}
