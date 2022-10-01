import { Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Product } from '@household/shared/types/types';
import { ProductFormComponent, ProductFormData, ProductFormResult } from 'src/app/product/product-form/product-form.component';
import { ProductService } from 'src/app/product/product.service';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from 'src/app/shared/catalog-submenu/catalog-submenu.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-product-list-product-item',
  templateUrl: './product-list-product-item.component.html',
  styleUrls: ['./product-list-product-item.component.scss'],
})
export class ProductListProductItemComponent {
  @Input() product: Product.Response;
  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet) { }

  delete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Törölni akarod ezt a terméket?',
        content: this.product.fullName,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.deleteProduct(this.product.productId);
      }
    });
  }

  edit() {
    const dialogRef = this.dialog.open<ProductFormComponent, ProductFormData, ProductFormResult>(ProductFormComponent, {
      data: this.product,
    });

    dialogRef.afterClosed().subscribe((values) => {
      if (values) {
        this.productService.updateProduct(this.product.productId, values);
      }
    });
  }

  showMenu() {
    const bottomSheetRef = this.bottomSheet.open<CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult>(CatalogSubmenuComponent, {
      data: this.product.fullName,
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      switch (result) {
        case 'delete': this.delete(); break;
        case 'edit': this.edit(); break;
      }
    });
  }
}
