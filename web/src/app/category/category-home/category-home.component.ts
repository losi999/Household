import { Component } from '@angular/core';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-category-home',
  templateUrl: './category-home.component.html',
  styleUrls: ['./category-home.component.scss'],
})
export class CategoryHomeComponent {
  constructor(private dialogService: DialogService) { }

  create() {
    this.dialogService.openCreateCategoryDialog();
  }
}
