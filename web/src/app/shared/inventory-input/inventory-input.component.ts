import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { unitsOfMeasurement } from '@household/shared/constants';
import { Category, Product, Transaction } from '@household/shared/types/types';
import { Subject, takeUntil } from 'rxjs';
import { AutocompleteModule } from 'src/app/shared/autocomplete/autocomplete.module';
import { ClearableInputComponent } from 'src/app/shared/clearable-input/clearable-input.component';
import { DialogService } from 'src/app/shared/dialog.service';
import { Store } from 'src/app/store';

@Component({
  selector: 'household-inventory-input',
  templateUrl: './inventory-input.component.html',
  styleUrls: ['./inventory-input.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClearableInputComponent,
    AutocompleteModule,
    MatIconModule,
    MatButtonModule,
  ],
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
  @Input() categoryId: Category.Id;
  get products(): Product.Response[] {
    return this.store.products.value[this.categoryId];
  }
  changed: (value: Transaction.Inventory<Product.Response>['inventory']) => void;
  touched: () => void;
  isDisabled: boolean;
  private destroyed = new Subject();
  get unitsOfMeasurement() { return unitsOfMeasurement; }
  constructor(private store: Store, private dialogService: DialogService) { }

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

  createProduct() {
    this.dialogService.openCreateProductDialog(this.categoryId);
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
