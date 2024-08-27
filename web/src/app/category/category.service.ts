import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

  constructor(private httpClient: HttpClient) { }

  listCategories(): Observable<Category.Response[]> {
    return this.httpClient.get<Category.Response[]>(`${environment.apiUrl}${environment.categoryStage}v1/categories`);
  }

  getCategoryById(categoryId: Category.Id) {
    return this.httpClient.get<Category.Response>(`${environment.apiUrl}${environment.categoryStage}/v1/categories/${categoryId}`);
  }

  createCategory(body: Category.Request) {
    return this.httpClient.post<Category.CategoryId>(`${environment.apiUrl}${environment.categoryStage}v1/categories`, body);
  }

  updateCategory(categoryId: Category.Id, body: Category.Request) {
    return this.httpClient.put<Category.CategoryId>(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}`, body);
  }

  deleteCategory(categoryId: Category.Id) {
    return this.httpClient.delete(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}`);
  }

  mergeCategories(categoryId: Category.Id, body: Category.Id[]) {
    return this.httpClient.post(`${environment.apiUrl}${environment.categoryStage}v1/categories/${categoryId}/merge`, body);
  }
}
