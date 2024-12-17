import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { take } from 'rxjs';
import { selectProjects } from '@household/web/state/project/project.selector';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { selectRecipients } from '@household/web/state/recipient/recipient.selector';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { Store } from '@ngrx/store';
import { selectCategories } from '@household/web/state/category/category.selector';
import { selectAccounts } from '@household/web/state/account/account.selector';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { productApiActions } from '@household/web/state/product/product.actions';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectIsInProgress } from '@household/web/state/progress/progress.selector';
import { messageActions } from '@household/web/state/message/message.actions';

@Component({
  selector: 'household-transaction-edit',
  templateUrl: './transaction-edit.component.html',
  styleUrls: ['./transaction-edit.component.scss'],
  standalone: false,
})
export class TransactionEditComponent implements OnInit {
  formType: string;

  accounts = this.store.select(selectAccounts);
  projects = this.store.select(selectProjects);
  recipients = this.store.select(selectRecipients);
  categories = this.store.select(selectCategories);
  isInProgress = this.store.select(selectIsInProgress);

  constructor(private activatedRoute: ActivatedRoute, private store: Store) { }

  @HostListener('window:keydown.meta.s', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    event.preventDefault();
    this.isInProgress.pipe(take(1)).subscribe((value) => {
      if (!value) {
        this.onSubmit();
      }
    });
  }

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    const transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;

    if (transactionId) {
      this.store.dispatch(transactionApiActions.getTransactionInitiated({
        accountId,
        transactionId,
      }));
    }

    this.activatedRoute.paramMap.subscribe((params) => {
      this.formType = params.get('formType');
    });

    this.store.dispatch(accountApiActions.listAccountsInitiated());
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
    this.store.dispatch(productApiActions.listProductsInitiated());
    this.store.dispatch(projectApiActions.listProjectsInitiated());
    this.store.dispatch(recipientApiActions.listRecipientsInitiated());
    this.store.dispatch(transactionApiActions.listDeferredTransactionsInitiated({
      isSettled: false,
    }));

  }

  onSubmit() {
    this.store.dispatch(messageActions.submitTransactionEditForm());
  }
}
