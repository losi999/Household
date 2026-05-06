import { Component, inject, signal } from '@angular/core';
import { form, required, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CustomerAutocompleteInput } from '@hairdressing/app/customer/customer-autocomplete-input/customer-autocomplete-input';
import { Customer } from '@household/shared/types/types';

export type CustomerAddToBlacklistDialogData = Customer.Response;

export type CustomerAddToBlacklistDialogResult = Customer.Response[];

@Component({
  selector: 'hairdressing-customer-add-to-blacklist-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    CustomerAutocompleteInput,
    FormField,
  ],
  templateUrl: './customer-add-to-blacklist-dialog.html',
  styleUrl: './customer-add-to-blacklist-dialog.scss',
})
export class CustomerAddToBlacklistDialog {
  dialogRef = inject<MatDialogRef<CustomerAddToBlacklistDialog, CustomerAddToBlacklistDialogResult>>(MatDialogRef);
  customer = inject<CustomerAddToBlacklistDialogData>(MAT_DIALOG_DATA);

  blacklistModel = signal<Customer.Response>(null);

  blacklistForm = form(this.blacklistModel, (schemaPath) => {
    required(schemaPath, {
      message: 'Kötelező',
    });
  });

  excludedCustomerIds = [
    this.customer.customerId,
    ...this.customer.blacklistedCustomers.map(c => c.customerId),
  ];

  onSave() {
    if (this.blacklistForm().valid()) {
      this.dialogRef.close([
        this.customer,
        this.blacklistForm().value(),
      ]);
    }
  }
}
