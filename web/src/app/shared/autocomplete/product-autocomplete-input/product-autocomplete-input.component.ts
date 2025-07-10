import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, FormControlDirective, FormControlName, FormGroupDirective, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Category, Product } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { ProductAutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/product-autocomplete-filter.pipe';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectGroupedProducts } from '@household/web/state/product/product.selector';
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

  changed: (value: Product.Response) => void;
  touched: () => void;
  isDisabled: boolean;

  products = this.store.select(selectGroupedProducts);

  constructor(private injector: Injector, private store: Store, @Self() public ngControl: NgControl) {
    ngControl.valueAccessor = this;
  }
  
  optionSelected(input: HTMLInputElement) {
    setTimeout(() => input.blur());
  }

  ngOnInit(): void {
    if (this.ngControl instanceof FormControlName) {
      this.selected = this.injector.get(FormGroupDirective).getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      this.selected = this.ngControl.form;
    }
  }

  writeValue(): void { }

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
