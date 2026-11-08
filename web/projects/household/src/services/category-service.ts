import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

@Service()
export class CategoryService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  listCategories() {
    return this.httpClient.get<Responses.Category[]>(`${this.apiUrl}/category/v1/categories`);
  }
  
  createCategory(body: Requests.Category) {
    return this.httpClient.post<Api.Category.CategoryId>(`${this.apiUrl}/category/v1/categories`, body);
  }
  
  updateCategory(categoryId: Api.Category.Id, body: Requests.Category) {
    return this.httpClient.put<void>(`${this.apiUrl}/category/v1/categories/${categoryId}`, body);
  }
  
  deleteCategory(categoryId: Api.Category.Id) {
    return this.httpClient.delete<void>(`${this.apiUrl}/category/v1/categories/${categoryId}`);
  }

  mergeCategories(categoryId: Api.Category.Id, body: Api.Category.Id[]) {
    return this.httpClient.post<void>(`${this.apiUrl}/category/v1/categories/${categoryId}/merge`, body);
  }
}
