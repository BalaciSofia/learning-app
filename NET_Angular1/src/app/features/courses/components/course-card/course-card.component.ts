import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseResponse } from '../../models/course.model';
import { RoutePaths } from '../../../../app.routes';
import { UserRole } from '../../../authentication/login/models/user-role.model';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-course-card',
  imports: [RouterLink, HasRoleDirective],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent {
  readonly course = input.required<CourseResponse>();
  readonly isEnrolled = input(false);
  protected readonly routePaths = RoutePaths;
  protected readonly UserRole = UserRole;
}