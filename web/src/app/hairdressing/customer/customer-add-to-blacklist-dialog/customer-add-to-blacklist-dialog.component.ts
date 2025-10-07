import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Customer } from '@household/shared/types/types';

export type CustomerAddToBlacklistDialogData = {
  customer: Customer.Response;
  excludedCustomerIds: Customer.Id[];
};

export type CustomerAddToBlacklistDialogResult = Customer.Response[];

@Component({
  standalone: false,  
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
