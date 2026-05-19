import { Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { HoldableButton } from '@household/shared-ui';

@Component({
  selector: 'hairdressing-duration-stepper',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    TimeSlotToTimePipe,
    HoldableButton,
  ],
  templateUrl: './duration-stepper.html',
  styleUrl: './duration-stepper.scss',
})
export class DurationStepper implements FormValueControl<number> {
  value = model<number>(1);

  onSetDuration(diff: number) {
    const newValue = this.value() + diff;
    this.value.set(Math.min(Math.max(newValue, 1), 96));
  }
}
