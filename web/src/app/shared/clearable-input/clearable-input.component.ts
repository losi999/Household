import { CommonModule } from '@angular/common';
import { Component, forwardRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormControlName, FormGroupDirective, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';

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
  @Input() type: 'text' | 'number' = 'text';

  input: FormControl<string | number>;
  changed: (value: string | number) => void;
  touched: () => void;
  isDisabled: boolean;
  private destroyed = new Subject();

  constructor(private injector: Injector) { }

  get value() {
    return this.input.value ?? '';
  }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.input = new FormControl();

    const ngControl = this.injector.get(NgControl) as FormControlName;
    const formControl = this.injector.get(FormGroupDirective).getControl(ngControl);
    const isRequired = formControl.hasValidator(Validators.required);

    if (isRequired) {
      this.input.setValidators(Validators.required);
    }

    this.input.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      if(value) {
        this.changed?.(value);
      } else {
        this.changed?.(undefined);
      }
    });
  }

  writeValue(value: any): void {
    this.input.setValue(value);
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
    event.stopPropagation();
  }
}
