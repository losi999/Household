import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { ProductStore } from '@household/state/product/product-store';
import { getParentProductId } from '@household/app/product/product-utils';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

export type ProductMergeDialogData = Responses.Product;
export type ProductMergeDialogResult = {
  targetProductId: Api.Product.Id;
  sourceProductIds: Api.Product.Id[];
};

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatIconModule,
  ],
  styleUrl: './product-merge-dialog.scss',
  templateUrl: './product-merge-dialog.html',
})
export class ProductMergeDialog {
  private dialogRef = inject<MatDialogRef<ProductMergeDialog, ProductMergeDialogResult>>(MatDialogRef);
  public product = inject<ProductMergeDialogData>(MAT_DIALOG_DATA);
  private productStore = inject(ProductStore);

  selectedProducts = signal<Responses.Product[]>([]);
  selectedProductIds = computed(() => {
    return this.selectedProducts().map(p => p.productId);
  });

  // Products can only be merged with their siblings: generic products with each other, specific
  // products of the same generic product, and variant products of the same specific product
  products = computed(() => {
    return this.productStore.productList().filter((p) => {
      const isSibling = p.productType === this.product.productType && getParentProductId(p) === getParentProductId(this.product);
      const isItself = p.productId === this.product.productId;
      const isAlreadySelected = this.selectedProductIds().includes(p.productId);

      return isSibling && !isItself && !isAlreadySelected;
    });
  });

  onAddProduct(product: Responses.Product) {
    this.selectedProducts.update((previous) => {
      return [
        ...previous,
        product,
      ];
    });
  }

  onRemoveProduct(product: Responses.Product) {
    this.selectedProducts.update((previous) => {
      return previous.filter(p => p.productId !== product.productId);
    });
  }

  onSave() {
    if (this.selectedProductIds().length > 0) {
      this.dialogRef.close({
        sourceProductIds: this.selectedProductIds(),
        targetProductId: this.product.productId,
      });
    }
  }
}
