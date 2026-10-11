import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { ProductListItem } from '@household/app/product/product-list-item/product-list-item';
import { Responses } from '@household/shared/types/responses';

@Component({
  imports: [
    ProductListItem,
    MatListModule,
  ],
  selector: 'household-product-list',
  styleUrl: './product-list.scss',
  templateUrl: './product-list.html',
})
export class ProductList {
  // The products are displayed in the order they are given, every product is followed by its children
  products = input.required<Responses.Product[]>();
}
