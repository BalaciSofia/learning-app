import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../features/authentication/login/models/user-role.model';

/**
 * Structural directive that conditionally renders an element based on
 * the current user's role.
 *
 * Accepts a single `UserRole` or an array of `UserRole` values.
 * When the logged-in user's role is included in the provided list the
 * host element is stamped into the DOM; otherwise it is removed entirely
 * (not just hidden with CSS), so unauthorized markup never reaches the
 * DOM tree.
 *
 * The directive is **reactive**: it re-evaluates whenever the
 * `AuthService.getCurrentUser()` signal changes (login, logout, or
 * role switch), so elements appear/disappear in real time without a
 * page reload.
 *
 * ---
 *
 * ### Usage
 *
 * **Single role:**
 * ```html
 * <button *appHasRole="UserRole.Admin">Delete User</button>
 * ```
 *
 * **Multiple roles:**
 * ```html
 * <section *appHasRole="[UserRole.Teacher, UserRole.Admin]">
 *   <h2>Course Management</h2>
 * </section>
 * ```
 *
 * **With a role array defined in the component class:**
 * ```typescript
 * protected readonly managerRoles = [UserRole.Teacher, UserRole.Admin];
 * ```
 * ```html
 * <button *appHasRole="managerRoles">Edit Course</button>
 * ```
 *
 * ---
 *
 * Because the directive is standalone, you only need to add it to the
 * `imports` array of any component that uses it — no module
 * registration required.
 */
@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective {
  readonly appHasRole = input.required<UserRole | UserRole[]>();

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private hasView = false;

  constructor() {
    effect(() => {
      const allowedRoles = this.normaliseRoles(this.appHasRole());
      const user = this.authService.getCurrentUser();
      const isAuthorised = user !== null && allowedRoles.includes(user.role);

      if (isAuthorised && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!isAuthorised && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }

  private normaliseRoles(roles: UserRole | UserRole[]): UserRole[] {
    return Array.isArray(roles) ? roles : [roles];
  }
}
