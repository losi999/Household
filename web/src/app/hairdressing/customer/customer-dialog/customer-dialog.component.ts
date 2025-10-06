import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Customer } from '@household/shared/types/types';

export type CustomerDialogData = Customer.Response;
export type CustomerDialogResult = Customer.Request;

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
  constructor(private dialogRef: MatDialogRef<CustomerDialogComponent, CustomerDialogResult>,
    @Inject(MAT_DIALOG_DATA) public customer: CustomerDialogData) { }

  ngOnInit(): void {
    this.rating = this.customer?.rating ?? 3;
    this.form = new FormGroup({
      name: new FormControl(this.customer?.name, [Validators.required]),
      description: new FormControl(this.customer?.description),
      isGroup: new FormControl(this.customer?.isGroup ?? false),
    });
  }

  onSetRating(rating: number) {
    this.rating = rating;
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close({
        name: this.form.value.name,
        description: this.form.value.description?.trim() ?? undefined,
        isGroup: this.form.value.isGroup,
        rating: this.rating,
      });
    }
  }

}
