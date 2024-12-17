import { Component, Input, OnInit } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from '@household/web/app/shared/catalog-submenu/catalog-submenu.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectRecipientIsInProgress } from '@household/web/state/progress/progress.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';

@Component({
  selector: 'household-recipient-list-item',
  templateUrl: './recipient-list-item.component.html',
  styleUrls: ['./recipient-list-item.component.scss'],
  standalone: false,
})
export class RecipientListItemComponent implements OnInit {
  @Input() recipient: Recipient.Response;
  constructor(
    private store: Store,
    private bottomSheet: MatBottomSheet) { }

  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectRecipientIsInProgress(this.recipient.recipientId));
  }

  delete() {
    this.store.dispatch(dialogActions.deleteRecipient(this.recipient));
  }

  edit() {
    this.store.dispatch(dialogActions.updateRecipient(this.recipient));
  }

  merge() {
    this.store.dispatch(dialogActions.mergeRecipients(this.recipient));
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
