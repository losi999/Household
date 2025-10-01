import { CommonModule } from '@angular/common';
import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TimeSlotToTimePipe } from '@household/web/app/shared/time-slot-to-time.pipe';

@Component({
  selector: 'household-duration-stepper',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    TimeSlotToTimePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DurationStepperComponent),
    },
  ],
  templateUrl: './duration-stepper.component.html',
  styleUrl: './duration-stepper.component.scss',
})
export class DurationStepperComponent implements OnInit, ControlValueAccessor {
  changed: (value: number) => void;
  touched: () => void;
  isDisabled: boolean;
  value: number;
  
  ngOnInit(): void {
    this.value = 1;
  }

  onSetDuration(diff: number) {
    this.value += diff;
    this.changed?.(this.value);
  }

  writeValue(value: number): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.changed = fn;
  }
  registerOnTouched(fn: any): void {
    this.touched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

}
