import { Component } from '@angular/core';
import { Category } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { CategoryService } from 'src/app/category/category.service';
import { Store } from 'src/app/store';

@Component({
  selector: 'household-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent {
  get categories(): Observable<Category.Response[]> {
    return this.store.categories.asObservable();
  }

  constructor(private store: Store, categoryService: CategoryService) {
    categoryService.listCategories();
  }
}
