import { Component, Input } from '@angular/core';
import { Product } from '@household/shared/types/types';

@Component({
  selector: 'household-product-list-category-item',
  templateUrl: './product-list-category-item.component.html',
  styleUrls: ['./product-list-category-item.component.scss'],
  standalone: false,
})
export class ProductListCategoryItemComponent {
  @Input() category: Product.GroupedResponse;
  constructor() { }

}
