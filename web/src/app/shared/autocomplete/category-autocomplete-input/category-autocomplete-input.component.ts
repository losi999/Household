import { CommonModule } from '@angular/common';
import { Component, DestroyRef, forwardRef, Injector, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, NgControl, FormControlName, FormGroupDirective, Validators, TouchedChangeEvent } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Category } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { selectCategories, selectCategoriesAsParent, selectCategoryById, selectInventoryCategories } from '@household/web/state/category/category.selector';
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CategoryAutocompleteInputComponent),
    },
  ],
})
export class CategoryAutocompleteInputComponent implements OnInit, ControlValueAccessor {
  @Input() type: 'regular' | 'inventory' = 'regular';
  @Input({
    required: true,
  }) label: string;
  selected: FormControl<Category.Response>;
  @Input() excludeAsParent: Category.Id;
  @Input() hideNewButton: boolean = false;

  changed: (value: Category.Id) => void;
  touched: () => void;
  isDisabled: boolean;

  categories: Observable<Category.Response[]>;

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

    switch(this.type) {
      case 'regular': {
        this.categories = this.excludeAsParent ? this.store.select(selectCategoriesAsParent(this.excludeAsParent)) : this.store.select(selectCategories);
      } break;
      case 'inventory': {
        this.categories = this.store.select(selectInventoryCategories);
      } break;
    }

    this.selected.valueChanges.subscribe((value) => {
      this.changed?.(value?.categoryId);
    });
  }

  writeValue(categoryId: Category.Id): void {
    if (categoryId) {
      this.store.select(selectCategoryById(categoryId))
        .pipe(takeFirstDefined())
        .subscribe((category) => {
          this.selected.setValue(category, {
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
