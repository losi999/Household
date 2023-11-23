import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '@household/shared/types/types';
import { ProductService } from 'src/app/product/product.service';

export type ProductMergeDialogData = {
  products: Product.Response[];
  targetProductId: Product.Id;
};

@Component({
  selector: 'app-product-merge-dialog',
  templateUrl: './product-merge-dialog.component.html',
  styleUrls: ['./product-merge-dialog.component.scss'],
})
export class ProductMergeDialogComponent implements OnInit {
  form: FormGroup;

  constructor(private dialogRef: MatDialogRef<ProductMergeDialogComponent, void>,
    private productService: ProductService,
    @Inject(MAT_DIALOG_DATA) public data: ProductMergeDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceProducts: new FormControl(null),
    });
  }

  save() {
    this.productService.mergeProducts(this.data.targetProductId, this.form.value.sourceProducts);

    this.dialogRef.close();
  }
}
