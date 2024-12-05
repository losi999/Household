import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'household-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  standalone: false,
})
export class TransactionDetailsComponent implements OnInit {
  transaction: Observable<Transaction.Response>;
  formType: string;

  constructor(private activatedRoute: ActivatedRoute, private store: Store) { }

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    const transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;

    this.store.dispatch(transactionApiActions.getTransactionInitiated({
      accountId,
      transactionId,
    }));

    this.transaction = this.store.select(selectTransaction).pipe(
      takeFirstDefined(),
      tap((transaction) => {
        switch(transaction.transactionType) {
          case 'payment': this.formType = transaction.amount >= 0 ? 'income' : 'payment'; break;
          case 'deferred':
          case 'reimbursement': this.formType = 'loan'; break;
          case 'transfer':
          case 'loanTransfer': this.formType = 'transfer'; break;
          case 'split': this.formType = 'split'; break;
        }
      }));
  }
}
