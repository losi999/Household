import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { productApiActions } from '@household/web/state/product/product.actions';
import { selectGroupedProducts } from '@household/web/state/product/product.selector';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';

@Component({
  selector: 'household-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: ['./product-home.component.scss'],
  standalone: false,
})
export class ProductHomeComponent implements OnInit {
  groups = this.store.select(selectGroupedProducts);

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.store.dispatch(productApiActions.listProductsInitiated());
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
  }

  create() {
    this.store.dispatch(dialogActions.createProduct(undefined));
  }
}

