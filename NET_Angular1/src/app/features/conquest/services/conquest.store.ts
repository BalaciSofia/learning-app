import { Injectable, inject, signal, computed } from '@angular/core';
import { ConquestApiService } from './conquest-api.service';
import {
  ConquestResponse,
  ZoneResponse,
  ZoneStatus,
  ZoneViewModel,
  AnswerQuestRequest,
  ClaimTreasureRequest,
  AnswerQuestResponse,
  ClaimTreasureResponse,
  AnswerRequest,
  QuestViewModel,
  TreasureViewModel,
  ItemStatus
} from '../models/conquest.model';
import { finalize } from 'rxjs';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root'
})
export class ConquestStore {
  private apiService = inject(ConquestApiService);

  private progressSignal = signal<ConquestResponse | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  readonly progress = this.progressSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly zones = computed<ZoneViewModel[]>(() => {
    const prog = this.progressSignal();

    if (!prog || !prog.allZones || prog.allZones.length === 0) {
      return [];
    }

    const conqueredIds = new Set((prog.conqueredZones || []).map(z => z.id));
    let foundFirstUnconquered = false;

    const icons = ['🏰', '🏯', '⛩️', '🏛️', '🗼', '🛡️', '⚔️'];

    return prog.allZones.map((zone, index) => {
      const isConquered = conqueredIds.has(zone.id);
      let status: ZoneStatus = ZoneStatus.Locked;

      if (isConquered) {
        status = ZoneStatus.Conquered;
      } else if (!foundFirstUnconquered) {
        status = ZoneStatus.Available;
        foundFirstUnconquered = true;
      } else {
        status = ZoneStatus.Locked;
      }

      return {
        ...zone,
        status,
        icon: icons[index % icons.length]
      };
    });
  });
  readonly quests = computed<QuestViewModel[]>(() => {
    const prog = this.progressSignal();
    if (!prog || !prog.allQuests) return [];

    const completedIds = new Set((prog.conqueredQuests || []).map(q => q.id));

    return prog.allQuests.map((quest) => ({
      ...quest,
      status: completedIds.has(quest.id) ? ItemStatus.Completed : ItemStatus.Available,
      icon: '📜'
    }));
  });

  readonly treasures = computed<TreasureViewModel[]>(() => {
    const prog = this.progressSignal();
    if (!prog || !prog.allTreasures) return [];

    const claimedIds = new Set((prog.conqueredTreasures || []).map(t => t.id));

    return prog.allTreasures.map((treasure) => ({
      ...treasure,
      status: claimedIds.has(treasure.id) ? ItemStatus.Completed : ItemStatus.Available,
      icon: '💎'
    }));
  });

  loadProgress(courseId: number): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.apiService.getProgress(courseId)
      .pipe(finalize(() => this.isLoadingSignal.set(false)))
      .subscribe({
        next: (data) => this.progressSignal.set(data),
        error: (err) => {
          this.errorSignal.set('Error on map loading.');
        }
      });
  }

  conquerZone(
    zone: ZoneViewModel,
    courseId: number,
    answerIds: number[],
    onSuccess: () => void,
    onErrorToast: (msg: string) => void
  ): void {
    const currentProgress = this.progressSignal();
    if (!currentProgress) return;

    const payload: AnswerRequest = { answerIds };

    this.apiService.conquerZone(courseId, zone.id, payload).subscribe({
      next: (updatedXp) => {
        const previousConquered = [...(currentProgress.conqueredZones || [])];
        const newConqueredZone: ZoneResponse = {
          id: zone.id,
          name: zone.name,
          xpReward: zone.xpReward,
          question: zone.question
        };

        const updatedConquered = [...previousConquered, newConqueredZone];

        this.progressSignal.set({
          ...currentProgress,
          conqueredZones: updatedConquered,
          totalXp: updatedXp
        });

        const totalZones = currentProgress.allZones?.length || 0;
        if (totalZones > 0 && updatedConquered.length === totalZones) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
          });
        }

        onSuccess();
      },
      error: (err) => {
        if (err.status === 400) {
          onErrorToast('Incorrect answer! Try again');
        } else {
          onErrorToast('Network error occured.');
        }
      }
    });
  }

  answerQuest(payload: AnswerQuestRequest, onComplete: (res: AnswerQuestResponse) => void): void {
    this.apiService.answerQuest(payload).subscribe({
      next: (response) => {
        const state = this.progressSignal();
        if (state && response.correct) {
          const questObj = state.allQuests?.find(q => q.id === payload.questId);
          const conqueredQuests = [...(state.conqueredQuests || [])];
          if (questObj && !conqueredQuests.some(q => q.id === questObj.id)) {
            conqueredQuests.push(questObj);
          }
          this.progressSignal.set({
            ...state,
            conqueredQuests,
            totalXp: response.totalXp
          });
        }
        onComplete(response);
      },
    });
  }

  claimTreasure(
    payload: ClaimTreasureRequest,
    onComplete: (res: ClaimTreasureResponse) => void,
    onErrorToast?: (msg: string) => void
  ): void {
    this.apiService.claimTreasure(payload).subscribe({
      next: (response) => {
        const state = this.progressSignal();
        if (state) {
          const treasureObj = state.allTreasures?.find(t => t.id === payload.treasureId);
          const conqueredTreasures = [...(state.conqueredTreasures || [])];
          if (treasureObj && !conqueredTreasures.some(t => t.id === treasureObj.id)) {
            conqueredTreasures.push(treasureObj);
          }
          this.progressSignal.set({
            ...state,
            conqueredTreasures,
            totalXp: response.totalXp
          });
        }
        onComplete(response);
      },
      error: () => {
        if (onErrorToast) {
          onErrorToast('Could not claim treasure.');
        }
      }
    });
  }

}