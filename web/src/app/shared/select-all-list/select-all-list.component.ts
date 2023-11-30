import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'household-select-all-list',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatListModule,
    MatCheckboxModule,
    ReactiveFormsModule,
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
  @Input() displayPropertyName: string;
  @Input() keyPropertyName: string;

  changed: (value: any[]) => void;
  touched: () => void;
  isDisabled: boolean;

  selected: FormControl<any[]>;
  private destroyed = new Subject();

  ngOnInit(): void {
    this.selected = new FormControl();

    this.selected.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      this.changed?.(value?.length > 0 ? value : null);
    });
  }
  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
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
