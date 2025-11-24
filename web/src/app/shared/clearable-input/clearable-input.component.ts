import { Component, Input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

/**
 * @deprecated
 */
@Component({
  selector: 'household-clearable-input',
  templateUrl: './clearable-input.component.html',
  styleUrls: ['./clearable-input.component.scss'],
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class ClearableInputComponent implements FormValueControl<string | number> {
  value = model(null);
  @Input() label: string;
  @Input() type: 'text' | 'number' | 'area' = 'text';
  @Input() prefix: string;

  clearValue() {
    this.value.set(null);
  }
}
