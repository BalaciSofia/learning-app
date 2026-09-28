import {
  Component,
  computed,
  inject,
  input
} from '@angular/core';
import { Router } from '@angular/router';

import { RoutePaths } from '../../../../app.routes';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../authentication/login/models/user-role.model';
import {
  LessonResponse,
  LessonType
} from '../../models/course.model';

@Component({
  selector: 'app-lesson-content',
  imports: [],
  templateUrl: './lesson-content.component.html',
  styleUrl: './lesson-content.component.scss'
})
export class LessonContentComponent {
  readonly lesson = input.required<LessonResponse>();
  readonly isEnrolled = input(false);

  protected readonly LessonType = LessonType;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly videoThumbnailUrl = computed(() => {
    const videoUrl = this.lesson().content.videoUrl;

    if (!videoUrl) {
      return null;
    }

    const videoId = this.extractYoutubeVideoId(videoUrl);

    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;
  });


  protected readonly canOpenQuiz = computed(() => {
      const role = this.authService.getCurrentUser()?.role;

      return role !== UserRole.Student || this.isEnrolled();
    }); 

    
    protected openQuiz(): void {
    const quizId = this.lesson().content.quizId;

    if (quizId === null || !this.canOpenQuiz()) {
      return;
    }

    const role = this.authService.getCurrentUser()?.role;

    if (role === UserRole.Student) {
      void this.router.navigate([
        RoutePaths.testing,
        quizId,
        'take'
      ]);

      return;
    }

    void this.router.navigate([
      RoutePaths.testing,
      quizId
    ]);
  }

  private extractYoutubeVideoId(videoUrl: string): string | null {
    try {
      const url = new URL(videoUrl);
      const hostname = url.hostname.toLowerCase();

      if (hostname === 'youtu.be') {
        return url.pathname
          .split('/')
          .filter(Boolean)[0] ?? null;
      }

      if (
        hostname === 'youtube.com' ||
        hostname.endsWith('.youtube.com') ||
        hostname === 'youtube-nocookie.com' ||
        hostname.endsWith('.youtube-nocookie.com')
      ) {
        const videoId = url.searchParams.get('v');

        if (videoId) {
          return videoId;
        }

        const pathParts = url.pathname
          .split('/')
          .filter(Boolean);

        if (
          pathParts[0] === 'embed' ||
          pathParts[0] === 'shorts' ||
          pathParts[0] === 'live'
        ) {
          return pathParts[1] ?? null;
        }
      }

      return null;
    } catch {
      return null;
    }
  }
}
