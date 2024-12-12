import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Injector, Input, OnChanges, OnInit, Self, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormControlDirective, FormControlName, FormGroupDirective, NgControl, ReactiveFormsModule, TouchedChangeEvent, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Account } from '@household/shared/types/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-amount-input',
  templateUrl: './amount-input.component.html',
  styleUrls: ['./amount-input.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class AmountInputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() max = Number.POSITIVE_INFINITY;
  @Input() signDisabled = false;
  @Input() currency: string;
  @Input() newBalance: number;

  account: Observable<Account.Response>;

  amount: FormControl<number>;
  @Input() isPositive = true;

  changed: (value: number) => void;
  touched: () => void;
  validatorChange: () => void;
  isDisabled: boolean;

  constructor(private destroyRef: DestroyRef, private injector: Injector, @Self() public ngControl: NgControl) {
    this.amount = new FormControl();
    ngControl.valueAccessor = this;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.amount?.value) {
      if (changes.isPositive) {
        this.changed?.(this.isPositive ? this.amount.value : this.amount.value * -1);
      }
    }
  }

  ngOnInit(): void {
    this.amount.addValidators(Validators.max(this.max));
    let control: FormControl;
    if (this.ngControl instanceof FormControlName) {
      control = this.injector.get(FormGroupDirective).getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      control = this.ngControl.form;
    }

    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof TouchedChangeEvent) {
        this.amount.markAsTouched();
      }
    });

    if (control.hasValidator(Validators.required)) {
      this.amount.addValidators(Validators.required);
    }

    this.amount.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value < 0) {
        this.isPositive = !this.signDisabled ? false : this.isPositive;
        this.amount.setValue(value * -1);
      } else {
        if (this.amount.valid && value) {
          this.changed?.(this.isPositive ? value : value * -1);
        } else {
          this.changed?.(null);
        }
      }
    });
  }

  writeValue(amount: any): void {
    if (amount) {
      this.isPositive = amount >= 0;
      this.amount.setValue(Math.abs(amount));
    } else {
      this.amount.setValue(null);
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

  inverseValue(event: MouseEvent) {
    this.isPositive = !this.isPositive;
    if (this.amount.value) {
      this.amount.setValue(this.amount.value);
    }
    event.stopPropagation();
  }
}
