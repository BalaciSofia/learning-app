import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { TestSummary } from '../../../tests/models/test-summary.model';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './lesson-form.component.html',
  styleUrl: './lesson-form.component.scss'
})
export class LessonFormComponent {

  @Input({ required: true })
form!: FormGroup;

@Input()
lessonTypes: string[] = [];

@Input()
tests: TestSummary[] = [];

@Input()
isSaving = false;

@Input()
title = '';

@Input()
description = '';

@Input()
submitText = 'Save';

@Input()
savingText = 'Saving...';

@Output()
cancel = new EventEmitter<void>();

@Output()
submitForm = new EventEmitter<void>();

}