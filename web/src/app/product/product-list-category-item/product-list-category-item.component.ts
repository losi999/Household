import { Component, Input } from '@angular/core';
import { Category } from '@household/shared/types/types';

@Component({
  selector: 'household-product-list-category-item',
  templateUrl: './product-list-category-item.component.html',
  styleUrls: ['./product-list-category-item.component.scss'],
})
export class ProductListCategoryItemComponent {
  @Input() category: Category.Response;
  constructor() { }

}
