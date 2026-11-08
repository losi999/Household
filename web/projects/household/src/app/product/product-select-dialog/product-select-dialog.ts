import { Component, computed, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ClearableInput } from '@household/shared-ui';
import { search } from '@household/shared/common/utils';
import { Responses } from '@household/shared/types/responses';
import { ProductStore } from '@household/state/product/product-store';
import { Searchable } from '@household/shared/types/common';

export type ProductSelectDialogData = Searchable<Responses.Product>[];
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

  selectableProducts = computed(() => {
    const productList = this.data ?? this.productStore.productList();

    if (!this.searchValue()) {
      return productList;
    }

    return productList.filter((product) => {
      return search(product, this.searchValue());
    });
  });

  onSelect(product: Responses.Product) {
    this.dialogRef.close(product);
  }
}
