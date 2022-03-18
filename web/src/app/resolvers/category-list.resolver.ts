import { Injectable } from '@angular/core';
import {
  Resolve
} from '@angular/router';
import { Category } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { CategoryService } from 'src/app/category/category.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryListResolver implements Resolve<Category.Response[]> {
  constructor(private categoryService: CategoryService) { }

  resolve(): Observable<Category.Response[]> {
    return this.categoryService.listCategories();
  }
}
