import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnInit, Self } from '@angular/core';
import { ReactiveFormsModule, ControlValueAccessor, FormControl, NgControl, FormControlName, FormGroupDirective, FormControlDirective } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Recipient } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectRecipients } from '@household/web/state/recipient/recipient.selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-recipient-autocomplete-input',
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
  templateUrl: './recipient-autocomplete-input.component.html',
  styleUrl: './recipient-autocomplete-input.component.scss',
})
export class RecipientAutocompleteInputComponent implements OnInit, ControlValueAccessor {
  @Input({
    required: true,
  }) label: string;
  selected: FormControl<Recipient.Response>;

  changed: (value: Recipient.Response) => void;
  touched: () => void;
  isDisabled: boolean;

  recipients = this.store.select(selectRecipients);

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

  displayName = (item: Recipient.Response) => {
    return item?.name;
  };

  clearValue(event: MouseEvent) {
    this.selected.reset();
    this.selected.markAsTouched();
    event.stopPropagation();
  }

  create(event: MouseEvent) {
    this.store.dispatch(dialogActions.createRecipient());
    event.stopPropagation();
  }
}
