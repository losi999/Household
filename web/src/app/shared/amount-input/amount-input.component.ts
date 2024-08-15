import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'household-amount-input',
  templateUrl: './amount-input.component.html',
  styleUrls: ['./amount-input.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => AmountInputComponent),
    },
  ],
})
export class AmountInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() max: number = Number.POSITIVE_INFINITY;
  @Input() min: number = Number.NEGATIVE_INFINITY;
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
    this.amount = new FormControl(null);

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
