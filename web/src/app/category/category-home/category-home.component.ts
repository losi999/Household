import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { categoryApiActions } from 'src/app/category/category.actions';
import { CategoryService } from 'src/app/category/category.service';
import { selectCategories } from 'src/app/category/cetegory.selector';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-category-home',
  templateUrl: './category-home.component.html',
  styleUrls: ['./category-home.component.scss'],
})
export class CategoryHomeComponent implements OnInit {
  categories = this.store.select(selectCategories);

  constructor(private dialogService: DialogService, private categoryService: CategoryService, private store: Store) { }

  ngOnInit(): void {
    this.categoryService.listCategories_().subscribe((categories) => {
      this.store.dispatch(categoryApiActions.retrievedCategoryList({
        categories,
      }));
    });
  }

  create() {
    this.dialogService.openCreateCategoryDialog();
  }
}
