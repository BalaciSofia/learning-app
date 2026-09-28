import { QuestionType } from "./question-type.model";

export interface StudentAnswer {
  readonly id: number;
  readonly text: string;
}

export interface StudentQuestion {
  readonly id: number;
  readonly text: string;
  readonly type: QuestionType;
  readonly answers: StudentAnswer[];
}

export interface StudentTest {
  readonly id: number;
  readonly title: string;
  readonly description: string | null;
  readonly isRetakeAllowed: boolean;
  readonly questions: StudentQuestion[];
}