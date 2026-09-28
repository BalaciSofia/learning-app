import { Injectable, inject, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'error' | 'auth' | 'warning' | 'info' | 'success';
}

@Injectable({
    providedIn: 'root'
})

export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  show(message: string, type: Notification['type'], durationMs = 5000) {
    const id = Date.now();
    this._notifications.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number) {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }
}

