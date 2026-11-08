import { Component, effect, inject, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IconText, ProgressStore, SelectionStore } from '@household/shared-ui';
import { Responses } from '@household/shared/types/responses';
import { productEvents } from '@household/state/product/product-events';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    IconText,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  selector: 'household-product-selector',
  styleUrl: './product-selector.scss',
  templateUrl: './product-selector.html',
})
export class ProductSelector implements FormValueControl<Responses.Product> {
  private readonly productEvents = injectDispatch(productEvents);
  private readonly selectionStore = inject(SelectionStore);
  readonly progressStore = inject(ProgressStore);
  private selectionId: string;

  value = model<Responses.Product>();
  label = input<string>();
  required = input(false);
  items = input<Responses.Product[]>([]);

  constructor() {
    effect(() => {
      const selectedProduct = this.selectionStore.selectedItems()[this.selectionId] as Responses.Product;

      if (selectedProduct) {
        this.value.set(selectedProduct);
      }
    });
  }

  onRemoveProduct() {
    this.value.set(null);
  }

  onSelectProduct() {
    this.selectionId = crypto.randomUUID();
    this.productEvents.selectProduct({
      selectionId: this.selectionId,
      products: this.items(),
    });
  }
}
