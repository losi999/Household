import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

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

  amount: FormControl<number>;

  changed: (value: number) => void;
  touched: () => void;
  isDisabled: boolean;
  private destroyed = new Subject();

  constructor() { }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.amount = new FormControl(null, [Validators.required]);

    this.amount.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      this.changed?.(value);
    });
  }

  writeValue(amount: any): void {
    this.amount.setValue(amount);
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
    this.amount.setValue(-1 * this.amount.value);
  }
}
