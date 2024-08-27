import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category, Product } from '@household/shared/types/types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  constructor(private httpClient: HttpClient) { }

  createProduct(categoryId: Category.Id, body: Product.Request) {
    return this.httpClient.post<Product.ProductId>(`${environment.apiUrl}${environment.productStage}v1/categories/${categoryId}/products`, body);
  }

  updateProduct(productId: Product.Id, body: Product.Request) {
    return this.httpClient.put<Product.ProductId>(`${environment.apiUrl}${environment.productStage}v1/products/${productId}`, body);
  }

  deleteProduct(productId: Product.Id) {
    return this.httpClient.delete(`${environment.apiUrl}${environment.productStage}v1/products/${productId}`);
  }

  mergeProducts(productId: Product.Id, body: Product.Id[]) {
    return this.httpClient.post(`${environment.apiUrl}${environment.productStage}v1/products/${productId}/merge`, body);
  }
}
