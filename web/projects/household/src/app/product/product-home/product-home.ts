import { Component, inject } from '@angular/core';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductStore } from '@household/state/product/product-store';
import { productApiEvents, productEvents } from '@household/state/product/product-events';
import { injectDispatch } from '@ngrx/signals/events';
import { ProductList } from '@household/app/product/product-list/product-list';

@Component({
  imports: [
    Toolbar,
    MatIconModule,
    MatButtonModule,
    ProductList,
  ],
  selector: 'household-product-home',
  styleUrl: './product-home.scss',
  templateUrl: './product-home.html',
})
export class ProductHome {
  readonly productStore = inject(ProductStore);
  private readonly productApiEvents = injectDispatch(productApiEvents);
  private readonly productEvents = injectDispatch(productEvents);

  constructor() {
    this.productApiEvents.listProductsInitiated();
  }

  onCreate() {
    this.productEvents.createProduct();
  }
}
