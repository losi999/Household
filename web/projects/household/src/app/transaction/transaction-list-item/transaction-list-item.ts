import { Component, input } from '@angular/core';
import { Responses } from '@household/shared/types/responses';

@Component({
  imports: [],
  selector: 'household-transaction-list-item',
  styleUrl: './transaction-list-item.scss',
  templateUrl: './transaction-list-item.html',
})
export class TransactionListItem {
  transaction = input.required<Responses.Transaction>();
}
