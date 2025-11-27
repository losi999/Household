import { JsonPipe } from '@angular/common';
import { Component, effect, input, Input, InputSignal, model, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Field, form, FormValueControl, required, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export class SignalErrorStateMatcher implements ErrorStateMatcher {
  showError = signal(false);

  isErrorState(control: AbstractControl): boolean {
    console.log('matcher', control);
    return control.touched && this.showError();
  }
}

@Component({
  selector: 'household-clearable-input',
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    Field,
    JsonPipe,
  ],
  templateUrl: './clearable-input.component.html',
  styleUrl: './clearable-input.component.scss',
})
export class ClearableInputComponent implements FormValueControl<string | number> {
  errors?: InputSignal<readonly WithOptionalField<ValidationError>[]> = input();
  required?: InputSignal<boolean> = input();

  value = model<string | number>(null);
  @Input() label: string;
  @Input() type: 'text' | 'number' | 'area' = 'text';
  @Input() prefix: string;

  matcher = new SignalErrorStateMatcher();

  private model = signal<string>(null);
  protected form = form(this.model, (path) => {
    required(path, {
      when: () => this.required(),
    });
  }); 
  
  constructor() {
    // effect(() => {
    //   console.log(this.form().value());
    //   this.value.set(this.form().value());
    // });

    effect(() => {
      console.log(this.errors());
      this.matcher.showError.set(this.errors().length > 0);
    });
  }

  onInput(event: InputEvent) {
    const value = (event.target as HTMLInputElement).valueAsNumber || null;
    console.log(value);
    if (value !== null) {
      this.value.set(value);

    }
  }

  onClearValue() {
    this.value.set(null);
    // this.form().value.set(null);
  }
}
