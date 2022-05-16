import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-amount-input',
  templateUrl: './amount-input.component.html',
  styleUrls: ['./amount-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => AmountInputComponent),
    },
  ],
})
export class AmountInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() currency: string;

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
      amount: new FormControl(null, [Validators.required]),
    });

    this.subs = this.form.controls.amount.valueChanges.subscribe((value) => {
      this.changed?.(value);
    });
  }

  writeValue(amount: any): void {
    this.form.setValue({
      amount,
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

  inverseValue() {
    this.form.setValue({
      amount: -1 * this.form.value.amount,
    });
  }
}
