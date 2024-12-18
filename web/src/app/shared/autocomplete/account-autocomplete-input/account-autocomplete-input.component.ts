import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnChanges, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, FormControlDirective, FormControlName, FormGroupDirective, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Account } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { selectFilteredAccounts } from '@household/web/state/account/account.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-account-autocomplete-input',
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
  templateUrl: './account-autocomplete-input.component.html',
  styleUrl: './account-autocomplete-input.component.scss',
})
export class AccountAutocompleteInputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input({
    required: true,
  }) label: string;
  selected: FormControl<Account.Response>;
  @Input() exclude: Account.Id;

  changed: (value: Account.Id) => void;
  touched: () => void;
  isDisabled: boolean;

  accounts: Observable<Account.Response[]>;

  constructor(private injector: Injector, private store: Store, @Self() public ngControl: NgControl) {
    ngControl.valueAccessor = this;
  }

  ngOnChanges(): void {
    this.accounts = this.store.select(selectFilteredAccounts(this.exclude));
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

  displayName = (item: Account.Response) => {
    return item?.fullName;
  };

  clearValue(event: MouseEvent) {
    this.selected.reset();
    this.selected.markAsTouched();
    event.stopPropagation();
  }
}
