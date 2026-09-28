import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConquestStore } from '../../services/conquest.store';
import { ConquestMapComponent } from '../../components/conquest-map/conquest-map.component';
import { QuizDialogComponent } from '../../components/quiz-dialog/quiz-dialog.component';
import { ZoneViewModel, ZoneStatus, QuestViewModel, TreasureViewModel, ItemStatus } from '../../models/conquest.model';
import { RoutePaths } from '../../../../app.routes';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-conquest-page',
  standalone: true,
  imports: [CommonModule, ConquestMapComponent, QuizDialogComponent],
  templateUrl: './conquest-page.component.html',
  styleUrls: ['./conquest-page.component.scss']
})
export class ConquestPageComponent implements OnInit {
  readonly store = inject(ConquestStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected readonly courseId = Number(this.route.snapshot.paramMap.get('courseId'));

  readonly zones = this.store.zones;
  readonly quests = this.store.quests;
  readonly treasures = this.store.treasures;
  readonly progress = this.store.progress;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  readonly ItemStatus = ItemStatus;

  selectedZoneForConquest = signal<ZoneViewModel | null>(null);
  selectedQuestForAnswer = signal<QuestViewModel | null>(null);
  isSubmittingAnswer = signal<boolean>(false);

  ngOnInit(): void {
    if (!Number.isInteger(this.courseId) || this.courseId <= 0) {
      this.notificationService.show('Invalid course selected.', 'error');
      this.router.navigate(['/', RoutePaths.courses]);
      return;
    }

    this.store.loadProgress(this.courseId);
  }

  handleZoneSelection(zone: ZoneViewModel): void {
    if (zone.status === ZoneStatus.Locked || zone.status === ZoneStatus.Conquered) {
      return;
    }
    this.selectedZoneForConquest.set(zone);
  }

  handleQuestClick(quest: QuestViewModel): void {
    if (quest.status === ItemStatus.Completed) {
      return;
    }
    this.selectedQuestForAnswer.set(quest);
  }

  handleTreasureSelection(treasure: TreasureViewModel): void {
    if (treasure.status === ItemStatus.Completed) {
      return;
    }

    this.store.claimTreasure(
      { treasureId: treasure.id, courseId: this.courseId },
      () => {
        this.notificationService.show(`Treasure claimed! +${treasure.xpReward} XP`, 'success');
      },
      (errorMsg) => {
        this.notificationService.show(errorMsg || 'Could not claim treasure.', 'error');
      }
    );
  }

  handleAnswerSubmitted(selectedAnswerIds: number[]): void {
    const zone = this.selectedZoneForConquest();
    const quest = this.selectedQuestForAnswer();

    this.isSubmittingAnswer.set(true);

    if (zone) {
      this.store.conquerZone(
        zone,
        this.courseId,
        selectedAnswerIds,
        () => {
          this.isSubmittingAnswer.set(false);
          this.selectedZoneForConquest.set(null);
          this.notificationService.show(`Zone conquered! +${zone.xpReward} XP`, 'success');
        },
        (errorMsg) => {
          this.isSubmittingAnswer.set(false);
          this.notificationService.show(errorMsg, 'error');
        }
      );
    } else if (quest) {
      this.store.answerQuest(
        { questId: quest.id, answerIds: selectedAnswerIds, courseId: this.courseId },
        (response) => {
          this.isSubmittingAnswer.set(false);
          if (response.correct) {
            this.selectedQuestForAnswer.set(null);
            this.notificationService.show(`Quest completed! +${response.xpAwarded} XP`, 'success');
          } else {
            this.notificationService.show('Incorrect answer for quest! Try again', 'error');
          }
        }
      );
    }
  }

  closeDialog(): void {
    if (!this.isSubmittingAnswer()) {
      this.selectedZoneForConquest.set(null);
      this.selectedQuestForAnswer.set(null);
    }
  }
}