import { AddAnswerRequest } from './add-answer-request.model';
import { QuestionType } from './question-type.model';

export interface AddQuestionRequest {
    readonly text: string;
    readonly type: QuestionType;
    readonly answers: AddAnswerRequest[];
}
