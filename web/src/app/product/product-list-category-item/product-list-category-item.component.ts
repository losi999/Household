import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Product } from '@household/shared/types/types';
import { ProductListProductItemComponent } from '@household/web/app/product/product-list-product-item/product-list-product-item.component';

@Component({
  selector: 'household-product-list-category-item',
  templateUrl: './product-list-category-item.component.html',
  styleUrls: ['./product-list-category-item.component.scss'],
  imports: [
    MatListModule,
    ProductListProductItemComponent, 
    MatDividerModule,
  ],
})
export class ProductListCategoryItemComponent {
  @Input() category: Product.GroupedResponse;
  constructor() { }

}
