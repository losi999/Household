import { Component, inject } from '@angular/core';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CategoryStore } from '@household/state/category/category-store';
import { categoryApiEvents, categoryEvents } from '@household/state/category/category-events';
import { injectDispatch } from '@ngrx/signals/events';
import { CategoryList } from '@household/app/category/category-list/category-list';

@Component({
  imports: [
    Toolbar,
    MatIconModule,
    MatButtonModule,
    CategoryList,
  ],
  selector: 'household-category-home',
  styleUrl: './category-home.scss',
  templateUrl: './category-home.html',
})
export class CategoryHome {
  readonly categoryStore = inject(CategoryStore);
  private readonly categoryApiEvents = injectDispatch(categoryApiEvents);
  private readonly categoryEvents = injectDispatch(categoryEvents);

  constructor() {
    this.categoryApiEvents.listCategoriesInitiated();
  }

  create() {
    this.categoryEvents.createCategory();
  }
}
