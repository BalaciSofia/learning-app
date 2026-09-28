import { QuestionType } from './question-type.model';

export interface UpdateQuestionRequest {
    readonly text: string;
    readonly type: QuestionType;
}
