import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Category, Product } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from '@household/web/app/shared/catalog-submenu/catalog-submenu.component';
import { Observable } from 'rxjs';
import { selectProductIsInProgress } from '@household/web/state/progress/progress.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';

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
    private bottomSheet: MatBottomSheet) { }

  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectProductIsInProgress(this.product.productId));
  }

  delete() {
    this.store.dispatch(dialogActions.deleteProduct({
      product: this.product,
      categoryId: this.categoryId,
    }));
  }

  edit() {
    this.store.dispatch(dialogActions.updateProduct({
      product: this.product,
      categoryId: this.categoryId,
    }));
  }

  merge() {
    this.store.dispatch(dialogActions.mergeProducts({
      product: this.product,
      categoryId: this.categoryId,
    }));
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
