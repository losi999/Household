import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { DialogService } from '@household/web/app/shared/dialog.service';
import { selectTransactionIsInProgress } from '@household/web/state/progress/progress.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-account-transactions-list-item',
  templateUrl: './account-transactions-list-item.component.html',
  styleUrls: ['./account-transactions-list-item.component.scss'],
  standalone: false,
})
export class AccountTransactionsListItemComponent implements OnInit {
  @Input() transaction: Transaction.Response;

  showYear: boolean;
  amount: number;
  isDisabled: Observable<boolean>;
  viewingAccount: Account.Response;
  formType: 'payment' | 'income' | 'split' | 'loan' | 'transfer';

  viewingAccountId: Account.Id;

  constructor(private activatedRoute: ActivatedRoute, private dialogService: DialogService, private store: Store) { }

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectTransactionIsInProgress(this.transaction.transactionId));
    this.showYear = !this.transaction.issuedAt.startsWith(new Date().getFullYear()
      .toString());
    this.viewingAccountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;

    switch (this.transaction.transactionType) { // TODO
      case 'payment': {
        this.viewingAccount = this.transaction.account;
        this.formType = this.transaction.amount >= 0 ? 'income' : 'payment';
        this.amount = this.transaction.amount;
      } break;
      case 'transfer': {
        this.formType = 'transfer';
        this.viewingAccount = this.transaction.account;
        this.amount = this.transaction.amount;
      } break;
      case 'deferred': {
        this.formType = 'loan';
        if (this.transaction.payingAccount.accountId === this.viewingAccountId) {
          this.viewingAccount = this.transaction.payingAccount;
        } else {
          this.viewingAccount = this.transaction.ownerAccount;
        }
        this.amount = this.transaction.payingAccount.accountId === this.viewingAccountId || this.viewingAccount.accountType === 'loan' ? this.transaction.amount : undefined;
      } break;
      case 'reimbursement': {
        this.formType = 'loan';
        if (this.transaction.payingAccount.accountId === this.viewingAccountId) {
          this.viewingAccount = this.transaction.payingAccount;
          this.amount = this.transaction.amount;
        } else {
          this.viewingAccount = this.transaction.ownerAccount;
        }
      } break;
      case 'split': {
        this.formType = 'split';
        if (this.transaction.account.accountId === this.viewingAccountId) {
          this.viewingAccount = this.transaction.account;
          this.amount = this.transaction.amount;
        } else {
          this.viewingAccount = this.transaction.deferredSplits[0].ownerAccount;
          if (this.viewingAccount.accountType === 'loan') {
            this.amount = this.transaction.deferredSplits.reduce((accumulator, currentValue) => {
              return accumulator - currentValue.amount;
            }, 0);
          }
        }
      } break;
    }
  }

  delete() {
    this.dialogService.openDeleteTransactionDialog().afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.store.dispatch(transactionApiActions.deleteTransactionInitiated({
            transactionId: this.transaction.transactionId,
          }));
        }
      });
  }
}
