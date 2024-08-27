import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category, Product } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { productApiActions } from 'src/app/state/product/product.actions';
import { selectProductsOfCategory } from 'src/app/state/product/product.selector';

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
  products = this.store.select(selectProductsOfCategory(this.data.categoryId)).pipe(map(products => products.filter(c => c.productId !== this.data.targetProductId)));

  constructor(private dialogRef: MatDialogRef<ProductMergeDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: ProductMergeDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceProducts: new FormControl(null),
    });
  }

  save() {
    this.store.dispatch(productApiActions.mergeProductsInitiated({
      sourceProductIds: this.form.value.sourceProducts,
      targetProductId: this.data.targetProductId,
    }));

    this.dialogRef.close();
  }
}
