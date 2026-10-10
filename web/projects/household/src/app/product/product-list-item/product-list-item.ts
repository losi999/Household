import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ProductType } from '@household/shared/enums';
import { productEvents, ProductTreeNode } from '@household/state/product/product-events';
import { ProductStore } from '@household/state/product/product-store';
import { injectDispatch } from '@ngrx/signals/events';

const INDENTATION_REM: Record<ProductType, number> = {
  [ProductType.Generic]: 0,
  [ProductType.Specific]: 1,
  [ProductType.Variant]: 2,
};

@Component({
  imports: [
    MatIconModule,
    MatListModule,
  ],
  selector: 'household-product-list-item',
  styleUrl: './product-list-item.scss',
  templateUrl: './product-list-item.html',
  host: {
    '[style.padding-left.rem]': 'indentation()',
  },
})
export class ProductListItem {
  product = input.required<ProductTreeNode>();
  private productEvents = injectDispatch(productEvents);
  private readonly productStore = inject(ProductStore);

  isDisabled = computed(() => {
    return this.productStore.isInProgress().includes(this.product().productId);
  });

  indentation = computed(() => {
    return INDENTATION_REM[this.product().productType];
  });

  measurement = computed(() => {
    const product = this.product();

    return product.productType === ProductType.Specific ? `${product.measurement} ${product.unitOfMeasurement}` : undefined;
  });

  onShowMenu(): void {
    this.productEvents.openProductListItemSubmenu(this.product());
  }
}
