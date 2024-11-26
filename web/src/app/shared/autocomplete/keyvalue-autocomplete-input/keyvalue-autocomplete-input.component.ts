import { CommonModule } from '@angular/common';
import { Component, forwardRef, Injector, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, FormControlName, FormGroupDirective, NgControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';

@Component({
  selector: 'household-keyvalue-autocomplete-input',
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
  templateUrl: './keyvalue-autocomplete-input.component.html',
  styleUrl: './keyvalue-autocomplete-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => KeyvalueAutocompleteInputComponent),
    },
  ],
})
export class KeyvalueAutocompleteInputComponent implements OnInit, ControlValueAccessor {
  @Input({
    required: true,
  }) label: string;
  @Input({
    required: true,
  }) itemsMap: object;

  selected: FormControl<{
    key: string;
    value: string;
  }>;

  changed: (value: string) => void;
  touched: () => void;
  isDisabled: boolean;

  constructor(private injector: Injector) {
    this.selected = new FormControl();
  }

  ngOnInit(): void {
    const ngControl = this.injector.get(NgControl) as FormControlName;
    const formControl = this.injector.get(FormGroupDirective).getControl(ngControl);
    const isRequired = formControl.hasValidator(Validators.required);

    if (isRequired) {
      this.selected.setValidators(Validators.required);
    }

    this.selected.valueChanges.subscribe((value) => {
      this.changed?.(value?.key);
    });
  }

  writeValue(selected: any): void {
    if (selected) {
      this.selected.setValue({
        key: selected,
        value: this.itemsMap[selected],
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

  displayName = (item: any) => {
    return item?.value;
  };

  clearValue(event: MouseEvent) {
    this.selected.reset();
    this.selected.markAsTouched();
    event.stopPropagation();
  }
}
