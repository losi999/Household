import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { selectCategories } from '@household/web/state/category/category.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryListComponent } from '@household/web/app/category/category-list/category-list.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'household-category-home',
  templateUrl: './category-home.component.html',
  styleUrls: ['./category-home.component.scss'],
  imports: [
    ToolbarComponent,
    MatButtonModule,
    MatIconModule,
    CategoryListComponent,
    AsyncPipe,
  ],
})
export class CategoryHomeComponent implements OnInit {
  categories = this.store.select(selectCategories);

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
  }

  create() {
    this.store.dispatch(dialogActions.createCategory());
  }
}
