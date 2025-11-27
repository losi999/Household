import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { selectRecipients } from '@household/web/state/recipient/recipient.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecipientListComponent } from '@household/web/app/recipient/recipient-list/recipient-list.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'household-recipient-home',
  templateUrl: './recipient-home.component.html',
  styleUrls: ['./recipient-home.component.scss'],
  imports: [
    ToolbarComponent,
    MatButtonModule,
    MatIconModule,
    RecipientListComponent,
    AsyncPipe,
  ],
})
export class RecipientHomeComponent implements OnInit {
  recipients = this.store.select(selectRecipients);

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(recipientApiActions.listRecipientsInitiated());
  }

  create() {
    this.store.dispatch(dialogActions.createRecipient());
  }
}
