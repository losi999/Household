import { Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { dateToISODateString } from '@household/shared/common/utils';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { Calendar } from '@household/shared/types/types';
import { selectCalendarDay } from '@household/web/state/hairdressing/hairdressing.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

type Value = {
  start: number;
  end: number;
};

@Component({
  selector: 'household-time-range-slider',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => TimeRangeSliderComponent),
    },
  ],
  templateUrl: './time-range-slider.component.html',
  styleUrl: './time-range-slider.component.scss',
})
export class TimeRangeSliderComponent implements OnInit, ControlValueAccessor, OnChanges {
  @Input() min = WORKDAY_START;
  @Input() max = WORKDAY_END;
  @Input() day: Date;
  changed: (value: Value) => void;
  touched: () => void;
  isDisabled: boolean;
  form: FormGroup<{
    start: FormControl<number>;
    end: FormControl<number>;
  }>;

  calendarDay: Observable<Calendar.Day.Response>;

  constructor(private store: Store) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.day) {
      this.calendarDay = this.store.select(selectCalendarDay(dateToISODateString(this.day)));
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      start: new FormControl(null, Validators.required),
      end: new FormControl(null, Validators.required),
    });

    this.form.valueChanges.subscribe(({ start, end }) => {
      this.changed?.({
        start,
        end,
      });
    });
  }
  writeValue({ start, end }: Value): void {
    this.form.setValue({
      start,
      end,
    });
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
