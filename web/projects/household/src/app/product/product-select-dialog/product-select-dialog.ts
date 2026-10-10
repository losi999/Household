import { Component, computed, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { getProductName } from '@household/app/product/product-name';
import { ClearableInput } from '@household/shared-ui';
import { ProductType } from '@household/shared/enums';
import { search, toSearchTerms } from '@household/shared/common/utils';
import { ProductTreeNode } from '@household/state/product/product-events';
import { ProductStore } from '@household/state/product/product-store';

export type ProductSelectDialogData = {
  productToUpdate?: ProductTreeNode;
};
export type ProductSelectDialogResult = ProductTreeNode;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    ClearableInput,
  ],
  styleUrl: './product-select-dialog.scss',
  templateUrl: './product-select-dialog.html',
})
export class ProductSelectDialog {
  private dialogRef = inject<MatDialogRef<ProductSelectDialog, ProductSelectDialogResult>>(MatDialogRef);
  public data = inject<ProductSelectDialogData>(MAT_DIALOG_DATA);
  private productStore = inject(ProductStore);

  readonly getName = getProductName;

  searchValue = model<string>('');

  // Only generic and specific products can be parents. When a product is updated, the type of the product
  // cannot change if it has children: a generic product with children cannot get a parent at all, and the
  // parent of a specific product with children can only be a generic product
  selectableProducts = computed<ProductTreeNode[]>(() => {
    const productToUpdate = this.data?.productToUpdate;
    const hasChildren = !!productToUpdate && productToUpdate.productType !== ProductType.Variant && productToUpdate.children.length > 0;

    return this.productStore.productList()
      .flatMap(generic => [
        generic,
        ...generic.children,
      ])
      .filter((product) => {
        const isItself = product.productId === productToUpdate?.productId;
        const isAllowedByChildren = !hasChildren || (productToUpdate.productType === ProductType.Specific && product.productType === ProductType.Generic);

        return !isItself && isAllowedByChildren && search({
          searchTerms: toSearchTerms(getProductName(product)),
        }, this.searchValue());
      });
  });

  onSelect(product: ProductTreeNode) {
    this.dialogRef.close(product);
  }
}
