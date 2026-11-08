import { Component, effect, inject, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IconText, ProgressStore, SelectionStore } from '@household/shared-ui';
import { Responses } from '@household/shared/types/responses';
import { categoryEvents } from '@household/state/category/category-events';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    IconText,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  selector: 'household-category-selector',
  styleUrl: './category-selector.scss',
  templateUrl: './category-selector.html',
})
export class CategorySelector implements FormValueControl<Responses.CategoryParent> {
  private readonly categoryEvents = injectDispatch(categoryEvents);
  private readonly selectionStore = inject(SelectionStore);
  readonly progressStore = inject(ProgressStore);
  private selectionId: string;

  value = model<Responses.CategoryParent>();
  label = input<string>();
  required = input(false);
  items = input<Responses.Category[]>([]);

  constructor() {
    effect(() => {
      const selectedCategory = this.selectionStore.selectedItems()[this.selectionId] as Responses.CategoryParent;

      if (selectedCategory) {
        this.value.set(selectedCategory);
      }
    });
  }

  onRemoveCategory() {
    this.value.set(null);
  }

  onSelectCategory() {
    this.selectionId = crypto.randomUUID();
    this.categoryEvents.selectCategory({
      selectionId: this.selectionId,
      categories: this.items(),
    });
  }
}
