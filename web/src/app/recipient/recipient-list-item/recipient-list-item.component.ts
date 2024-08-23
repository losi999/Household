import { Component, Input, OnInit } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from 'src/app/shared/catalog-submenu/catalog-submenu.component';
import { DialogService } from 'src/app/shared/dialog.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { recipientApiActions } from 'src/app/state/recipient/recipient.actions';
import { selectRecipientIsInProgress } from 'src/app/state/progress/progress.selector';

@Component({
  selector: 'household-recipient-list-item',
  templateUrl: './recipient-list-item.component.html',
  styleUrls: ['./recipient-list-item.component.scss'],
})
export class RecipientListItemComponent implements OnInit {
  @Input() recipient: Recipient.Response;
  constructor(
    private store: Store,
    private dialogService: DialogService,
    private bottomSheet: MatBottomSheet) { }

  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectRecipientIsInProgress(this.recipient.recipientId));
  }

  delete() {
    this.dialogService.openDeleteRecipientDialog(this.recipient).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.store.dispatch(recipientApiActions.deleteRecipientInitiated({
            recipientId: this.recipient.recipientId,
          }));
        }
      });
  }

  edit() {
    this.dialogService.openEditRecipientDialog(this.recipient);
  }

  merge() {
    this.dialogService.openMergeRecipientsDialog(this.recipient);
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
