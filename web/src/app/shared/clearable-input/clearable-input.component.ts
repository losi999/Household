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

  form: FormGroup;
  changed: (value: string) => void;
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
      this.changed?.(value);
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
