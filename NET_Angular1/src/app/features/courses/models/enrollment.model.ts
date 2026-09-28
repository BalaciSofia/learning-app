export interface EnrollmentResponse {
  courseId: number;
  enrolledAt: string;
}

export interface LessonProgressResponse {
  lessonId: number;
  completed: boolean;
  completedAt: string | null;
}

export interface ProgressSummaryResponse {
  progressPercent: number;
  lessons: LessonProgressResponse[];
}
