import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { unitsOfMeasurement } from '@household/shared/constants';
import { Product, Transaction } from '@household/shared/types/types';
import { Subscription } from 'rxjs';

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
  form: FormGroup;
  @Input() products: Product.Response[];
  changed: (value: Transaction.Inventory<Product.Response>['inventory']) => void;
  touched: () => void;
  isDisabled: boolean;
  subs: Subscription;
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

    this.subs = this.form.valueChanges.subscribe((value: Transaction.Inventory<Product.Response>['inventory']) => {
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
    this.subs.unsubscribe();
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
