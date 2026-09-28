export interface StudentSummaryResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SendDuelInvitationRequest {
  challengedStudentId: number;
  testId: number;
}

export type DuelStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed';

export interface DuelInvitationResponse {
  id: number;
  testId: number;
  challengerId: number;
  challengerName: string;
  challengedId: number;
  challengedName: string;
  testTitle: string;
  status: DuelStatus;
  createdAt: string;
  challengerScore?: number | null;
  challengedScore?: number | null;
}

export interface SaveDuelResultRequest {
  correctAnswers: number;
}

export interface DuelResultResponse {
  duelId: number;
  winnerId: number | null;
  winnerName: string | null;
  challengerCorrectAnswers: number;
  challengedCorrectAnswers: number;
  isDraw: boolean;
  completedAt: string;
}

export interface SubmitScoreResponse {
  isCompleted: boolean;
  message: string;
  result?: DuelResultResponse | null;
}

export interface DuelHistoryResponse {
  duelId: number;
  challengerName: string;
  challengedName: string;
  testTitle: string;
  challengerCorrectAnswers: number;
  challengedCorrectAnswers: number;
  winnerId: number | null;
  winnerName: string | null;
  isDraw: boolean;
  completedAt: string;
}
