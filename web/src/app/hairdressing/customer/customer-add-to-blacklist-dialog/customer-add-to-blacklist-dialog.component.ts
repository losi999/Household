import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Customer } from '@household/shared/types/types';
import { Store } from '@ngrx/store';

export type CustomerDialogData = Customer.Response;

@Component({
  standalone: false,  
  templateUrl: './customer-add-to-blacklist-dialog.component.html',
  styleUrl: './customer-add-to-blacklist-dialog.component.scss',
})
export class CustomerAddToBlacklistDialogComponent implements OnInit {
  form: FormGroup<{
    customer: FormControl<Customer.Response>;
  }>; 

  constructor(private dialogRef: MatDialogRef<CustomerAddToBlacklistDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public customer: CustomerDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      customer: new FormControl(null, [Validators.required]),
    });
  }

  onSave() {
    console.log(this.form);
  }
}
