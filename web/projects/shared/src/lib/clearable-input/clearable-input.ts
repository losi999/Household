import { Component, effect, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { SignalErrorStateMatcher } from '../utils/signal-error-state-matcher';

@Component({
  selector: 'shared-clearable-input',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './clearable-input.html',
  styleUrls: ['./clearable-input.scss'],
})
export class ClearableInput implements FormValueControl<string| number> {
  type = input<'text' | 'number' | 'area'>('text');
  prefix = input<string>('');
  value = model<string | number>('');

  touched = model<boolean>(false);

  required = input(false);
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  label = input.required<string>();

  matcher = new SignalErrorStateMatcher(this.touched);

  constructor() {
    effect(() => {
      this.matcher.showError.set(this.errors().length > 0);
    });
  }

  onClearValue(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.touched.set(true);
    this.value.set('');
  }
}
