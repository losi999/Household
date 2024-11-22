import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'household-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => AutocompleteInputComponent),
    },
  ],
  standalone: false,
})
export class AutocompleteInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() displayPropertyName: string;
  @Input() filterPropertyName: string;
  @Input() label: string;
  @Input() items: any[];
  @Output() create = new EventEmitter();

  selected: FormControl<any>;

  changed: (value: string) => void;
  touched: () => void;
  isDisabled: boolean;
  private destroyed = new Subject();

  constructor() { }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.selected = new FormControl(),

    this.selected.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value) => {
      this.changed?.(value);
    });
  }

  writeValue(selected: any): void {
    this.selected.setValue(selected);
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

  displayName = (item: any) => {
    return item?.[this.displayPropertyName];
  };

  clearValue() {
    this.selected.reset();
  }

}
