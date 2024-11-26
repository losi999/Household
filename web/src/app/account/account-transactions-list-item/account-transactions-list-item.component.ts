import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
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

  accountIcon: 'arrow_left_alt' | 'arrow_right_alt' | 'forward' | 'reply_all';
  accountIconColor: 'red' | 'green';
  account: Account.Response;
  recipient: Recipient.Response;
  category: Category.Response;
  project: Project.Response;
  product: Product.Response;
  invoiceNumber: string;
  billingStartDate: string;
  billingEndDate: string;
  amount: number;
  remainingAmount: number;
  isDisabled: Observable<boolean>;

  constructor(private activatedRoute: ActivatedRoute, private dialogService: DialogService, private store: Store) { }

  get viewingAccount() {
    switch(this.transaction.transactionType) {
      case 'payment':
      case 'transfer':
      case 'loanTransfer': return this.transaction.account;
      case 'deferred':
      case 'reimbursement': return this.transaction.payingAccount.accountId === this.viewingAccountId ? this.transaction.payingAccount : this.transaction.ownerAccount;
      case 'split': return this.transaction.account.accountId === this.viewingAccountId ? this.transaction.account : this.transaction.deferredSplits[0].ownerAccount;
    }
  }

  get date() {
    return new Date(this.transaction.issuedAt);
  }

  get showYear() {
    return this.date.getFullYear() !== (new Date()).getFullYear();
  }

  get viewingAccountId() {
    return this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
  }

  get pathAccountId() {
    switch(this.transaction.transactionType) {
      case 'payment':
      case 'transfer':
      case 'split':
      case 'loanTransfer': return this.transaction.account.accountId;
      case 'deferred':
      case 'reimbursement': return this.transaction.payingAccount.accountId;
    }
  }

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectTransactionIsInProgress(this.transaction.transactionId));

    switch (this.transaction.transactionType) {
      case 'payment': {
        this.amount = this.transaction.amount;
        this.category = this.transaction.category;
        this.project = this.transaction.project;
        this.recipient = this.transaction.recipient;
        this.product = this.transaction.product;
        this.invoiceNumber = this.transaction.invoiceNumber;
        this.billingEndDate = this.transaction.billingEndDate;
        this.billingStartDate = this.transaction.billingStartDate;
      } break;
      case 'loanTransfer': {
        this.account = this.transaction.transferAccount;
        this.accountIcon = this.transaction.amount <= 0 ? 'arrow_left_alt' : 'arrow_right_alt';
        this.accountIconColor = this.transaction.amount >= 0 ? 'green' : 'red';
        this.amount = this.transaction.amount;
      } break;
      case 'transfer': {
        this.account = this.transaction.transferAccount;
        this.accountIcon = this.transaction.amount >= 0 ? 'arrow_left_alt' : 'arrow_right_alt';
        this.accountIconColor = this.transaction.amount >= 0 ? 'green' : 'red';
        this.amount = this.transaction.amount;
      } break;
      case 'deferred': {
        if (this.transaction.payingAccount.accountId === this.viewingAccountId) {
          this.account = this.transaction.ownerAccount;
          this.accountIcon = 'forward';
          this.accountIconColor = 'green';
        } else {
          this.account = this.transaction.payingAccount;
          this.accountIcon = 'reply_all';
          this.accountIconColor = 'red';
        }
        this.amount = this.transaction.payingAccount.accountId === this.viewingAccountId || this.viewingAccount.accountType === 'loan' ? this.transaction.amount : undefined;
        this.remainingAmount = this.transaction.remainingAmount;
        this.category = this.transaction.category;
        this.project = this.transaction.project;
        this.recipient = this.transaction.recipient;
        this.product = this.transaction.product;
        this.invoiceNumber = this.transaction.invoiceNumber;
        this.billingEndDate = this.transaction.billingEndDate;
        this.billingStartDate = this.transaction.billingStartDate;
      }break;
      case 'reimbursement': {
        if (this.transaction.payingAccount.accountId === this.viewingAccountId) {
          this.account = this.transaction.ownerAccount;
          this.accountIcon = 'forward';
          this.accountIconColor = 'green';
          this.amount = this.transaction.amount * -1;
        } else {
          this.account = this.transaction.payingAccount;
          this.accountIcon = 'reply_all';
          this.accountIconColor = 'red';
        }
        this.category = this.transaction.category;
        this.project = this.transaction.project;
        this.recipient = this.transaction.recipient;
        this.product = this.transaction.product;
        this.invoiceNumber = this.transaction.invoiceNumber;
        this.billingEndDate = this.transaction.billingEndDate;
        this.billingStartDate = this.transaction.billingStartDate;
      } break;
      case 'split': {
        if (this.transaction.account.accountId === this.viewingAccountId) {
          this.amount = this.transaction.amount;
          this.remainingAmount = this.transaction.deferredSplits?.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.remainingAmount;
          }, 0);
          this.accountIconColor = 'green';
        } else {
          this.account = this.transaction.account;
          this.accountIcon = 'reply_all';
          this.accountIconColor = 'red';
          if (this.viewingAccount.accountType === 'loan') {
            this.amount = this.transaction.deferredSplits.reduce((accumulator, currentValue) => {
              return accumulator + currentValue.amount;
            }, 0);
          } else {
            this.remainingAmount = this.transaction.deferredSplits?.reduce((accumulator, currentValue) => {
              return accumulator + currentValue.remainingAmount;
            }, 0);
          }
        }
        this.recipient = this.transaction.recipient;
      } break;
    }
  }

  delete() {
    this.dialogService.openDeleteTransactionDialog().afterClosed()
      .subscribe(shouldDelete => {
        console.log(shouldDelete);
        if (shouldDelete) {
          this.store.dispatch(transactionApiActions.deleteTransactionInitiated({
            transactionId: this.transaction.transactionId,
          }));
        }
      });
  }
}
