import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Customer } from '@household/shared/types/types';
import { customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { Store } from '@ngrx/store';

export type CustomerDialogData = Customer.Response;

@Component({
  standalone: false,  
  templateUrl: './customer-dialog.component.html',
  styleUrl: './customer-dialog.component.scss',
})
export class CustomerDialogComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    isGroup: FormControl<boolean>;
  }>;
  rating: number;
  constructor(private dialogRef: MatDialogRef<CustomerDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public customer: CustomerDialogData) { }

  ngOnInit(): void {
    this.rating = this.customer?.rating ?? 3;
    this.form = new FormGroup({
      name: new FormControl(this.customer?.name, [Validators.required]),
      description: new FormControl(this.customer?.description),
      isGroup: new FormControl(this.customer?.isGroup),
    });
  }

  onSetRating(rating: number) {
    this.rating = rating;
  }

  onSave() {
    if (this.form.valid) {
      const request: Customer.Request = {
        name: this.form.value.name,
        description: this.form.value.description?.trim() ?? undefined,
        isGroup: this.form.value.isGroup,
        rating: this.rating,
      };
      if (this.customer) {
        this.store.dispatch(customerApiActions.updateCustomerInitiated({
          customerId: this.customer.customerId,
          ...request,
        }));
      } else {
        this.store.dispatch(customerApiActions.createCustomerInitiated(request));
      }

      this.dialogRef.close();
    }
  }

}
