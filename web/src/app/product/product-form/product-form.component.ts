import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { unitsOfMeasurement } from '@household/shared/constants';
import { Product } from '@household/shared/types/types';

export type ProductFormData = Product.Response;
export type ProductFormResult = Product.Request;

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  get unitsOfMeasurement() { return unitsOfMeasurement; }

  constructor(private dialogRef: MatDialogRef<ProductFormComponent, ProductFormResult>,
    @Inject(MAT_DIALOG_DATA) public product: ProductFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      brand: new FormControl(this.product?.brand, [Validators.required]),
      measurement: new FormControl(this.product?.measurement, [Validators.required]),
      unitOfMeasurement: new FormControl(this.product?.unitOfMeasurement, [Validators.required]),
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close({
        brand: this.form.value.brand,
        measurement: this.form.value.measurement,
        unitOfMeasurement: this.form.value.unitOfMeasurement,
      });
    }
  }
}
