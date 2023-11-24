import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from '@household/shared/types/types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CategoryService } from 'src/app/category/category.service';
import { ProductService } from 'src/app/product/product.service';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'app-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: ['./product-home.component.scss'],
})
export class ProductHomeComponent implements OnInit, OnDestroy {
  categories: Category.Response[];
  private destroyed = new Subject();

  constructor(private activatedRoute: ActivatedRoute, private productService: ProductService, private categoryService: CategoryService, private dialogService: DialogService) { }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.categories = this.activatedRoute.snapshot.data.categories;

    this.productService.collectionUpdated.pipe(takeUntil(this.destroyed)).subscribe(() => {

      this.categoryService.listCategories('inventory').subscribe({
        next: (categories) => {
          this.categories = categories;
        },
      });
    });
  }

  create() {
    this.dialogService.openCreateProductDialog(this.categories);
  }
}

