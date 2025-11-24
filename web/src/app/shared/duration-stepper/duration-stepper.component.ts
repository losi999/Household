import { Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TimeSlotToTimePipe } from '@household/web/app/shared/pipes/time-slot-to-time.pipe';

@Component({
  selector: 'household-duration-stepper',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    TimeSlotToTimePipe,
  ],
  templateUrl: './duration-stepper.component.html',
  styleUrl: './duration-stepper.component.scss',
})
export class DurationStepperComponent implements FormValueControl<number> {
  value = model(1);

  onSetDuration(diff: number) {
    this.value.update((current) => current + diff);
  }
}
