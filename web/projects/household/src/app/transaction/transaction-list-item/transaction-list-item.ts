import { Component, computed, effect, inject, input } from '@angular/core';
import { Responses } from '@household/shared/types/responses';
import { MatCardModule } from '@angular/material/card';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AccountType, TransactionType } from '@household/shared/enums';
import { ActivatedRoute } from '@angular/router';
import { transactionApiEvents } from '@household/state/transaction/transaction-events';
import { injectDispatch } from '@ngrx/signals/events';
import { Api } from '@household/shared/types/api';
import { AccountStore } from '@household/state/account/account-store';
import { IconText } from '@household/shared-ui';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    DatePipe,
    DecimalPipe,
    IconText,
    MatDividerModule,
  ],
  selector: 'household-transaction-list-item',
  styleUrl: './transaction-list-item.scss',
  templateUrl: './transaction-list-item.html',
})
export class TransactionListItem {
  transaction = input.required<Responses.Transaction>();
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly transactionApiEvents = injectDispatch(transactionApiEvents);
  private readonly accountStore = inject(AccountStore);

  private account: Responses.Account;
  private readonly accountId: Api.Account.Id;

  amount = computed(() => {
    const transaction = this.transaction();
    switch(transaction.transactionType) {
      case TransactionType.Transfer:
      case TransactionType.Payment: {
        return transaction.amount;
      }
      case TransactionType.Loan: {
        return transaction.ownerAccount.accountId === this.accountId ? transaction.amount * -1 : transaction.amount;
      }
      case TransactionType.Split: {
        if (transaction.account.accountId === this.accountId) {
          return transaction.amount;
        }

        return transaction.loans.reduce((accumulator, currentValue) => {
          if (currentValue.ownerAccount.accountId === this.accountId) {
            return accumulator - currentValue.amount;
          }

          return accumulator;
        }, 0);
      }
    }
  });

  currency = computed(() => {
    const transaction = this.transaction();
    switch(transaction.transactionType) {
      case TransactionType.Loan: {
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
      case TransactionType.Transfer: {
        if (transaction.account.accountType !== AccountType.Loan) {
          return transaction.amount < 0 ? 'red' : 'green';
        }

        return transaction.amount < 0 ? 'green' : 'red';
      }
      case TransactionType.Loan: {
        if (transaction.payingAccount.accountId === this.accountId && transaction.payingAccount.accountType !== AccountType.Loan) {
          return 'green';
        } 

        return 'red';
      }
    }
  });

  constructor() {
    this.accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Api.Account.Id;

    effect(() => {
      this.account = this.accountStore.accountList().find(a => a.accountId === this.accountId);
      console.log(this.account?.accountType);
    });
  }
}
