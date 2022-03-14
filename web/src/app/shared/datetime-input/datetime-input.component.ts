import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormGroup, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-datetime-input',
  templateUrl: './datetime-input.component.html',
  styleUrls: ['./datetime-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => DatetimeInputComponent)
  }]
})
export class DatetimeInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  form: FormGroup;
  changed: (value: Date) => void;
  touched: () => void;
  isDisabled: boolean;
  subs: Subscription;

  constructor() { }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      date: new FormControl(),
      hour: new FormControl(),
      minute: new FormControl()
    })

    this.subs = this.form.valueChanges.subscribe((value: {
      date: Date;
      hour: number;
      minute: number;
    }) => {
      const newDate = new Date(value.date.getFullYear(), value.date.getMonth(), value.date.getDate(), value.hour, value.minute, 0);
      this.changed(newDate);
    })
  }

  writeValue(date: Date): void {
    if (date) {
      this.form.setValue({
        date,
        hour: date.getHours(),
        minute: date.getMinutes(),
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
