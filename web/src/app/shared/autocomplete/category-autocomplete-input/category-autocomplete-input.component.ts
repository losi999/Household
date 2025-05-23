import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnInit, Self } from '@angular/core';
import { ReactiveFormsModule, ControlValueAccessor, FormControl, NgControl, FormControlName, FormGroupDirective, FormControlDirective } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Category } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { selectCategories, selectCategoriesAsParent, selectInventoryCategories } from '@household/web/state/category/category.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-category-autocomplete-input',
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
  templateUrl: './category-autocomplete-input.component.html',
  styleUrl: './category-autocomplete-input.component.scss',
})
export class CategoryAutocompleteInputComponent implements OnInit, ControlValueAccessor {
  @Input() type: 'regular' | 'inventory' = 'regular';
  @Input({
    required: true,
  }) label: string;
  selected: FormControl<Category.Response>;
  @Input() excludeAsParent: Category.Id;
  @Input() hideNewButton: boolean = false;

  changed: (value: Category.Response) => void;
  touched: () => void;
  isDisabled: boolean;

  categories: Observable<Category.Response[]>;

  constructor(private injector: Injector, private store: Store, @Self() public ngControl: NgControl) {
    ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    if (this.ngControl instanceof FormControlName) {
      this.selected = this.injector.get(FormGroupDirective).getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      this.selected = this.ngControl.form;
    }

    switch(this.type) {
      case 'regular': {
        this.categories = this.excludeAsParent ? this.store.select(selectCategoriesAsParent(this.excludeAsParent)) : this.store.select(selectCategories);
      } break;
      case 'inventory': {
        this.categories = this.store.select(selectInventoryCategories);
      } break;
    }
  }

  writeValue(): void {}

  registerOnChange(fn: any): void {
    this.changed = fn;
  }

  registerOnTouched(fn: any): void {
    this.touched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  displayName = (item: Category.Response) => {
    return item?.fullName;
  };

  clearValue(event: MouseEvent) {
    this.selected.reset();
    this.selected.markAsTouched();
    event.stopPropagation();
  }

  create(event: MouseEvent) {
    this.store.dispatch(dialogActions.createCategory());
    event.stopPropagation();
  }
}
