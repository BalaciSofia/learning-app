import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionResponse } from '../../models/conquest.model';

@Component({
  selector: 'app-quiz-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-dialog.component.html',
  styleUrls: ['./quiz-dialog.component.scss']
})
export class QuizDialogComponent {
  @Input({ required: true }) question!: QuestionResponse;
  @Input() isSubmitting = false;

  @Output() submitAnswer = new EventEmitter<number[]>();
  @Output() cancel = new EventEmitter<void>();

  selectedOptionId: number | null = null;

  selectOption(optionId: number): void {
    if (this.isSubmitting) return;
    this.selectedOptionId = optionId;
  }

  onSubmit(): void {
    if (this.selectedOptionId === null || this.isSubmitting) return;
    
    this.submitAnswer.emit([this.selectedOptionId]);
  }

  onClose(): void {
    if (!this.isSubmitting) {
      this.cancel.emit();
    }
  }
}