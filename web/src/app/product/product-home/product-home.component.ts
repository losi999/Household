import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from '@household/shared/types/types';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CategoryService } from 'src/app/category/category.service';
import { ProductService } from 'src/app/product/product.service';
import { DialogService } from 'src/app/shared/dialog.service';
import { Store } from 'src/app/store';

@Component({
  selector: 'household-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: ['./product-home.component.scss'],
})
export class ProductHomeComponent {
  get categories(): Observable<Category.Response[]> {
    return this.store.categories.asObservable();
  }

  constructor(private store: Store, private productService: ProductService, private categoryService: CategoryService, private dialogService: DialogService) {
    this.categoryService.listCategories('inventory');
  }

  create() {
    // this.dialogService.openCreateProductDialog(this.categories);
  }
}

