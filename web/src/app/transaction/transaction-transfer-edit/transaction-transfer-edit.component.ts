import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { toTransferResponse } from '@household/web/operators/to-transfer-response';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { messageActions } from '@household/web/state/message/message.actions';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { selectDeferredTransactionList, selectTransaction } from '@household/web/state/transaction/transaction.selector';
import { Actions, ofType } from '@ngrx/effects';
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

  constructor(public activatedRoute: ActivatedRoute, private destroyRef: DestroyRef, private store: Store, private actions: Actions) { }

  ngOnInit(): void {
    const accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Account.Id;
    const transactionId = this.activatedRoute.snapshot.paramMap.get('transactionId') as Transaction.Id;

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

    if (transactionId) {
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
          const paymentIds = transaction.payments.map(p => p.transaction.transactionId);

          return [
            ...deferredTransactions.filter(d => !paymentIds.includes(d.transactionId)),
            ...transaction.payments.map(p => ({
              ...p.transaction,
              remainingAmount: p.transaction.remainingAmount + p.amount,
            })),
          ];
        }),
      );

      transaction.subscribe((transaction) => {
        this.form.patchValue({
          amount: transaction.amount,
          account: transaction.account,
          description: transaction.description,
          issuedAt: new Date(transaction.issuedAt),
          transferAccount: transaction.transferAccount,
        });

        this.payments = transaction.payments.map(p => ({
          ...p,
          transaction: {
            ...p.transaction,
            remainingAmount: p.transaction.remainingAmount + p.amount,
          },
        }));
      });
    }

    this.actions.pipe(
      ofType(messageActions.submitTransactionEditForm),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
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

        if (transactionId) {
          this.store.dispatch(transactionApiActions.updateTransferTransactionInitiated({
            transactionId,
            request,
          }));
        } else {
          this.store.dispatch(transactionApiActions.createTransferTransactionInitiated(request));
        }
      }
    });

    this.store.select(selectAccountById(accountId)).pipe(takeFirstDefined())
      .subscribe((account) => {
        this.form.patchValue({
          account,
        });
      });

    combineLatest([
      this.form.controls.account.valueChanges,
      this.form.controls.transferAccount.valueChanges,
    ]).subscribe(([
      account,
      transferAccount,
    ]) => {
      this.form.controls.transferAmount.reset();

      if (account && transferAccount && account.currency !== transferAccount.currency) {
        this.form.controls.transferAmount.setValidators(Validators.required);
      } else {
        this.form.controls.transferAmount.removeValidators(Validators.required);
      }
    });
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

}
