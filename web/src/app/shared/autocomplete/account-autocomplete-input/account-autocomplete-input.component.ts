import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Injector, Input, OnChanges, OnInit, Self } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormControlDirective, FormControlName, FormGroupDirective, NgControl, ReactiveFormsModule, TouchedChangeEvent, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Account } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { selectAccountById, selectFilteredAccounts } from '@household/web/state/account/account.selector';
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

  constructor(private destroyRef: DestroyRef, private injector: Injector, private store: Store, @Self() public ngControl: NgControl) {
    this.selected = new FormControl();
    ngControl.valueAccessor = this;
  }

  ngOnChanges(): void {
    this.accounts = this.store.select(selectFilteredAccounts(this.exclude));
  }

  ngOnInit(): void {
    let control: FormControl;
    if (this.ngControl instanceof FormControlName) {
      control = this.injector.get(FormGroupDirective).getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      control = this.ngControl.form;
    }

    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof TouchedChangeEvent) {
        this.selected.markAsTouched();
      }
    });

    if (control.hasValidator(Validators.required)) {
      this.selected.addValidators(Validators.required);
    }

    this.selected.valueChanges.subscribe((value) => {
      this.changed?.(value?.accountId);
    });
  }

  writeValue(accountId: Account.Id): void {
    if (accountId) {
      this.store.select(selectAccountById(accountId))
        .pipe(takeFirstDefined())
        .subscribe((account) => {
          this.selected.setValue(account, {
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

  displayName = (item: Account.Response) => {
    return item?.fullName;
  };

  clearValue(event: MouseEvent) {
    this.selected.reset();
    this.selected.markAsTouched();
    event.stopPropagation();
  }
}
