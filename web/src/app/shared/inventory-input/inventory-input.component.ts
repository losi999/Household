import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { unitsOfMeasurement } from '@household/shared/constants';
import { Product, Transaction } from '@household/shared/types/types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-inventory-input',
  templateUrl: './inventory-input.component.html',
  styleUrls: ['./inventory-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => InventoryInputComponent),
    },
  ],
})
export class InventoryInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  form: FormGroup<{
    product: FormControl<Product.Response>;
    quantity: FormControl<number>;
  }>;
  @Input() products: Product.Response[];
  changed: (value: Transaction.Inventory<Product.Response>['inventory']) => void;
  touched: () => void;
  isDisabled: boolean;
  private destroyed = new Subject();
  get unitsOfMeasurement() { return unitsOfMeasurement; }
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      product: new FormControl(null, [Validators.required]),
      quantity: new FormControl(null, [
        Validators.min(0),
        Validators.required,
      ]),
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value: Transaction.Inventory<Product.Response>['inventory']) => {
      if (this.form.invalid) {
        this.changed?.(undefined);
      } else {
        this.changed?.({
          quantity: value.quantity ?? undefined,
          product: value.product ?? undefined,
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  writeValue(obj: Transaction.Inventory<Product.Response>['inventory']): void {
    if (obj) {
      this.form.patchValue(obj);
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
}
