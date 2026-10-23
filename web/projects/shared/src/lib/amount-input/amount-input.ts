import { Component, computed, effect, input, model, untracked, viewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { SignalErrorStateMatcher } from '../utils/signal-error-state-matcher';

@Component({
  selector: 'shared-amount-input',
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  templateUrl: './amount-input.html',
  styleUrl: './amount-input.scss',
})
export class AmountInput implements FormValueControl<number> {
  value = model<number>(0);
  
  touched = model<boolean>(false);
  
  required = input(false);
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  private readonly matInput = viewChild.required(MatInput);
  private readonly ngModel = viewChild.required(NgModel);

  signDisabled = input(false);
  signHidden = input(false);
  currency = input('');
  newBalance = input(0);
  label = input('Összeg');
  isPositive = model(true);
  
  // The input never shows the sign, it is only part of the value of the control
  displayValue = computed(() => {
    const value = this.value();

    return value ? Math.abs(value) : value;
  });

  matcher = new SignalErrorStateMatcher(this.touched);

  constructor() {
    effect(() => {
      this.matcher.showError.set(this.errors().length > 0);
      this.touched();

      // The error state is only evaluated when the view is checked, but nothing in the template depends on the
      // touched state, so marking the field as touched would not make the errors appear without this
      this.matInput().updateErrorState();
    });

    // The value always has the sign of the flag, even if the flag is changed from outside
    effect(() => {
      const isPositive = this.isPositive();

      untracked(() => this.value.update(value => this.applySign(value, isPositive)));
    });
  }

  onValueChange(value: number) {
    if (value < 0) {
      // A typed negative number must not stay visible, the sign comes from the flag
      this.ngModel().control.setValue(Math.abs(value), {
        emitViewToModelChange: false,
      });
    }

    this.value.set(this.applySign(value, this.isPositive()));
  }

  inverseValue(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isPositive.set(!this.isPositive());
    this.value.update(value => this.applySign(value, this.isPositive()));
  }

  // Empty and zero values have no sign
  private applySign(value: number, isPositive: boolean) {
    if (!value) {
      return value;
    }

    return isPositive ? Math.abs(value) : -Math.abs(value);
  }

}
