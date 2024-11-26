import { CommonModule } from '@angular/common';
import { Component, DestroyRef, forwardRef, Injector, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormControlName, FormGroupDirective, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, TouchedChangeEvent, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Account } from '@household/shared/types/types';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { Store } from '@ngrx/store';
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => AmountInputComponent),
    },
  ],
})
export class AmountInputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() max: number = Number.POSITIVE_INFINITY;
  @Input() min: number = Number.NEGATIVE_INFINITY;
  @Input() accountId: Account.Id;
  @Input() showInverse = true;

  account: Observable<Account.Response>;

  amount: FormControl<number>;
  @Input() isPositive = true;

  changed: (value: number) => void;
  touched: () => void;
  isDisabled: boolean;

  constructor(private destroyRef: DestroyRef, private store: Store, private injector: Injector) {
    this.amount = new FormControl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isPositive) {
      this.changed?.(this.isPositive ? this.amount.value : this.amount.value * -1);
    }

    {if (changes.accountId?.currentValue !== changes.accountId?.previousValue) {
      this.account = this.store.select(selectAccountById(this.accountId));
    }}
  }

  ngOnInit(): void {
    const ngControl = this.injector.get(NgControl) as FormControlName;
    const formControl = this.injector.get(FormGroupDirective).getControl(ngControl);
    formControl.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if(event instanceof TouchedChangeEvent) {
        this.amount.markAsTouched();
      }
    });
    const isRequired = formControl.hasValidator(Validators.required);

    if (isRequired) {
      this.amount.setValidators(Validators.required);
    }

    this.amount.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.changed?.(this.isPositive ? value : value * -1);
    });
  }

  writeValue(amount: any): void {
    if (amount) {
      this.isPositive = amount >= 0;
      this.amount.setValue(Math.abs(amount));
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
