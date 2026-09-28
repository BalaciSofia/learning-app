export enum LessonType{
  Video = 'Video',
  Reading = 'Reading',
  Activity = 'Activity',
  Quiz = 'Quiz'
}

export interface LessonContentDto {
  videoUrl: string | null;
  bodyText: string | null;
  quizId: number | null;
}

export interface LessonResponse {
  id: number;
  title: string;
  content: LessonContentDto;
  description: string;
  duration: number; 
  type: LessonType;     
}

export interface UnitResponse {
  id: number;
  title: string;
  description: string;
  lessons: LessonResponse[]; 
}

export interface CourseResponse {
  id: number;
  title: string;
  description: string;
  subject: string;
  metadata: string;
  institutionId: number;
  creatorId: number;
  isPublished: boolean;
  units: UnitResponse[]; 
}

export interface CourseCreateRequest {
  readonly title: string;
  readonly description: string;
  readonly subject: string;
  readonly metadata: string;
}

export interface LessonCreate {
  readonly title: string;
  readonly description: string;
  readonly duration: number;
  readonly type: LessonType;
  readonly content: LessonContentDto;
}