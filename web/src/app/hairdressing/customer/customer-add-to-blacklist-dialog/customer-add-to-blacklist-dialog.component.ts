import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Customer } from '@household/shared/types/types';
import { CustomerAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/customer-autocomplete-input/customer-autocomplete-input.component';

export type CustomerAddToBlacklistDialogData = {
  customer: Customer.Response;
  excludedCustomerIds: Customer.Id[];
};

export type CustomerAddToBlacklistDialogResult = Customer.Response[];

@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    CustomerAutocompleteInputComponent,
  ],
  templateUrl: './customer-add-to-blacklist-dialog.component.html',
  styleUrl: './customer-add-to-blacklist-dialog.component.scss',
})
export class CustomerAddToBlacklistDialogComponent implements OnInit {
  form: FormGroup<{
    customer: FormControl<Customer.Response>;
  }>; 

  constructor(private dialogRef: MatDialogRef<CustomerAddToBlacklistDialogComponent, CustomerAddToBlacklistDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: CustomerAddToBlacklistDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      customer: new FormControl(null, [Validators.required]),
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close([
        this.data.customer,
        this.form.value.customer,
      ]);
    }
  }
}
