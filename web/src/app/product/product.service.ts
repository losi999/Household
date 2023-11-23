import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category, Product } from '@household/shared/types/types';
import { Subject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

type ProductCreated = {
  action: 'created';
  productId: Product.Id;
  request: Product.Request;
};

type ProductUpdated = {
  action: 'updated';
  productId: Product.Id;
  request: Product.Request;
};

type ProductDeleted = {
  action: 'deleted';
  productId: Product.Id;
};

type ProductsMerged = {
  action: 'merged';
  targetProductId: Product.Id;
  sourceProductIds: Product.Id[];
}
type ProductEvent = ProductCreated | ProductUpdated | ProductDeleted | ProductsMerged;

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private _collectionUpdated: Subject<ProductEvent> = new Subject();

  get collectionUpdated(): Observable<ProductEvent> {
    return this._collectionUpdated.asObservable();
  }

  constructor(private httpClient: HttpClient) { }

  createProduct(categoryId: Category.Id, body: Product.Request): void {
    this.httpClient.post<Product.ProductId>(`${environment.apiUrl}${environment.productStage}v1/categories/${categoryId}/products`, body).subscribe({
      next: (value) => {
        this._collectionUpdated.next({
          action: 'created',
          productId: value.productId,
          request: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateProduct(productId: Product.Id, body: Product.Request): void {
    this.httpClient.put(`${environment.apiUrl}${environment.productStage}v1/products/${productId}`, body).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'updated',
          productId,
          request: body
        })
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteProduct(productId: Product.Id): void {
    this.httpClient.delete(`${environment.apiUrl}${environment.productStage}v1/products/${productId}`).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'deleted',
          productId
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  mergeProducts(productId: Product.Id, body: Product.Id[]): void {
    this.httpClient.post(`${environment.apiUrl}${environment.productStage}v1/products/${productId}/merge`, body).subscribe({
      next: () => {
        this._collectionUpdated.next({
          action: 'merged',
          targetProductId: productId,
          sourceProductIds: body,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
