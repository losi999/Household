import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { unitsOfMeasurement } from '@household/shared/constants';
import { Category, Product } from '@household/shared/types/types';
import { ProductService } from 'src/app/product/product.service';

export type ProductFormData = {
  product: Product.Response
  categories: Category.Response[];
};

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  form: FormGroup<{
    brand: FormControl<string>,
    measurement: FormControl<number>,
    unitOfMeasurement: FormControl<typeof unitsOfMeasurement[number]>,
    category: FormControl<Category.Response>,
  }>;
  get unitsOfMeasurement() { return unitsOfMeasurement; }

  constructor(private dialogRef: MatDialogRef<ProductFormComponent, void>,
    private productService: ProductService,
    @Inject(MAT_DIALOG_DATA) public data: ProductFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      brand: new FormControl(this.data.product?.brand, [Validators.required]),
      measurement: new FormControl(this.data.product?.measurement, [Validators.required]),
      unitOfMeasurement: new FormControl(this.data.product?.unitOfMeasurement, [Validators.required]),
      category: new FormControl(null),
    });
  }

  save() {
    if (this.form.valid) {
      const request: Product.Request = {
        brand: this.form.value.brand,
        measurement: this.form.value.measurement,
        unitOfMeasurement: this.form.value.unitOfMeasurement,
      };

      if (this.data.product) {
        this.productService.updateProduct(this.data.product.productId, request);
      } else {
        this.productService.createProduct(this.form.value.category.categoryId, request);
      }

      this.dialogRef.close();
    }

  }
}
