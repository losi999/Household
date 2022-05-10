import { Component, Input } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from 'src/app/shared/catalog-submenu/catalog-submenu.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { RecipientFormComponent, RecipientFormData, RecipientFormResult } from 'src/app/recipient/recipient-form/recipient-form.component';

@Component({
  selector: 'app-recipient-list-item',
  templateUrl: './recipient-list-item.component.html',
  styleUrls: ['./recipient-list-item.component.scss'],
})
export class RecipientListItemComponent {
  @Input() recipient: Recipient.Response;
  constructor(
    private recipientService: RecipientService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet) { }

  delete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Törölni akarod ezt a partnert?',
        content: this.recipient.name,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.recipientService.deleteRecipient(this.recipient.recipientId);
      }
    });
  }

  edit() {
    const dialogRef = this.dialog.open<RecipientFormComponent, RecipientFormData, RecipientFormResult>(RecipientFormComponent, {
      data: this.recipient, 
    });

    dialogRef.afterClosed().subscribe((values) => {
      if (values) {
        this.recipientService.updateRecipient(this.recipient.recipientId, values);
      }
    });
  }

  showMenu() {
    const bottomSheetRef = this.bottomSheet.open<CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult>(CatalogSubmenuComponent, {
      data: this.recipient.name, 
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      switch (result) {
        case 'delete': this.delete(); break;
        case 'edit': this.edit(); break;
      }
    });
  }
}
