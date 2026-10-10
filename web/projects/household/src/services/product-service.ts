import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

@Service()
export class ProductService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);

  listProducts() {
    return this.httpClient.get<Responses.ProductTree[]>(`${this.apiUrl}/product/v1/products`);
  }

  createProduct(body: Requests.Product) {
    return this.httpClient.post<Api.Product.ProductId>(`${this.apiUrl}/product/v1/products`, body);
  }

  updateProduct(productId: Api.Product.Id, body: Requests.Product) {
    return this.httpClient.put<void>(`${this.apiUrl}/product/v1/products/${productId}`, body);
  }

  deleteProduct(productId: Api.Product.Id) {
    return this.httpClient.delete<void>(`${this.apiUrl}/product/v1/products/${productId}`);
  }

  mergeProducts(productId: Api.Product.Id, body: Api.Product.Id[]) {
    return this.httpClient.post<void>(`${this.apiUrl}/product/v1/products/${productId}/merge`, body);
  }
}
