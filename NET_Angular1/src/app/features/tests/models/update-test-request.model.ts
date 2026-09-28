import { QuestionResponse } from './question-response.model';

export interface UpdateTestRequest {
    readonly title: string;
    readonly description: string | null;
    readonly isRetakeAllowed: boolean;
    readonly questions: QuestionResponse[];
}
