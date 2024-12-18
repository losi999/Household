import { CommonModule } from '@angular/common';
import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormGroup, FormControl, NG_VALUE_ACCESSOR, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'household-datetime-input',
  templateUrl: './datetime-input.component.html',
  styleUrls: ['./datetime-input.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DatetimeInputComponent),
    },
  ],
})
export class DatetimeInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  form: FormGroup<{
    date: FormControl<Date>;
    time: FormControl<Date>;
  }>;
  changed: (value: Date) => void;
  touched: () => void;
  isDisabled: boolean;
  private destroyed = new Subject();

  constructor() { }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      date: new FormControl(null, [Validators.required]),
      time: new FormControl(null, [Validators.required]),
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value: {
      date: Date;
      time: Date;
    }) => {
      if (this.form.invalid) {
        this.changed?.(null);
      } else {
        const newDate = new Date(value.date.getFullYear(), value.date.getMonth(), value.date.getDate(), value.time.getHours(), value.time.getMinutes(), 0);
        this.changed?.(newDate);
      }
    });
  }

  writeValue(date: Date): void {
    if (date) {
      this.form.setValue({
        date,
        time: date,
      });
    }
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
