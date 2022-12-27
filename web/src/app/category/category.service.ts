import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '@household/shared/types/types';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private _refreshList: Subject<void> = new Subject();

  get refreshList(): Observable<void> {
    return this._refreshList.asObservable();
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
    this.httpClient.post(`${environment.apiUrl}${environment.categoryStage}v1/categories`, body).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateCategory(categoryId: Category.IdType, body: Category.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}`, body).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteCategory(categoryId: Category.IdType): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}`).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  mergeCategories(categoryId: Category.IdType, body: Category.IdType[]): void {
    this.httpClient.post(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}/merge`, body).subscribe({
      next: () => {
        this._refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
