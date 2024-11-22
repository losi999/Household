import { Component, Input } from '@angular/core';
import { Recipient } from '@household/shared/types/types';
@Component({
  selector: 'household-recipient-list',
  templateUrl: './recipient-list.component.html',
  styleUrls: ['./recipient-list.component.scss'],
  standalone: false,
})
export class RecipientListComponent {
  @Input() recipients: Recipient.Response[];

  constructor() {}
}
