import { CommonModule } from '@angular/common';
import { Component, DestroyRef, forwardRef, Injector, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormControlName, FormGroupDirective, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, TouchedChangeEvent, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Category, Product } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectProductsOfCategory } from '@household/web/state/product/product.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

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
    AutocompleteFilterPipe,
  ],
  templateUrl: './product-autocomplete-input.component.html',
  styleUrl: './product-autocomplete-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ProductAutocompleteInputComponent),
    },
  ],
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

  products: Observable<Product.Response[]>;

  constructor(private destroyRef: DestroyRef, private injector: Injector, private store: Store) {
    this.selected = new FormControl();
  }

  ngOnInit(): void {
    const ngControl = this.injector.get(NgControl) as FormControlName;
    const formControl = this.injector.get(FormGroupDirective).getControl(ngControl);
    formControl.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if(event instanceof TouchedChangeEvent) {
        this.selected.markAsTouched();
      }
    });
    const isRequired = formControl.hasValidator(Validators.required);

    if (isRequired) {
      this.selected.setValidators(Validators.required);
    }

    this.products = this.store.select(selectProductsOfCategory(this.categoryId));

    this.selected.valueChanges.subscribe((value) => {
      console.log('svc', value);
      this.changed?.(value?.productId);
    });
  }

  writeValue(productId: Product.Id): void {
    console.log('wv', productId);
    // this.store.select(selectProductById(productId))
    //   .subscribe((product) => {
    //     this.selected.setValue(product);
    //   });
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
    console.log('display', item);
    return item?.fullName;
  };

  clearValue(event: MouseEvent) {
    this.selected.reset();
    this.selected.markAsTouched();
    event.stopPropagation();
  }

  create(event: MouseEvent) {
    // this.store.dispatch(dialogActions.createProduct());
    event.stopPropagation();
  }
}
