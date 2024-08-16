import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { categoryApiActions } from 'src/app/category/category.actions';
import { CategoryService } from 'src/app/category/category.service';
import { selectInventoryCategories } from 'src/app/category/cetegory.selector';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: ['./product-home.component.scss'],
})
export class ProductHomeComponent implements OnInit {
  categories = this.store.select(selectInventoryCategories);

  constructor(private dialogService: DialogService, private categoryService: CategoryService, private store: Store) {
  }

  ngOnInit(): void {
    this.categoryService.listCategories_().subscribe((categories) => {
      this.store.dispatch(categoryApiActions.retrievedCategoryList({
        categories,
      }));
    });
  }

  create() {
    this.dialogService.openCreateProductDialog();
  }
}

