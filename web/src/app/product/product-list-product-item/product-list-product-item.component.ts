import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Category, Product } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from '@household/web/app/shared/catalog-submenu/catalog-submenu.component';
import { DialogService } from '@household/web/app/shared/dialog.service';
import { productApiActions } from '@household/web/state/product/product.actions';
import { Observable } from 'rxjs';
import { selectProductIsInProgress } from '@household/web/state/progress/progress.selector';

@Component({
  selector: 'household-product-list-product-item',
  templateUrl: './product-list-product-item.component.html',
  styleUrls: ['./product-list-product-item.component.scss'],
  standalone: false,
})
export class ProductListProductItemComponent implements OnInit {
  @Input() product: Product.Response;
  @Input() categoryId: Category.Id;

  constructor(
    private store: Store,
    private dialogService: DialogService,
    private bottomSheet: MatBottomSheet) { }

  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectProductIsInProgress(this.product.productId));
  }

  delete() {
    this.dialogService.openDeleteProductDialog(this.product).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.store.dispatch(productApiActions.deleteProductInitiated({
            productId: this.product.productId,
            categoryId: this.categoryId,
          }));
        }
      });
  }

  edit() {
    this.dialogService.openEditProductDialog(this.product, this.categoryId);
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
