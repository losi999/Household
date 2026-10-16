import { Component, computed, inject, input } from '@angular/core';
import { Responses } from '@household/shared/types/responses';
import { MatCardModule } from '@angular/material/card';
import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TransactionType } from '@household/shared/enums';
import { ActivatedRoute } from '@angular/router';
import { transactionApiEvents } from '@household/state/transaction/transaction-events';
import { injectDispatch } from '@ngrx/signals/events';
import { Api } from '@household/shared/types/api';

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    DatePipe,
    DecimalPipe,
    JsonPipe,
  ],
  selector: 'household-transaction-list-item',
  styleUrl: './transaction-list-item.scss',
  templateUrl: './transaction-list-item.html',
})
export class TransactionListItem {
  transaction = input.required<Responses.Transaction>();
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly transactionApiEvents = injectDispatch(transactionApiEvents);

  private readonly accountId: Api.Account.Id;

  currency = computed(() => {
    const transaction = this.transaction();
    switch(transaction.transactionType) {
      case TransactionType.Deferred:
      case TransactionType.Reimbursement: {
        return transaction.payingAccount.currency;
      }
      default: {
        return transaction.account.currency;
      }
    }
  });

  amountColor = computed(() => {
    const transaction = this.transaction();

    switch(transaction.transactionType) {
      case TransactionType.Payment:
      case TransactionType.Split: {
        return transaction.amount < 0 ? 'red' : 'green';
      }
    }

    return '';
  });

  constructor() {
    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Api.Account.Id;
  }
}
