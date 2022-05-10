import { Component, Input } from '@angular/core';
import { Recipient } from '@household/shared/types/types';

@Component({
  selector: 'app-recipient-list',
  templateUrl: './recipient-list.component.html',
  styleUrls: ['./recipient-list.component.scss'],
})
export class RecipientListComponent {
  @Input() recipients: Recipient.Response[];

  constructor() { }
}
