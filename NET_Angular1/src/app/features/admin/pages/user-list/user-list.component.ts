import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { AdminService } from '../../services/admin.service';
import { BasicUserResponse } from '../../models/basic-user.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserRole } from '../../../authentication/login/models/user-role.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-list',
  imports: [ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  protected readonly UserRole = UserRole;
  protected readonly activeTab = signal<'basic' | 'all'>('basic');
  protected readonly basicUsers = signal<BasicUserResponse[]>([]);
  protected readonly allUsers = signal<BasicUserResponse[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly rolesForm = this.fb.record({});
  protected readonly savingIds = signal<Set<number>>(new Set());
  protected readonly pendingRoleChange = signal<{ user: BasicUserResponse; role: UserRole } | null>(null);
  protected readonly confirmMessage = computed(() => {
    const state = this.pendingRoleChange();
    if (!state) return '';
    return `Assign role "${state.role}" to ${state.user.firstName} ${state.user.lastName}?`;
  });

  protected readonly deletingIds = signal<Set<number>>(new Set());
  protected readonly pendingUserDelete = signal<BasicUserResponse | null>(null);
  protected readonly deleteConfirmMessage = computed(() => {
    const user = this.pendingUserDelete();
    if (!user) return '';
    return `Are you sure you want to delete ${user.firstName} ${user.lastName} (${user.email})? This action cannot be undone.`;
  });

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      basic: this.adminService.getBasicUsers(),
      all: this.adminService.getAllUsers(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ basic, all }) => {
          this.basicUsers.set(basic);
          this.allUsers.set(all);

          basic.forEach((u) => {
            if (!this.rolesForm.contains(u.id.toString())) {
              this.rolesForm.addControl(u.id.toString(), this.fb.control(''));
            }
          });
        },
        error: () => this.errorMessage.set('Failed to load users data.'),
      });
  }

  protected setTab(tab: 'basic' | 'all'): void {
    this.activeTab.set(tab);
  }

  protected onSave(user: BasicUserResponse): void {
    const role = this.rolesForm.get(user.id.toString())?.value;

    if (!role) {
      this.notificationService.show('Please select a role first.', 'error');
      return;
    }

    this.pendingRoleChange.set({ user, role });
  }

  protected confirmRoleChange(): void {
    const state = this.pendingRoleChange();
    if (!state) return;

    const { user, role } = state;
    this.pendingRoleChange.set(null);

    this.savingIds.update((ids) => new Set(ids).add(user.id));

    this.adminService
      .changeUserRole(user.id, role)
      .pipe(
        finalize(() =>
          this.savingIds.update((ids) => {
            const next = new Set(ids);
            next.delete(user.id);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.basicUsers.update((list) => list.filter((u) => u.id !== user.id));
          this.rolesForm.removeControl(user.id.toString());

          this.allUsers.update((list) =>
            list.map((u) => (u.id === user.id ? { ...u, role } : u))
          );

          this.notificationService.show(
            `${user.firstName} ${user.lastName} is now a ${role}.`,
            'success'
          );
        },
        error: () => {
          this.notificationService.show(
            `Failed to change role for ${user.firstName} ${user.lastName}.`,
            'error'
          );
        },
      });
  }

protected getRoleName(role: number | string | undefined | null): string {
  if (typeof role === 'string') {
    return role;
  }

  switch (role) {
    case 0:
      return 'Admin';
    case 1:
      return 'Teacher';
    case 2:
      return 'Student';
    case 3:
      return 'Basic';
    default:
      return 'Basic';
  }
}

  protected cancelRoleChange(): void {
    this.pendingRoleChange.set(null);
  }

  protected onDelete(user: BasicUserResponse): void {
    this.pendingUserDelete.set(user);
  }

  protected confirmUserDelete(): void {
    const user = this.pendingUserDelete();
    if (!user) return;

    this.pendingUserDelete.set(null);
    this.deletingIds.update((ids) => new Set(ids).add(user.id));

    this.adminService
      .deleteUser(user.id)
      .pipe(
        finalize(() =>
          this.deletingIds.update((ids) => {
            const next = new Set(ids);
            next.delete(user.id);
            return next;
          })
        )
      )
      .subscribe({
        next: () => {
          this.allUsers.update((list) => list.filter((u) => u.id !== user.id));
          this.basicUsers.update((list) => list.filter((u) => u.id !== user.id));

          if (this.rolesForm.contains(user.id.toString())) {
            this.rolesForm.removeControl(user.id.toString());
          }

          this.notificationService.show(
            `Account for ${user.firstName} ${user.lastName} has been deleted.`,
            'info'
          );
        },
        error: () => {
          this.notificationService.show(
            `Failed to delete account for ${user.firstName} ${user.lastName}.`,
            'error'
          );
        },
      });
  }

  protected cancelUserDelete(): void {
    this.pendingUserDelete.set(null);
  }
}