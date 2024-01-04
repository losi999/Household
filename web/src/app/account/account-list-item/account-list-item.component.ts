import { Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Account } from '@household/shared/types/types';
import { AccountService } from 'src/app/account/account.service';
import { BottomSubmenuComponent, BottomSubmenuData } from 'src/app/shared/bottom-submenu/bottom-submenu.component';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-account-list-item',
  templateUrl: './account-list-item.component.html',
  styleUrls: ['./account-list-item.component.scss'],
})
export class AccountListItemComponent {
  @Input() account: Account.Response;
  notificationCount: number;

  get balanceTitle(): string {
    switch (this.account.accountType) {
      case 'loan': return this.account.balance >= 0 ? 'Kintlévőség' : 'Tartozás';
      default: return 'Egyenleg';
    }
  }

  constructor(private accountService: AccountService, private dialogService: DialogService,
    private bottomSheet: MatBottomSheet) { }

  delete() {
    this.dialogService.openDeleteAccountDialog(this.account).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.accountService.deleteAccount(this.account.accountId);
        }
      });
  }

  onRightClick(event: PointerEvent) {
    event.preventDefault();
    const bottomSheetRef = this.bottomSheet.open<BottomSubmenuComponent, BottomSubmenuData, string>(BottomSubmenuComponent, {
      data: {
        title: this.account.fullName,
        actions: [
          {
            icon: 'edit',
            text: 'Serkesztés',
            name: 'edit',
          },
          {
            icon: 'delete',
            text: 'Törlés',
            name: 'delete',
          },
        ],
      },
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      switch (result) {
        case 'delete': this.delete(); break;
        case 'edit': this.edit(); break;
      }
    });
  }

  edit() {
    this.dialogService.openEditAccountDialog(this.account);
  }
}
