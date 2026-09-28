import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'notification',
    standalone: true,
    templateUrl: './notification.html',
    styleUrl: './notification.scss'
})
export class NotificationComponent {
    protected readonly notificationService = inject(NotificationService);
}