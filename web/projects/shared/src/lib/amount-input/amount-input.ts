import { Component, effect, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
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

  signDisabled = input(false);
  signHidden = input(false);
  currency = input('');
  newBalance = input(0);
  label = input('Összeg');
  isPositive = model(true);
  
  matcher = new SignalErrorStateMatcher(this.touched);

  constructor() {
    effect(() => {
      this.matcher.showError.set(this.errors().length > 0);
    });
  }

  inverseValue(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isPositive.set(!this.isPositive());
    this.value.set(this.value() * -1);
  }

}
