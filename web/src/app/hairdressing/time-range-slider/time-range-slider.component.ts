import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';

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
export class TimeRangeSliderComponent implements OnInit, ControlValueAccessor {
  @Input() min = 29;
  @Input() max = 85;
  changed: (value: Value) => void;
  touched: () => void;
  isDisabled: boolean;
  form: FormGroup<{
    start: FormControl<number>;
    end: FormControl<number>;
  }>;

  constructor() { }

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
