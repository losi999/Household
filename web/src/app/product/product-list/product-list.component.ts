import { Component } from '@angular/core';
import { Category } from '@household/shared/types/types';
import { CategoryService } from 'src/app/category/category.service';
import { Store } from 'src/app/store';

@Component({
  selector: 'household-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent {
  get categories(): Category.Response[] {
    return this.store.inventoryCategories.value;
  }

  constructor(private store: Store, categoryService: CategoryService) {
    categoryService.listCategories('inventory'); }

}
