import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { DialogService } from '@household/web/app/shared/dialog.service';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { selectInventoryCategories } from '@household/web/state/category/category.selector';

@Component({
  selector: 'household-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: ['./product-home.component.scss'],
})
export class ProductHomeComponent implements OnInit {
  categories = this.store.select(selectInventoryCategories);

  constructor(private dialogService: DialogService, private store: Store) {
  }

  ngOnInit(): void {
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
  }

  create() {
    this.dialogService.openCreateProductDialog();
  }
}

