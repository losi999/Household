import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { recipientApiActions } from 'src/app/recipient/recipient.actions';
import { selectRecipients } from 'src/app/recipient/recipient.selector';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-recipient-home',
  templateUrl: './recipient-home.component.html',
  styleUrls: ['./recipient-home.component.scss'],
})
export class RecipientHomeComponent implements OnInit {
  recipients = this.store.select(selectRecipients);

  constructor(private dialogService: DialogService, private recipientService: RecipientService, private store: Store) { }

  ngOnInit(): void {
    this.recipientService.listRecipients_().subscribe((recipients) => {
      this.store.dispatch(recipientApiActions.retrievedRecipientList({
        recipients,
      }));
    });
  }

  create() {
    this.dialogService.openCreateRecipientDialog();
  }
}
