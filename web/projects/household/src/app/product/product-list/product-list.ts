import { Component, computed, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { ProductListItem } from '@household/app/product/product-list-item/product-list-item';
import { ProductTreeNode } from '@household/state/product/product-events';
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
  products = input.required<Responses.ProductTree[]>();

  // The tree is displayed as a flat list, each generic product followed by its specific products,
  // each specific product followed by its variants.
  items = computed<ProductTreeNode[]>(() => {
    return this.products().flatMap(generic => [
      generic,
      ...generic.children.flatMap(specific => [
        specific,
        ...specific.children,
      ]),
    ]);
  });
}
