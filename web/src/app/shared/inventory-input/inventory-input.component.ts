import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { unitsOfMeasurement } from '@household/shared/constants';
import { Transaction } from '@household/shared/types/types';
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
  changed: (value: Transaction.Inventory['inventory']) => void;
  touched: () => void;
  isDisabled: boolean;
  subs: Subscription;
  get unitsOfMeasurement() { return unitsOfMeasurement; }
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      brand: new FormControl(null),
      measurement: new FormControl(null, Validators.min(0)),
      quantity: new FormControl(null, Validators.min(0)),
      unitOfMeasurement: new FormControl(null),
    });

    this.subs = this.form.valueChanges.subscribe((value: Transaction.Inventory['inventory']) => {
      if (this.form.invalid) {
        this.changed?.(null);
      } else {
        this.changed?.(value);
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  writeValue(obj: Transaction.Inventory['inventory']): void {
    if (obj) {
      this.form.setValue(obj);
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
