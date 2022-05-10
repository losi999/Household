import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => AutocompleteInputComponent),
    },
  ],
})
export class AutocompleteInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() displayPropertyName: string;
  @Input() filterPropertyName: string;
  @Input() label: string;
  @Input() items: any[];

  form: FormGroup;
  changed: (value: string) => void;
  touched: () => void;
  isDisabled: boolean;
  subs: Subscription;

  constructor() { }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      selected: new FormControl(),
    });

    this.subs = this.form.controls.selected.valueChanges.subscribe((value) => {
      this.changed?.(value);
    });
  }

  writeValue(selected: any): void {
    this.form.setValue({
      selected, 
    });
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
    this.form.reset();
  }

}
