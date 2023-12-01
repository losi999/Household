import { Component } from '@angular/core';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss'],
})
export class AccountHomeComponent {
  onlyOpenAccounts: boolean;

  constructor(private dialogService: DialogService) {
    this.onlyOpenAccounts = true;
  }

  create() {
    this.dialogService.openCreateAccountDialog();
  }
}
