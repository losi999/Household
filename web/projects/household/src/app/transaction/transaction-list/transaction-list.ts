import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { TransactionListItem } from '@household/app/transaction/transaction-list-item/transaction-list-item';
import { Responses } from '@household/shared/types/responses';

@Component({
  imports: [
    MatListModule,
    TransactionListItem,
  ],
  selector: 'household-transaction-list',
  styleUrl: './transaction-list.scss',
  templateUrl: './transaction-list.html',
})
export class TransactionList {
  transactions = input.required<Responses.Transaction[]>();
}
