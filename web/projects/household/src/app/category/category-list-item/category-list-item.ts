import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Responses } from '@household/shared/types/responses';
import { categoryEvents } from '@household/state/category/category-events';
import { CategoryStore } from '@household/state/category/category-store';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    MatButtonModule,
    MatListModule,
    MatIconModule,
  ],
  selector: 'household-category-list-item',
  styleUrl: './category-list-item.scss',
  templateUrl: './category-list-item.html',
})
export class CategoryListItem {
  category = input.required<Responses.Category>();
  private categoryEvents = injectDispatch(categoryEvents);
  private readonly categoryStore = inject(CategoryStore);
  
  isDisabled = computed(() => {
    return this.categoryStore.isInProgress().includes(this.category().categoryId);
  });
  
  onShowMenu() {
    this.categoryEvents.openCategoryListItemSubmenu(this.category());
  }
}
