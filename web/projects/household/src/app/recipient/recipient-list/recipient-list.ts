import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RecipientListItem } from '@household/app/recipient/recipient-list-item/recipient-list-item';
import { Responses } from '@household/shared/types/responses';

@Component({
  imports: [
    RecipientListItem,
    MatListModule,
  ],
  selector: 'household-recipient-list',
  styleUrl: './recipient-list.scss',
  templateUrl: './recipient-list.html',
})
export class RecipientList {
  recipients = input.required<Responses.Recipient[]>();
}
