import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Injector, Input, OnInit, Self } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormControlDirective, FormControlName, FormGroupDirective, NgControl, ReactiveFormsModule, TouchedChangeEvent, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Category, Product } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { ProductAutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/product-autocomplete-filter.pipe';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectGroupedProducts, selectProductById } from '@household/web/state/product/product.selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-product-autocomplete-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    ProductAutocompleteFilterPipe,
    AutocompleteFilterPipe,
  ],
  templateUrl: './product-autocomplete-input.component.html',
  styleUrl: './product-autocomplete-input.component.scss',
})
export class ProductAutocompleteInputComponent implements OnInit, ControlValueAccessor {
  @Input({
    required: true,
  }) label: string;
  @Input() categoryId: Category.Id;

  selected: FormControl<Product.Response>;

  changed: (value: Product.Id) => void;
  touched: () => void;
  isDisabled: boolean;

  products = this.store.select(selectGroupedProducts);

  constructor(private destroyRef: DestroyRef, private injector: Injector, private store: Store, @Self() public ngControl: NgControl) {
    this.selected = new FormControl();
    ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    let control: FormControl;
    if (this.ngControl instanceof FormControlName) {
      control = this.injector.get(FormGroupDirective).getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      control = this.ngControl.form;
    }

    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof TouchedChangeEvent) {
        this.selected.markAsTouched();
      }
    });

    if (control.hasValidator(Validators.required)) {
      this.selected.addValidators(Validators.required);
    }

    this.selected.valueChanges.subscribe((value) => {
      this.changed?.(value?.productId);
    });
  }

  writeValue(productId: Product.Id): void {
    if (productId) {
      this.store.select(selectProductById(productId))
        .pipe(takeFirstDefined())
        .subscribe((product) => {
          this.selected.setValue(product, {
            emitEvent: false,
          });
        });
    } else {
      this.selected.setValue(null, {
        emitEvent: false,
      });
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

  displayName = (item: Product.Response) => {
    return item?.fullName;
  };

  clearValue(event: MouseEvent) {
    this.selected.reset();
    this.selected.markAsTouched();
    event.stopPropagation();
  }

  create(event: MouseEvent) {
    this.store.dispatch(dialogActions.createProduct({
      categoryId: this.categoryId,
    }));
    event.stopPropagation();
  }
}
