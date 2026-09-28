import { AnswerResponse } from './answer-response.model';

export interface QuestionResponse{ 
    readonly id: number; 
    readonly text: string; 
    readonly type: string; 
    readonly answers: AnswerResponse[] 
}