import { Component } from '@angular/core';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: ['./product-home.component.scss'],
})
export class ProductHomeComponent {
  constructor(private dialogService: DialogService) {
  }

  create() {
    this.dialogService.openCreateProductDialog();
  }
}

