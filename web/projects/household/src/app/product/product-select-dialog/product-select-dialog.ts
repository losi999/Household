import { Component, computed, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { hasChildren } from '@household/app/product/product-utils';
import { ClearableInput } from '@household/shared-ui';
import { ProductType } from '@household/shared/enums';
import { search, toSearchTerms } from '@household/shared/common/utils';
import { Responses } from '@household/shared/types/responses';
import { ProductStore } from '@household/state/product/product-store';

export type ProductSelectDialogData = {
  // Every product can be selected by default, the parent of a product has to meet more rules
  isParentSelection?: boolean;
  // The product whose parent is selected, there is none if the parent is selected for a new product
  productToUpdate?: Responses.Product;
};
export type ProductSelectDialogResult = Responses.Product;

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

  searchValue = model<string>('');

  // Only generic and specific products can be parents. When a product is updated, the type of the product
  // cannot change if it has children: a generic product with children cannot get a parent at all, and the
  // parent of a specific product with children can only be a generic product
  selectableProducts = computed(() => {
    const productList = this.productStore.productList();
    const isParentSelection = !!this.data?.isParentSelection;
    const productToUpdate = this.data?.productToUpdate;
    const productToUpdateHasChildren = hasChildren(productList, productToUpdate);

    const canBeParent = (product: Responses.Product) => {
      const isVariant = product.productType === ProductType.Variant;
      const isItself = product.productId === productToUpdate?.productId;
      const isAllowedByChildren = !productToUpdateHasChildren || (productToUpdate.productType === ProductType.Specific && product.productType === ProductType.Generic);

      return !isVariant && !isItself && isAllowedByChildren;
    };

    return productList.filter((product) => {
      return (!isParentSelection || canBeParent(product)) && search({
        searchTerms: toSearchTerms(product.fullName),
      }, this.searchValue());
    });
  });

  onSelect(product: Responses.Product) {
    this.dialogRef.close(product);
  }
}
