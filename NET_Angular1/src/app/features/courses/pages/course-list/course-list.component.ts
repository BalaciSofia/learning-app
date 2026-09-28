import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { CourseResponse } from '../../models/course.model';
import { RouterLink } from '@angular/router';
import { RoutePaths } from '../../../../app.routes';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../authentication/login/models/user-role.model';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { finalize, forkJoin } from 'rxjs';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-course-list',
  imports: [CourseCardComponent, RouterLink, HasRoleDirective],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  protected readonly UserRole = UserRole;

  private readonly authService = inject(AuthService);
  private readonly courseService = inject(CourseService);

  protected readonly createCourseRoute = [
    '/',
    RoutePaths.courses,
    'create',
  ];

  protected readonly courses = signal<CourseResponse[]>([]);
  protected readonly enrolledCourses = signal<CourseResponse[]>([]);
  protected readonly availableCourses = signal<CourseResponse[]>([]);

  protected readonly publishedCourses = computed(() =>
    this.courses().filter((c) => c.isPublished)
  );
  protected readonly draftCourses = computed(() =>
    this.courses().filter((c) => !c.isPublished)
  );

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly isStudent = computed(
    () => this.authService.getCurrentUser()?.role === UserRole.Student
  );

  ngOnInit(): void {
    if (this.isStudent()) {
      forkJoin({
        all: this.courseService.getAllCourses(),
        enrolled: this.courseService.getEnrolledCourses(),
      })
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: ({ all, enrolled }) => {
            this.enrolledCourses.set(enrolled);
            const enrolledIds = new Set(enrolled.map((c) => c.id));
            this.availableCourses.set(all.filter((c) => !enrolledIds.has(c.id)));
          },
          error: () => this.errorMessage.set('Failed to load courses.'),
        });
    } else {
      this.courseService
        .getAllCourses()
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (courses) => this.courses.set(courses),
          error: () => this.errorMessage.set('Failed to load courses.'),
        });
    }
  }
}