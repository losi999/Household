import { Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Category, Product } from '@household/shared/types/types';
import { ProductService } from 'src/app/product/product.service';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from 'src/app/shared/catalog-submenu/catalog-submenu.component';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-product-list-product-item',
  templateUrl: './product-list-product-item.component.html',
  styleUrls: ['./product-list-product-item.component.scss'],
})
export class ProductListProductItemComponent {
  @Input() product: Product.Response;
  @Input() categoryId: Category.Id;
  constructor(
    private productService: ProductService,
    private dialogService: DialogService,
    private bottomSheet: MatBottomSheet) { }

  delete() {
    this.dialogService.openDeleteProductDialog(this.product).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.productService.deleteProduct(this.product.productId);
        }
      });
  }

  edit() {
    this.dialogService.openEditProductDialog(this.product);
  }

  merge() {
    this.dialogService.openMergeProductsDialog(this.product, this.categoryId);
  }

  showMenu() {
    const bottomSheetRef = this.bottomSheet.open<CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult>(CatalogSubmenuComponent, {
      data: this.product.fullName,
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      switch (result) {
        case 'delete': this.delete(); break;
        case 'edit': this.edit(); break;
        case 'merge': this.merge(); break;
      }
    });
  }
}
