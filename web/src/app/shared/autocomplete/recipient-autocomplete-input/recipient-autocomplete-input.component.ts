import { CommonModule } from '@angular/common';
import { Component, DestroyRef, forwardRef, Injector, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, NgControl, FormControlName, FormGroupDirective, Validators, TouchedChangeEvent } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Recipient } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectRecipientById, selectRecipients } from '@household/web/state/recipient/recipient.selector';
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => RecipientAutocompleteInputComponent),
    },
  ],
})
export class RecipientAutocompleteInputComponent implements OnInit, ControlValueAccessor {
  @Input({
    required: true,
  }) label: string;
  selected: FormControl<Recipient.Response>;

  changed: (value: Recipient.Id) => void;
  touched: () => void;
  isDisabled: boolean;

  recipients = this.store.select(selectRecipients);

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

    this.selected.valueChanges.subscribe((value) => {
      this.changed?.(value?.recipientId);
    });
  }

  writeValue(recipientId: Recipient.Id): void {
    this.store.select(selectRecipientById(recipientId))
      .subscribe((recipient) => {
        this.selected.setValue(recipient);
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
