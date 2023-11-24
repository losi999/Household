import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clearable-input',
  templateUrl: './clearable-input.component.html',
  styleUrls: ['./clearable-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ClearableInputComponent),
    },
  ],
})
export class ClearableInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() label: string;
  @Input() type: 'text' | 'number' = 'text';

  form: FormGroup<{
    value: FormControl<string | number>;
  }>;
  changed: (value: string | number) => void;
  touched: () => void;
  isDisabled: boolean;
  subs: Subscription;

  constructor() { }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      value: new FormControl(),
    });

    this.subs = this.form.controls.value.valueChanges.subscribe((value) => {
      if(value) {
        this.changed?.(value);
      } else {
        this.changed?.(undefined);
      }
    });
  }

  writeValue(value: any): void {
    this.form.setValue({
      value,
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

  clearValue() {
    this.form.reset();
  }
}
