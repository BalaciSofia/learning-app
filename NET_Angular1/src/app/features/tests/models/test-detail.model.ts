import { QuestionResponse } from './question-response.model';

export interface TestDetail {
    readonly id: number;
    readonly title: string;
    readonly description: string | null;
    readonly isRetakeAllowed: boolean;
    readonly isPublished: boolean;
    readonly creatorId: number;
    readonly questions: QuestionResponse[];
}
