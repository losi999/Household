import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { DialogService } from 'src/app/shared/dialog.service';
import { categoryApiActions } from 'src/app/state/category/category.actions';
import { selectCategories } from 'src/app/state/category/category.selector';

@Component({
  selector: 'household-category-home',
  templateUrl: './category-home.component.html',
  styleUrls: ['./category-home.component.scss'],
})
export class CategoryHomeComponent implements OnInit {
  categories = this.store.select(selectCategories);

  constructor(private dialogService: DialogService, private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
  }

  create() {
    this.dialogService.openCreateCategoryDialog();
  }
}
