import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, FormControlName, FormGroupDirective, NgControl, ReactiveFormsModule, FormControlDirective } from '@angular/forms';
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

  constructor(private injector: Injector, @Self() public ngControl: NgControl) {
    ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    if (this.ngControl instanceof FormControlName) {
      this.selected = this.injector.get(FormGroupDirective).getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      this.selected = this.ngControl.form;
    }
  }

  writeValue(): void {
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
    return this.itemsMap[item];
  };

  clearValue(event: MouseEvent) {
    this.selected.reset();
    this.selected.markAsTouched();
    event.stopPropagation();
  }
}
