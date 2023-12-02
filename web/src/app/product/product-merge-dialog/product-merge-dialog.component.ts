import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category, Product } from '@household/shared/types/types';
import { ProductService } from 'src/app/product/product.service';
import { Store } from 'src/app/store';

export type ProductMergeDialogData = {
  targetProductId: Product.Id;
  categoryId: Category.Id;
};

@Component({
  selector: 'household-product-merge-dialog',
  templateUrl: './product-merge-dialog.component.html',
  styleUrls: ['./product-merge-dialog.component.scss'],
})
export class ProductMergeDialogComponent implements OnInit {
  form: FormGroup<{
    sourceProducts: FormControl<Product.Id[]>
  }>;
  get products(): Product.Response[] {
    return this.store.products.value[this.data.categoryId].filter(p => p.productId !== this.data.targetProductId);
  }

  constructor(private dialogRef: MatDialogRef<ProductMergeDialogComponent, void>,
    private productService: ProductService,
    private store: Store,
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
