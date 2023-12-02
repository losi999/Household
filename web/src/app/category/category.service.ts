import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '@household/shared/types/types';
import { Subject } from 'rxjs';
import { Store } from 'src/app/store';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private refreshList: Subject<void> = new Subject();

  constructor(private httpClient: HttpClient, private store: Store) {
    this.refreshList.subscribe({
      next: () => {
        this.listCategories();
      },
    });
  }

  listCategories(categoryType?: Category.CategoryType['categoryType']): void {
    this.httpClient.get<Category.Response[]>(`${environment.apiUrl}${environment.categoryStage}v1/categories`, {
      params: categoryType ? {
        categoryType,
      } : undefined,
    }).subscribe({
      next: (value) => {
        switch (categoryType) {
          case 'inventory': this.store.inventoryCategories.next(value); break;
          default: this.store.categories.next(value); break;
        }
      },
    });
  }

  getCategoryById(categoryId: Category.Id): void {
    this.httpClient.get<Category.Response>(`${environment.apiUrl}${environment.categoryStage}/v1/categories/${categoryId}`).subscribe({
      next: (value) => {
        this.store.products.next({
          ...this.store.products.value,
          [categoryId]: value.products,
        });
      },
    });
  }

  createCategory(body: Category.Request): void {
    this.httpClient.post<Category.CategoryId>(`${environment.apiUrl}${environment.categoryStage}v1/categories`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateCategory(categoryId: Category.Id, body: Category.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteCategory(categoryId: Category.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}`).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  mergeCategories(categoryId: Category.Id, body: Category.Id[]): void {
    this.httpClient.post(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}/merge`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
