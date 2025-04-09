import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { toTransferResponse } from '@household/web/operators/to-transfer-response';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectDeferredTransactionList, selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map } from 'rxjs';

@Component({
  selector: 'household-transaction-transfer-edit',
  templateUrl: './transaction-transfer-edit.component.html',
  styleUrl: './transaction-transfer-edit.component.scss',
  standalone: false,
})
export class TransactionTransferEditComponent implements OnInit {
  isDownwardTransfer = true;

  form: FormGroup<{
    issuedAt: FormControl<Date>;
    amount: FormControl<number>;
    account: FormControl<Account.Response>;
    description: FormControl<string>;
    transferAccount: FormControl<Account.Response>;
    transferAmount: FormControl<number>;
  }>;

  paymentAmount: FormControl<number>;
  payments: (Transaction.Amount & {
    transaction: Transaction.DeferredResponse;
  })[];

  availableDeferredTransactions = this.store.select(selectDeferredTransactionList());

  transactionId: Transaction.Id;

  constructor(public activatedRoute: ActivatedRoute, private store: Store) { }

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    this.transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;

    this.store.dispatch(accountApiActions.listAccountsInitiated());
    this.store.dispatch(transactionApiActions.listDeferredTransactionsInitiated({
      isSettled: false,
    }));

    this.form = new FormGroup({
      issuedAt: new FormControl(new Date(), [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
      account: new FormControl(null, [Validators.required]),
      description: new FormControl(),
      transferAccount: new FormControl(null, [Validators.required]),
      transferAmount: new FormControl(null),
    });

    this.paymentAmount = new FormControl(null, [
      Validators.required,
      Validators.min(0),
    ]);

    this.payments = [];

    if (this.transactionId) {
      this.store.dispatch(transactionApiActions.getTransactionInitiated({
        accountId,
        transactionId: this.transactionId,
      }));

      const transaction = this.store.select(selectTransaction).pipe(
        takeFirstDefined(),
        toTransferResponse(),
      );

      this.availableDeferredTransactions = combineLatest([
        transaction,
        this.store.select(selectDeferredTransactionList()),
      ]).pipe(
        filter(([
          transaction,
          deferredTransactions,
        ]) => !!transaction && !!deferredTransactions),
        map(([
          transaction,
          deferredTransactions,
        ]) => {
          if (transaction.payments?.length > 0) {
            const paymentIds = transaction.payments.map(p => p.transaction.transactionId);

            return [
              ...deferredTransactions.filter(d => !paymentIds.includes(d.transactionId)),
              ...transaction.payments.map(p => ({
                ...p.transaction,
                remainingAmount: p.transaction.remainingAmount + p.amount,
              })),
            ];
          }

          return deferredTransactions;
        }),
      );

      transaction.subscribe((transaction) => {
        this.isDownwardTransfer = transaction.account.accountType !== 'loan' && transaction.amount < 0;

        this.form.patchValue({
          amount: transaction.amount,
          account: transaction.account,
          description: transaction.description,
          issuedAt: new Date(transaction.issuedAt),
          transferAccount: transaction.transferAccount,
        });

        this.payments = transaction.payments?.map(p => ({
          ...p,
          transaction: {
            ...p.transaction,
            remainingAmount: p.transaction.remainingAmount + p.amount,
          },
        })) ?? [];
      });
    } else {
      this.store.select(selectAccountById(accountId)).pipe(takeFirstDefined())
        .subscribe((account) => {
          this.form.patchValue({
            account,
          });
        });
    }

    /*combineLatest([
      this.form.controls.account.valueChanges,
      this.form.controls.transferAccount.valueChanges,
    ]).subscribe(([
      account,
      transferAccount,
    ]) => {
      console.log('curr', account?.currency, transferAccount?.currency, account?.currency !== transferAccount?.currency);
      this.form.controls.transferAmount.reset();

      if (account && transferAccount && account.currency !== transferAccount.currency) {
        console.log('A');
        this.form.controls.transferAmount.setValidators(Validators.required);
      } else {
        console.log('B');
        this.form.controls.transferAmount.removeValidators(Validators.required);
      }
    });*/
  }

  inverseTransaction() {
    this.isDownwardTransfer = !this.isDownwardTransfer;
  }

  addPayment(transaction: Transaction.DeferredResponse) {
    if (this.paymentAmount.valid) {

      this.payments = [
        ...this.payments,
        {
          transaction,
          amount: this.paymentAmount.value,
        },
      ];

      this.paymentAmount.reset();
    }
  }

  deletePayment(transactionId: Transaction.Id) {
    this.payments = this.payments.filter(p => p.transaction.transactionId !== transactionId);
  }

  save() {
    console.log('submit transfer');

    this.form.markAllAsTouched();

    console.log(this.form);

    if (this.form.valid) {
      const request: Transaction.TransferRequest = {
        accountId: this.form.value.account.accountId,
        amount: this.form.value.amount,
        description: this.form.value.description ?? undefined,
        issuedAt: this.form.value.issuedAt.toISOString(),
        transferAccountId: this.form.value.transferAccount.accountId,
        payments: this.payments.length > 0 ? this.payments.map(p => ({
          amount: p.amount,
          transactionId: p.transaction.transactionId,
        })) : undefined,
        transferAmount: this.form.value.transferAmount ?? undefined,
      };

      if (this.transactionId) {
        this.store.dispatch(transactionApiActions.updateTransferTransactionInitiated({
          transactionId: this.transactionId,
          request,
        }));
      } else {
        this.store.dispatch(transactionApiActions.createTransferTransactionInitiated(request));
      }
    }
  }

}
