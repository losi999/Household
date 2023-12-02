import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category, Product } from '@household/shared/types/types';
import { Subject } from 'rxjs';
import { CategoryService } from 'src/app/category/category.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private refreshList: Subject<void> = new Subject();

  constructor(private httpClient: HttpClient, categoryService: CategoryService) {
    this.refreshList.subscribe({
      next: () => {
        categoryService.listCategories('inventory');
      },
    });
  }

  createProduct(categoryId: Category.Id, body: Product.Request): void {
    this.httpClient.post<Product.ProductId>(`${environment.apiUrl}${environment.productStage}v1/categories/${categoryId}/products`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateProduct(productId: Product.Id, body: Product.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.productStage}v1/products/${productId}`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteProduct(productId: Product.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.productStage}v1/products/${productId}`).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  mergeProducts(productId: Product.Id, body: Product.Id[]): void {
    this.httpClient.post(`${environment.apiUrl}${environment.productStage}v1/products/${productId}/merge`, body).subscribe({
      next: () => {
        this.refreshList.next();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
