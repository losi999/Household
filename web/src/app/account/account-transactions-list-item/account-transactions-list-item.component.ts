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

  showYear: boolean;
  transferColor: 'red' | 'green';
  payingAccount: Account.Response;
  ownerAccount: Account.Response;
  givingAccount: Account.Response;
  receivingAccount: Account.Response;
  recipient: Recipient.Response;
  category: Category.Response;
  project: Project.Response;
  product: Product.Response;
  invoiceNumber: string;
  billingStartDate: string;
  billingEndDate: string;
  quantity: number;
  amount: number;
  remainingAmount: number;
  isDisabled: Observable<boolean>;
  viewingAccount: Account.Response;
  formType: 'payment' | 'income' | 'split' | 'loan' | 'transfer';

  constructor(private activatedRoute: ActivatedRoute, private dialogService: DialogService, private store: Store) { }

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectTransactionIsInProgress(this.transaction.transactionId));
    this.showYear = !this.transaction.issuedAt.startsWith(new Date().getFullYear()
      .toString());
    const viewingAccountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;

    switch (this.transaction.transactionType) {
      case 'payment': {
        this.viewingAccount = this.transaction.account;
        this.formType = this.transaction.amount >= 0 ? 'income' : 'payment';
        this.amount = this.transaction.amount;
        this.category = this.transaction.category;
        this.project = this.transaction.project;
        this.recipient = this.transaction.recipient;
        this.product = this.transaction.product;
        this.quantity = this.transaction.quantity;
        this.invoiceNumber = this.transaction.invoiceNumber;
        this.billingEndDate = this.transaction.billingEndDate;
        this.billingStartDate = this.transaction.billingStartDate;
      } break;
      case 'transfer': {
        this.formType = 'transfer';
        this.viewingAccount = this.transaction.account;
        if (this.transaction.amount >= 0) {
          this.givingAccount = this.transaction.transferAccount;
        } else {
          this.receivingAccount = this.transaction.transferAccount;
        }
        this.transferColor = this.transaction.amount >= 0 ? 'green' : 'red';
        this.amount = this.transaction.amount;
      } break;
      case 'deferred': {
        this.formType = 'loan';
        if (this.transaction.payingAccount.accountId === viewingAccountId) {
          this.viewingAccount = this.transaction.payingAccount;
          this.ownerAccount = this.transaction.ownerAccount;
        } else {
          this.viewingAccount = this.transaction.ownerAccount;
          this.payingAccount = this.transaction.payingAccount;
        }
        this.amount = this.transaction.payingAccount.accountId === viewingAccountId || this.viewingAccount.accountType === 'loan' ? this.transaction.amount : undefined;
        this.remainingAmount = this.transaction.remainingAmount;
        this.category = this.transaction.category;
        this.project = this.transaction.project;
        this.recipient = this.transaction.recipient;
        this.product = this.transaction.product;
        this.quantity = this.transaction.quantity;
        this.invoiceNumber = this.transaction.invoiceNumber;
        this.billingEndDate = this.transaction.billingEndDate;
        this.billingStartDate = this.transaction.billingStartDate;
      } break;
      case 'reimbursement': {
        this.formType = 'loan';
        if (this.transaction.payingAccount.accountId === viewingAccountId) {
          this.viewingAccount = this.transaction.payingAccount;
          this.ownerAccount = this.transaction.ownerAccount;
          this.amount = this.transaction.amount;
        } else {
          this.viewingAccount = this.transaction.ownerAccount;
          this.payingAccount = this.transaction.payingAccount;
        }
        this.category = this.transaction.category;
        this.project = this.transaction.project;
        this.recipient = this.transaction.recipient;
        this.product = this.transaction.product;
        this.quantity = this.transaction.quantity;
        this.invoiceNumber = this.transaction.invoiceNumber;
        this.billingEndDate = this.transaction.billingEndDate;
        this.billingStartDate = this.transaction.billingStartDate;
      } break;
      case 'split': {
        this.formType = 'split';
        if (this.transaction.account.accountId === viewingAccountId) {
          this.viewingAccount = this.transaction.account;
          this.amount = this.transaction.amount;
          this.remainingAmount = this.transaction.deferredSplits?.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.remainingAmount;
          }, 0);
        } else {
          this.viewingAccount = this.transaction.deferredSplits[0].ownerAccount;
          this.payingAccount = this.transaction.account;
          if (this.viewingAccount.accountType === 'loan') {
            this.amount = this.transaction.deferredSplits.reduce((accumulator, currentValue) => {
              return accumulator - currentValue.amount;
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
        if (shouldDelete) {
          this.store.dispatch(transactionApiActions.deleteTransactionInitiated({
            transactionId: this.transaction.transactionId,
          }));
        }
      });
  }
}
