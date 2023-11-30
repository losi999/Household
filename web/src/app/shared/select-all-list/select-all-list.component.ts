import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ClearableInputComponent } from 'src/app/shared/clearable-input/clearable-input.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'household-select-all-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule,
    ClearableInputComponent,
  ],
  templateUrl: './select-all-list.component.html',
  styleUrl: './select-all-list.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SelectAllListComponent),
    },
  ],
})
export class SelectAllListComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() items: any[];
  shownItems: any;
  @Input() displayPropertyName: string;
  @Input() keyPropertyName: string;

  changed: (value: any[]) => void;
  touched: () => void;
  isDisabled: boolean;

  filter: FormControl<string>;
  selectionList: FormGroup<{
    [key: string]: FormControl<boolean>;
  }>;

  private destroyed = new Subject();

  ngOnInit(): void {
    this.filter = new FormControl();
    this.selectionList = new FormGroup(this.items.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue[this.keyPropertyName]]: new FormControl(),
      };
    }, {}));

    this.shownItems = this.items;

    this.filter.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      const lowercased = value?.toLowerCase() ?? '';
      this.shownItems = this.items.filter(i => i[this.displayPropertyName]?.toLowerCase().includes(lowercased));
    });

    this.selectionList.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      const selectedItems = Object.entries(value).filter((e) => e[1])
        .map(e => e[0]);

      this.changed?.(selectedItems?.length > 0 ? selectedItems : null);
    });
  }
  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  markAll(check: boolean) {
    const selectedValues = this.shownItems.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue[this.keyPropertyName]]: check,
      };
    }, {});

    this.selectionList.patchValue(selectedValues);
  }

  clearFilter() {
    this.filter.reset();
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
}
