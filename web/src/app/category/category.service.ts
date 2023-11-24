import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '@household/shared/types/types';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

type CategoryCreated = {
  action: 'created';
  categoryId: Category.Id;
  request: Category.Request;
};

type CategoryUpdated = {
  action: 'updated';
  categoryId: Category.Id;
  request: Category.Request;
};

type CategoryDeleted = {
  action: 'deleted';
  categoryId: Category.Id;
};

type CategorysMerged = {
  action: 'merged';
  targetCategoryId: Category.Id;
  sourceCategoryIds: Category.Id[];
};
type CategoryEvent = CategoryCreated | CategoryUpdated | CategoryDeleted | CategorysMerged;

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private _collectionUpdated: Subject<CategoryEvent> = new Subject();

  get collectionUpdated(): Observable<CategoryEvent> {
    return this._collectionUpdated.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  listCategories(categoryType?: Category.CategoryType['categoryType']): Observable<Category.Response[]> {
    return this.httpClient.get<Category.Response[]>(`${environment.apiUrl}${environment.categoryStage}v1/categories`, {
      params: categoryType ? {
        categoryType,
      } : undefined,
    });
  }

  createCategory(body: Category.Request): void {
    this.httpClient.post<Category.CategoryId>(`${environment.apiUrl}${environment.categoryStage}v1/categories`, body).subscribe({
      next: (value) => {
        this._collectionUpdated.next({
          action: 'created',
          categoryId: value.categoryId,
          request: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateCategory(categoryId: Category.Id, body: Category.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}`, body).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'updated',
          categoryId,
          request: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteCategory(categoryId: Category.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}`).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'deleted',
          categoryId,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  mergeCategories(categoryId: Category.Id, body: Category.Id[]): void {
    this.httpClient.post(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}/merge`, body).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'merged',
          targetCategoryId: categoryId,
          sourceCategoryIds: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
