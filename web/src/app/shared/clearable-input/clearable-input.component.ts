import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, FormControlDirective, FormControlName, FormGroupDirective, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'household-clearable-input',
  templateUrl: './clearable-input.component.html',
  styleUrls: ['./clearable-input.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class ClearableInputComponent implements OnInit, ControlValueAccessor {
  @Input() label: string;
  @Input() type: 'text' | 'number' = 'text';

  input: FormControl<string | number>;
  changed: (value: string | number) => void;
  touched: () => void;
  isDisabled: boolean;

  constructor(private injector: Injector, @Self() @Optional() public ngControl: NgControl) {
    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  get value() {
    return this.input.value;
  }

  ngOnInit(): void {
    if (this.ngControl instanceof FormControlName) {
      this.input = this.injector.get(FormGroupDirective).getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      this.input = this.ngControl.form;
    } else {
      this.input = new FormControl();
    }
  }

  writeValue(): void {
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

  clearValue(event: MouseEvent) {
    this.input.reset();
    this.input.markAsTouched();
    event.stopPropagation();
  }
}
