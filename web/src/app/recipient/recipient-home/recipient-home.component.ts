import { Component } from '@angular/core';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-recipient-home',
  templateUrl: './recipient-home.component.html',
  styleUrls: ['./recipient-home.component.scss'],
})
export class RecipientHomeComponent {
  constructor(private dialogService: DialogService) { }

  create() {
    this.dialogService.openCreateRecipientDialog();
  }
}
