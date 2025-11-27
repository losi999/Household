import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { productApiActions } from '@household/web/state/product/product.actions';
import { selectGroupedProducts } from '@household/web/state/product/product.selector';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductListComponent } from '@household/web/app/product/product-list/product-list.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'household-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: ['./product-home.component.scss'],
  imports: [
    ToolbarComponent,
    MatIconModule,
    MatButtonModule,
    ProductListComponent,
    AsyncPipe,
  ],
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

