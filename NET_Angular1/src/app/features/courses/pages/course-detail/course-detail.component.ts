import { Component, computed, inject, signal,OnInit} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CourseService } from '../../services/course.service';
import { UnitService } from '../../services/unit.service';
import { LessonService } from '../../services/lesson-service';
import { EnrollmentService } from '../../services/enrollment.service';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

import {
  CourseResponse,
  UnitResponse,
  LessonType,
} from '../../models/course.model';

import { UserRole } from '../../../authentication/login/models/user-role.model';
import { RoutePaths } from '../../../../app.routes';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';

import { LessonContentComponent } from '../../components/lesson-content/lesson-content.component';

@Component({
  selector: 'app-course-detail',
  imports: [ReactiveFormsModule, HasRoleDirective, LessonContentComponent, RouterLink],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit{
  protected readonly UserRole = UserRole;

  private readonly fb = inject(FormBuilder);

  protected readonly unitForm = this.fb.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/)
      ]
    ],
    description: ['']
  });

  protected readonly selectedUnitId = signal<number | null>(null);

  protected readonly editingUnitId = signal<number |null>(null);

  protected readonly deletingUnitId = signal<number | null>(null);

  protected readonly isAddingUnit = signal(false);

  protected readonly isSavingNewUnit = signal(false);

  protected readonly isRenaming = signal(false);

  protected readonly isDeletingUnit = signal(false);

  protected readonly isDeletingLesson = signal(false);

  protected readonly lessonToDelete = signal<{
    id: number;
    title: string;
  } | null>(null);

  protected readonly course = signal<CourseResponse | null>(null);

  protected readonly isLoading = signal(true);

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly isTeacher = computed(
    () =>
      this.authService.getCurrentUser()?.role ===
      UserRole.Teacher
  );

  protected readonly isStudent = computed(
    () =>
      this.authService.getCurrentUser()?.role ===
      UserRole.Student
  );

  protected readonly isCreator = computed(() => {
    const user = this.authService.getCurrentUser();
    const course = this.course();
    return (
      this.isTeacher() &&
      user !== null &&
      course !== null &&
      course.creatorId === user.id
    );
  });

  protected readonly isPublishing = signal(false);
  protected readonly isDeletingCourse = signal(false);
  protected readonly showDeleteCourseDialog = signal(false);

  protected readonly isEnrolled = signal(false);
  protected readonly isEnrolling = signal(false);
  protected readonly isLoadingProgress = signal(false);
  protected readonly isCompletingLesson = signal<Set<number>>(new Set());

  protected readonly completedLessonsMap = signal<Map<number, boolean>>(new Map());

  protected readonly totalLessonsCount = computed(() => {
    const c = this.course();
    if (!c || !c.units) return 0;
    return c.units.reduce((total, u) => total + (u.lessons?.length || 0), 0);
  });

  protected readonly completedLessonsCount = computed(() => {
    const c = this.course();
    const map = this.completedLessonsMap();
    if (!c || !c.units) return 0;

    let count = 0;
    for (const unit of c.units) {
      if (!unit.lessons) continue;
      for (const lesson of unit.lessons) {
        if (map.get(lesson.id)) {
          count++;
        }
      }
    }
    return count;
  });

  protected readonly progressPercentage = computed(() => {
    const total = this.totalLessonsCount();
    if (total === 0) return 0;
    const completed = this.completedLessonsCount();
    return Math.round((completed / total) * 100);
  });

  protected readonly lessonTypeIcons: Record<LessonType, string> = {
    [LessonType.Video]: '\u25B6\uFE0F',
    [LessonType.Reading]: '\u{1F4D6}',
    [LessonType.Activity]: '\u{1F9E9}',
    [LessonType.Quiz]: '\u2753',
  };

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);


  private readonly courseService = inject(CourseService);
  private readonly unitService = inject(UnitService);
  private readonly lessonService = inject(LessonService);
  private readonly enrollmentService = inject(EnrollmentService);

  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  private readonly courseId = Number(this.route.snapshot.paramMap.get('id'));

  ngOnInit(): void {
    if (this.courseId > 0) {
      this.loadCourseDetails(this.courseId);
    } else {
      this.isLoading.set(false);
      this.errorMessage.set('Invalid course id.');
    }
  }

  protected readonly coursesRoute = ['/', RoutePaths.courses];

  private loadCourseDetails(id: number): void {

    this.isLoading.set(true);

    this.courseService
      .getCourseById(id)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({

        next: course => {
          this.course.set(course);
          if (this.isStudent()) {
            this.loadStudentProgress(id);
          }
        },

        error: () =>
          this.errorMessage.set(
            'Failed to load course details.'
          )

      });

  }

  private loadStudentProgress(courseId: number): void {
    this.isLoadingProgress.set(true);

    this.enrollmentService
      .getCourseProgress(courseId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.isEnrolled.set(false);
          } else {
            this.notificationService.show('Failed to load course progress.', 'error');
          }
          return EMPTY;
        }),
        finalize(() => this.isLoadingProgress.set(false))
      )
      .subscribe({
        next: (progressList) => {
          this.isEnrolled.set(true);
          const map = new Map<number, boolean>();
          progressList.forEach((item) => {
            map.set(item.lessonId, item.completed);
          });
          this.completedLessonsMap.set(map);
        }
      });
  }

  protected enrollInCourse(): void {
    if (!this.isStudent() || this.isEnrolling() || !this.courseId) return;

    this.isEnrolling.set(true);
    this.enrollmentService
      .enrollInCourse(this.courseId)
      .pipe(finalize(() => this.isEnrolling.set(false)))
      .subscribe({
        next: () => {
          this.isEnrolled.set(true);
          this.completedLessonsMap.set(new Map());
          this.notificationService.show('Successfully enrolled in the course!', 'success');
        },
        error: () => {
          this.notificationService.show('Could not enroll in course.', 'error');
        }
      });
  }

  protected publishCourse(): void {
    const c = this.course();
    if (!this.isCreator() || !c || c.isPublished || this.isPublishing()) return;

    this.isPublishing.set(true);
    this.courseService
      .publishCourse(c.id)
      .pipe(finalize(() => this.isPublishing.set(false)))
      .subscribe({
        next: () => {
          this.course.update(curr => (curr ? { ...curr, isPublished: true } : curr));
          this.notificationService.show('Course published successfully!', 'success');
        },
        error: () => {
          this.notificationService.show('Could not publish course.', 'error');
        }
      });
  }

  protected openDeleteCourseDialog(): void {
    if (!this.isCreator()) return;
    this.showDeleteCourseDialog.set(true);
  }

  protected closeDeleteCourseDialog(): void {
    this.showDeleteCourseDialog.set(false);
  }

  protected deleteCourse(): void {
    const c = this.course();
    if (!this.isCreator() || !c || this.isDeletingCourse()) return;

    this.isDeletingCourse.set(true);
    this.courseService
      .deleteCourse(c.id)
      .pipe(finalize(() => this.isDeletingCourse.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.show('Course deleted successfully.', 'success');
          void this.router.navigate(['/', RoutePaths.courses]);
        },
        error: () => {
          this.notificationService.show('Could not delete course.', 'error');
        }
      });
  }

  protected markLessonComplete(unitId: number, lessonId: number, event: Event): void {
    event.stopPropagation();
    if (!this.isStudent() || this.isCompletingLesson().has(lessonId) || this.completedLessonsMap().get(lessonId)) return;

    this.isCompletingLesson.update(set => {
      const next = new Set(set);
      next.add(lessonId);
      return next;
    });

    this.enrollmentService
      .completeLesson(this.courseId, unitId, lessonId)
      .pipe(
        finalize(() => {
          this.isCompletingLesson.update(set => {
            const next = new Set(set);
            next.delete(lessonId);
            return next;
          });
        })
      )
      .subscribe({
        next: () => {
          this.completedLessonsMap.update(map => {
            const newMap = new Map(map);
            newMap.set(lessonId, true);
            return newMap;
          });
          this.notificationService.show('Lesson marked as completed!', 'success');
        },
        error: () => {
          this.notificationService.show('Could not mark lesson as complete.', 'error');
        }
      });
  }

  protected toggleUnit(unitId: number): void {

    this.selectedUnitId.update(current =>
      current === unitId ? null : unitId
    );

  }

  protected addUnit(): void {
    if (!this.isTeacher()) return;
    this.editingUnitId.set(null);
    this.deletingUnitId.set(null);

    this.unitForm.reset({
      title: '',
      description: ''
    });

    this.isAddingUnit.set(true);
  }

  protected startEdit(unit: UnitResponse): void {
    if (!this.isTeacher()) return;
    this.isAddingUnit.set(false);
    this.deletingUnitId.set(null);

    this.unitForm.setValue({
      title: unit.title,
      description: unit.description ?? ''
    });

    this.editingUnitId.set(unit.id);
  }

 protected cancelEdit(): void {
    this.editingUnitId.set(null);
    this.isAddingUnit.set(false);

    this.unitForm.reset({
      title: '',
      description: ''
    });
  }

  protected saveNewUnit(): void {
    if (!this.isTeacher() || this.unitForm.invalid || this.isSavingNewUnit()) {
      this.unitForm.markAllAsTouched();
      return;
    }

    const { title, description } = this.unitForm.getRawValue();

    this.isSavingNewUnit.set(true);

    this.unitService
      .create(this.courseId, {
        title: title.trim(),
        description: description.trim()
      })
      .pipe(
        finalize(() => this.isSavingNewUnit.set(false))
      )
      .subscribe({
        next: unit => {
          this.course.update(course =>
            course
              ? {
                  ...course,
                  units: [...course.units, unit]
                }
              : course
          );

          this.isAddingUnit.set(false);

          this.unitForm.reset({
            title: '',
            description: ''
          });
        },

        error: () =>
          this.notificationService.show(
            'Could not create unit.',
            'error'
          )
      });
  }

  protected saveRename(unitId: number): void {
    if (!this.isTeacher() || this.unitForm.invalid || this.isRenaming()) {
      this.unitForm.markAllAsTouched();
      return;
    }

    const { title, description } = this.unitForm.getRawValue();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    this.isRenaming.set(true);

    this.unitService
      .update(this.courseId, unitId, {
        title: trimmedTitle,
        description: trimmedDescription
      })
      .pipe(
        finalize(() => this.isRenaming.set(false))
      )
      .subscribe({
        next: () => {
          this.course.update(course =>
            course
              ? {
                  ...course,
                  units: course.units.map(unit =>
                    unit.id === unitId
                      ? {
                          ...unit,
                          title: trimmedTitle,
                          description: trimmedDescription
                        }
                      : unit
                  )
                }
              : course
          );

          this.editingUnitId.set(null);

          this.unitForm.reset({
            title: '',
            description: ''
          });
        },

        error: () =>
          this.notificationService.show(
            'Could not update unit.',
            'error'
          )
      });
  }

  protected requestDelete(unitId: number): void {
    if (!this.isTeacher() || this.isDeletingUnit()) {
      return;
    }

    this.deletingUnitId.set(unitId);
  }

  protected cancelDelete(): void {
    if (this.isDeletingUnit()) {
      return;
    }

    this.deletingUnitId.set(null);
  }

  protected deleteUnit(unitId: number): void {
    if (!this.isTeacher() || this.isDeletingUnit()) {
    return;
  }

  this.isDeletingUnit.set(true);

  this.unitService
    .delete(this.courseId, unitId)
    .pipe(
      finalize(() => this.isDeletingUnit.set(false))
    )
    .subscribe({
      next: () => {
        this.course.update(course =>
          course
            ? {
                ...course,
                units: course.units.filter(
                  unit => unit.id !== unitId
                )
              }
            : course
        );

        this.deletingUnitId.set(null);

        if (this.selectedUnitId() === unitId) {
          this.selectedUnitId.set(null);
        }
      },

      error: () =>
        this.notificationService.show(
          'Could not delete unit.',
          'error'
        )
    });
}

  protected addLesson(unitId: number): void {
    if (!this.isTeacher()) return;
    void this.router.navigate([
      RoutePaths.courses,
      RoutePaths.units,
      unitId,
      RoutePaths.lessons,
      RoutePaths.newLesson
    ]);
  }

  protected editLesson(lessonId: number): void {
    if (!this.isTeacher()) return;
    void this.router.navigate([
      RoutePaths.courses,
      RoutePaths.lessons,
      lessonId,
      RoutePaths.editLesson
    ]);
  }

  protected openDeleteDialog(
    lessonId: number,
    lessonTitle: string,
    event: Event
  ): void {
    event.stopPropagation();
    if (!this.isTeacher()) return;

    this.lessonToDelete.set({
      id: lessonId,
      title: lessonTitle
    });
  }

  protected closeDeleteDialog(): void {
    this.lessonToDelete.set(null);
  }

  protected confirmDelete(): void {
    const lesson = this.lessonToDelete();

    if (!this.isTeacher() || !lesson || this.isDeletingLesson()) {
      return;
    }

    this.isDeletingLesson.set(true);

    this.lessonService
      .deleteLesson(lesson.id)
      .pipe(
        finalize(() => this.isDeletingLesson.set(false))
      )
      .subscribe({
        next: () => {
          this.course.update(course =>
            course
              ? {
                  ...course,
                  units: course.units.map(unit => ({
                    ...unit,
                    lessons: unit.lessons.filter(
                      lessonItem =>
                        lessonItem.id !== lesson.id
                    )
                  }))
                }
              : course
          );

          this.lessonToDelete.set(null);

          this.notificationService.show(
            'Lesson deleted successfully.',
            'success'
          );
        },

        error: () =>
          this.notificationService.show(
            'Could not delete lesson.',
            'error'
          )
      });
  }
}