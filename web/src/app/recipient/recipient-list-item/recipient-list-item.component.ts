import { Component, Input } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from 'src/app/shared/catalog-submenu/catalog-submenu.component';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'app-recipient-list-item',
  templateUrl: './recipient-list-item.component.html',
  styleUrls: ['./recipient-list-item.component.scss'],
})
export class RecipientListItemComponent {
  @Input() recipient: Recipient.Response;
  @Input() recipients: Recipient.Response[];
  constructor(
    private recipientService: RecipientService,
    private dialogService: DialogService
    ,
    private bottomSheet: MatBottomSheet) { }

  delete() {
    this.dialogService.openDeleteRecipientDialog(this.recipient).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.recipientService.deleteRecipient(this.recipient.recipientId);
        }
      });
  }

  edit() {
    this.dialogService.openEditRecipientDialog(this.recipient);
  }

  merge() {
    this.dialogService.openMergeRecipientsDialog(this.recipient, this.recipients);
  }

  showMenu() {
    const bottomSheetRef = this.bottomSheet.open<CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult>(CatalogSubmenuComponent, {
      data: this.recipient.name,
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      switch (result) {
        case 'delete': this.delete(); break;
        case 'edit': this.edit(); break;
        case 'merge': this.merge(); break;
      }
    });
  }
}
