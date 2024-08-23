import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { recipientApiActions } from 'src/app/state/recipient/recipient.actions';
import { selectRecipients } from 'src/app/state/recipient/recipient.selector';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-recipient-home',
  templateUrl: './recipient-home.component.html',
  styleUrls: ['./recipient-home.component.scss'],
})
export class RecipientHomeComponent implements OnInit {
  recipients = this.store.select(selectRecipients);

  constructor(private dialogService: DialogService, private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(recipientApiActions.listRecipientsInitiated());
  }

  create() {
    this.dialogService.openCreateRecipientDialog();
  }
}
