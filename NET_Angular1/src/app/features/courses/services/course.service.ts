import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseCreateRequest,CourseResponse } from '../models/course.model';
import { environment } from '../../../../environments/environment';
import { Endpoints } from '../../../shared/utils/endpoints';
@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly http = inject(HttpClient);

  getCourseById(id: number): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${environment.apiUrl}/api${Endpoints.CourseRoute}/${id}`);
  }
  
  getAllCourses(): Observable<CourseResponse[]> {
    return this.http.get<CourseResponse[]>(`${environment.apiUrl}/api${Endpoints.CourseRoute}`);
  }

  getEnrolledCourses(): Observable<CourseResponse[]> {
    return this.http.get<CourseResponse[]>(`${environment.apiUrl}/api${Endpoints.EnrolledCoursesRoute}`);
  }

  createCourse(request: CourseCreateRequest): Observable<CourseResponse> {
  return this.http.post<CourseResponse>(
    `${environment.apiUrl}/api${Endpoints.CourseRoute}`,
    request
  );
}

  publishCourse(id: number): Observable<CourseResponse> {
    return this.http.put<CourseResponse>(`${environment.apiUrl}/api${Endpoints.CourseRoute}/${id}/publish`, {});
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api${Endpoints.CourseRoute}/${id}`);
  }
}