import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Api } from '@household/shared/types/api';
import { ProductType } from '@household/shared/enums';
import { ProductTreeNode } from '@household/state/product/product-events';
import { ProductStore } from '@household/state/product/product-store';
import { getProductName } from '@household/app/product/product-name';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

export type ProductMergeDialogData = ProductTreeNode;
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

  selectedProducts = signal<ProductTreeNode[]>([]);
  selectedProductIds = computed(() => {
    return this.selectedProducts().map(p => p.productId);
  });

  // Products can only be merged with their siblings: generic products with each other, specific
  // products of the same generic product, and variant products of the same specific product
  siblings = computed<ProductTreeNode[]>(() => {
    const productList = this.productStore.productList();

    switch (this.product.productType) {
      case ProductType.Generic: {
        return productList;
      }
      case ProductType.Specific: {
        const parent = productList.find(generic => generic.children.some(specific => specific.productId === this.product.productId));

        return parent?.children ?? [];
      }
      case ProductType.Variant: {
        const parent = productList.flatMap(generic => generic.children).find(specific => specific.children.some(variant => variant.productId === this.product.productId));

        return parent?.children ?? [];
      }
    }
  });

  products = computed(() => {
    return this.siblings().filter((p) => {
      const isItself = p.productId === this.product.productId;
      const isAlreadySelected = this.selectedProductIds().includes(p.productId);

      return !isItself && !isAlreadySelected;
    });
  });

  readonly getName = getProductName;

  onAddProduct(product: ProductTreeNode) {
    this.selectedProducts.update((previous) => {
      return [
        ...previous,
        product,
      ];
    });
  }

  onRemoveProduct(product: ProductTreeNode) {
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
