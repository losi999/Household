import { JsonPipe } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Field, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Customer } from '@household/shared/types/types';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';

export type CustomerDialogData = Customer.Response;
export type CustomerDialogResult = Customer.Request;

@Component({
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    ClearableInputComponent,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    Field,
    JsonPipe,
  ],
  templateUrl: './customer-dialog.component.html',
  styleUrl: './customer-dialog.component.scss',
})
export class CustomerDialogComponent implements OnInit {
  formModel = signal<{
    name: string;
    description: string;
    isGroup: boolean;
  }>({
    name: null,
    description: null,
    isGroup: false,
  });
  form2 = form(this.formModel);
  rating2 = signal(3);

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

  // onSetRating(rating: number) {
  //   this.rating = rating;
  // }

  onSave(event: SubmitEvent) {
    event.preventDefault();

    console.log(this.form2().value());
    
    this.dialogRef.close({
      name: this.form2().value().name,
      description: this.form2().value().description?.trim() ?? undefined,
      isGroup: this.form2().value().isGroup,
      rating: this.rating,
    });
  }

}
