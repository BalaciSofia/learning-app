export interface AnswerResponse {
  id: number;
  text: string;
}

export interface QuestionResponse {
  id: number;
  text: string;
  type: string;
  answers: AnswerResponse[];
}

export interface ZoneResponse {
  id: number;
  name: string;
  xpReward: number;
  question: QuestionResponse;
}

export interface QuestResponse {
  id: number;
  name: string;
  xpReward: number;
  question?: QuestionResponse; 
}

export interface TreasureResponse {
  id: number;
  name: string;
  xpReward: number;
}

export interface ConquestResponse {
  allZones: ZoneResponse[];
  conqueredZones: ZoneResponse[];
  allQuests: QuestResponse[];     
  conqueredQuests: QuestResponse[];
  allTreasures: TreasureResponse[]; 
  conqueredTreasures: TreasureResponse[];
  totalXp: number;
}

export enum ZoneStatus {
  Locked = 'LOCKED',
  Available = 'AVAILABLE',
  Conquered = 'CONQUERED'
}

export enum ItemStatus {
  Available = 'available',
  Completed = 'completed',
  Locked = 'locked'
}

export interface ZoneViewModel extends ZoneResponse {
  status: ZoneStatus;
  icon: string;
}

export interface QuestViewModel extends QuestResponse {
  status: ItemStatus;
  icon: string;
}

export interface TreasureViewModel extends TreasureResponse {
  status: ItemStatus;
  icon: string;
}

export interface AnswerRequest {
  answerIds: number[];
}

export interface AnswerQuestRequest {
  questId: number;
  answerIds: number[];
  courseId: number;
}

export interface AnswerQuestResponse {
  correct: boolean;
  xpAwarded: number;
  totalXp: number;
}

export interface ClaimTreasureRequest {
  treasureId: number;
  courseId: number;
}

export interface ClaimTreasureResponse {
  totalXp: number;
}